package main

import (
	"DisasterNet/internal/p2p"
	"bufio"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	pubsub "github.com/libp2p/go-libp2p-pubsub"
)

type IncomingMsg struct {
	Message  string `json:"message"`
	UserType string `json:"userType"` // "team" or "civilian"
}

type DisplayMessage struct {
	Content   string    `json:"content"`
	Sender    string    `json:"sender"`
	UserType  string    `json:"userType"`
	Timestamp time.Time `json:"timestamp"`
}

var MessageArr []DisplayMessage
var messageMu sync.Mutex

var cr *p2p.ChatRoom

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func StoreMessage(msg DisplayMessage) {
	messageMu.Lock()
	defer messageMu.Unlock()
	MessageArr = append(MessageArr, msg)
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Only Get Method supported", http.StatusBadRequest)
		return
	}

	messageMu.Lock()
	messages := make([]DisplayMessage, len(MessageArr))
	copy(messages, MessageArr)
	messageMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(messages)
	if err != nil {
		http.Error(w, "failed to encode messages", http.StatusInternalServerError)
		return
	}
}

func PostMessage(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Only POST Method supported", http.StatusBadRequest)
		return
	}

	var msg_post IncomingMsg
	err := json.NewDecoder(r.Body).Decode(&msg_post)
	if err != nil || msg_post.Message == "" {
		http.Error(w, "failed to decode", http.StatusBadRequest)
		return
	}

	// Create a structured message with user type information
	messageWithType := map[string]interface{}{
		"content":   msg_post.Message,
		"userType":  msg_post.UserType,
		"timestamp": time.Now().Unix(),
	}

	messageBytes, err := json.Marshal(messageWithType)
	if err != nil {
		http.Error(w, "failed to encode message", http.StatusInternalServerError)
		return
	}

	err_pub := cr.Publish(string(messageBytes))

	// Store the message locally for immediate display
	displayMsg := DisplayMessage{
		Content:   msg_post.Message,
		Sender:    getSenderName(msg_post.UserType),
		UserType:  msg_post.UserType,
		Timestamp: time.Now(),
	}
	StoreMessage(displayMsg)

	if err_pub != nil {
		fmt.Println("Sending message failed trying again...")
		http.Error(w, "failed to publish", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func getSenderName(userType string) string {
	if userType == "team" {
		return "NDRF Team"
	}
	return "Civilian"
}

func main() {
	port := flag.String("port", "", "port")
	nickFlag := flag.String("nick", "", "nickname to use in chat. will be generated if empty")
	roomFlag := flag.String("room", "chat-room", "name of chat room to join")
	httpServerRun := flag.Bool("enable-http", false, "run http server on this node")
	sameNetworkString := flag.String("same_string", "", "same_string")

	flag.Parse()
	h, _, err1 := p2p.CreateHost(*port)

	if err1 != nil {
		log.Fatal("error creating the host")
	}

	ctx := context.Background()

	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		panic(err)
	}
	peerChan := p2p.InitMDNS(h, *sameNetworkString)

	go func() {
		for {
			peer := <-peerChan
			if peer.ID > h.ID() {
				fmt.Println("Found peer:", peer, " id is greater than us, wait for it to connect to us")
				continue
			}
			fmt.Println("Discovered new peer via mDNS:", peer.ID, peer.Addrs)

			if err := h.Connect(ctx, peer); err != nil {
				fmt.Println("Connection failed:", err)
				continue
			}

			log.Println("Connection to the peer found through MDNS has been established")
			log.Println("Peer Id:", peer.ID, "Peer Addrs: ", peer.Addrs)
		}
	}()

	nick := *nickFlag
	if len(nick) == 0 {
		nick = "ABHI"
	}

	room := *roomFlag

	cr, err = p2p.JoinChatRoom(ctx, ps, h.ID(), nick, room)
	if err != nil {
		panic(err)
	}

	if *httpServerRun {
		go func() {
			http.HandleFunc("/send", PostMessage)
			http.HandleFunc("/messages", GetMessages)
			
			log.Printf("Starting HTTP server on port 3001")
			err := http.ListenAndServe(":3001", nil)
			if err != nil {
				log.Fatal(err)
			}
		}()
	}

	f, err := os.OpenFile("logs.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal("error opening logs.txt")
	}

	// Read incoming messages from P2P network
	go func() {
		for msg := range cr.Messages {
			// Try to parse the message as JSON to extract user type
			var parsedMsg map[string]interface{}
			var displayMsg DisplayMessage
			
			if json.Unmarshal([]byte(msg.Message), &parsedMsg) == nil {
				// It's a structured message with user type
				content, _ := parsedMsg["content"].(string)
				userType, _ := parsedMsg["userType"].(string)
				
				displayMsg = DisplayMessage{
					Content:   content,
					Sender:    getSenderName(userType),
					UserType:  userType,
					Timestamp: time.Now(),
				}
			} else {
				// It's a plain text message (legacy or terminal input)
				displayMsg = DisplayMessage{
					Content:   msg.Message,
					Sender:    msg.SenderNick,
					UserType:  "unknown",
					Timestamp: time.Now(),
				}
			}

			StoreMessage(displayMsg)

			text := fmt.Sprintf("Received message at %s from %s (%s): %s\n", 
				time.Now().Local(), displayMsg.Sender, displayMsg.UserType, displayMsg.Content)
			fmt.Print(text)
			
			_, err_log := f.WriteString(text)
			if err_log != nil {
				log.Fatal("error writing logs..")
				continue
			}
		}
	}()

	fmt.Println("Sending test message...")
	reader := bufio.NewReader(os.Stdin)
	err = cr.Publish("Hello from " + h.ID().String())
	if err != nil {
		fmt.Println("Error publishing:", err)
	}
	
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			log.Fatal(err)
		}

		err_pub := cr.Publish(line)

		if err_pub != nil {
			fmt.Println("Sending message failed trying again...")
			cr.Publish(line)
			continue
		}
	}
}