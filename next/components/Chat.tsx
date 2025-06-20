"use client"
import { useContext, useEffect, useRef, useState } from "react";
import { participantsContext } from "@/app/room/page";
import { useSession } from "next-auth/react";

interface Message {
    content: string;
    sender: string;
    isOwn: boolean;
}

export default function Chat(props: { roomId: string, displayName: string }) {
    const { data: session } = useSession();
    const context = useContext(participantsContext);
    const getParticipants = context?.getParticipants;
    const [messages, setMessages] = useState<Message[]>([{
        content: "You have entered the chat application",
        sender: "System",
        isOwn: false
    }]);
    const wsRef = useRef<WebSocket | null>(null);
    const messageRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("Attempting to connect to WebSocket...");
        const ws = new WebSocket("ws://localhost:8080");
        
        ws.onopen = () => {
            console.log("WebSocket connection established");
            ws.send(JSON.stringify({
                type: "join",
                payload: {
                    roomId: props.roomId,
                    displayName: props.displayName
                }
            }));
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
           
            console.log("WebSocket connection closed:", event.code, event.reason);
           
        };
        
        ws.onmessage = (e) => {
            console.log("Message received:", e.data);
            const parsedMessage = JSON.parse(e.data);
            console.log("Parsed message received by ws client : ",parsedMessage)
            if(parsedMessage.sender){
                setMessages(m => [...m, {
                    content: parsedMessage.content,
                    sender: parsedMessage.sender,
                    isOwn: false
                }]);
            } else if(parsedMessage.type === "Someone left" || parsedMessage.type === "Someone joined") {
                getParticipants?.();
            }
        };
        
        wsRef.current = ws;

        return () => {
            console.log("Cleaning up WebSocket connection...");
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
                {/*clearRoom();*/}
            }
        }
    }, [props.roomId, props.displayName]);

    useEffect(() => {
        // Fetch messages from API on mount
        async function fetchMessages() {
            try {
                const res = await fetch(`/api/messages/${props.roomId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages([
                        {
                            content: "You have entered the chat application",
                            sender: "System",
                            isOwn: false
                        },
                        ...data.map((msg: any) => ({
                            content: msg.content,
                            sender: msg.sender, // displayName
                            isOwn: msg.senderId === session?.user?.id // compare senderId
                        }))
                    ]);
                }
            } catch (e) {
                // fallback: do nothing
            }
        }
        fetchMessages();
    }, [props.roomId, props.displayName, session?.user?.id]);

    async function clearRoom(){
        const res = await fetch(`/api/clearRoomUser`);
        if(!res.ok){
            console.log("Something went wrong");
        }
    }

    const sendMessage = async () => {
        const message = messageRef.current?.value;
        if (message && session?.user?.id) {
            setMessages(m => [...m,{
                content : message,
                sender : props.displayName,
                isOwn : true
            }]);
            wsRef.current?.send(JSON.stringify({
                type: 'chat',
                payload: {
                    content: message,
                    sender: props.displayName
                }
            }));
            // Persist to DB
            try {
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId: props.roomId,
                        content: message,
                        senderId: session.user.id
                    })
                });
            } catch (e) {
                // Optionally handle error
            }
            messageRef.current!.value = "";
        }
    };

    return (
        <div className='h-screen flex flex-col bg-neutral-950'>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {messages.map((message, index) => (
                    <div key={`${message.content}-${index}`} 
                         className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                            {!message.isOwn && message.sender !== "System" && (
                                <div className="text-sm text-gray-600 mb-1 ml-1">
                                    {message.sender}
                                </div>
                            )}
                            <div className={`rounded-lg px-4 py-2 overflow-hidden ${
                                message.isOwn 
                                    ? 'bg-purple-600 text-white rounded-br-none' 
                                    : message.sender === "System"
                                        ? 'bg-gray-200 text-gray-700'
                                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                                {message.content}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className=' p-4 border-t border-gray-200'>
                <div className='sticky bottom-40 flex gap-2'>
                    <input 
                        ref={messageRef}
                        className='flex-1 p-3 rounded-full border text-white border-gray-300 focus:outline-none focus:border-purple-500'
                        placeholder="Type a message..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage();
                            }
                        }}
                    />
                    <button 
                        onClick={sendMessage}
                        className='bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors'
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}