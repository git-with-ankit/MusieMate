import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from "redis";


const client = createClient();
client.on("error",(err)=>console.log("Redis client error: ", err));

async function startRedisServer() {
    try{
        await client.connect();
        console.log("Connected to redis");
    }catch(err){
        console.log("Failed to connect to redis: ",err);
    }
}

startRedisServer();

const wss = new WebSocketServer({port:8080},()=>{
    console.log("Ws server started on port 8080")
})

interface User {
    socket: WebSocket;
    roomId: string;
    displayName: string;
}

let allSockets: User[] = [];

wss.on("connection", function(socket: WebSocket) {
    console.log("user connected");

    socket.addEventListener("message", (event) => {
        console.log("message received by ws server: ", event.data);
        const parsedMessage = JSON.parse(event.data.toString());
        console.log("Parsed message : ",parsedMessage)
        if (parsedMessage.type === "join") {
            console.log("The all sockets list looks like this :", allSockets);
            allSockets.push({
                socket,
                roomId: parsedMessage.payload.roomId,
                displayName: parsedMessage.payload.displayName
            });
            for(let i=0;i< allSockets.length ; i++){
                if(allSockets[i].roomId === parsedMessage.payload.roomId && allSockets[i].socket !== socket){
                    allSockets[i].socket.send(JSON.stringify({type : "Someone joined"}))
                }
            }
        }   

        if(parsedMessage.type === "chat") {
            console.log("The all sockets list looks like this :", allSockets);
            console.log("Parsed message : ",parsedMessage)
            const currentUser = allSockets.find((x) => x.socket === socket);
            if(currentUser) {
                const messageToSend = JSON.stringify({
                    content: parsedMessage.payload.content,
                    sender: currentUser.displayName
                });
                
                for(let i = 0; i < allSockets.length; i++) {
                    if(allSockets[i].roomId === currentUser.roomId && allSockets[i].socket !== socket) {
                        allSockets[i].socket.send(messageToSend);
                    }
                }
            }
        }
    });

    socket.addEventListener("close", () => {
        let roomId;
        for(let i=0;i<allSockets.length;i++){
            if(allSockets[i].socket === socket){
                roomId = allSockets[i].roomId;
            }
        }
        allSockets = allSockets.filter(x => x.socket !== socket);
        if(roomId){
            for(let i=0;i< allSockets.length ; i++){
                if(allSockets[i].roomId === roomId ){
                    allSockets[i].socket.send(JSON.stringify({type : "Someone left"}))
                }
            }
        }
        
        
    });
});