import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button"
import { Input } from "./ui/input"

import { YT_REGEX } from "@/lib/util";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Playing from "./Playing";

interface Video {
    id : string;
    title : string;
    url : string;
    extractedId : string;
    smallImg : string;
    bigImg : string;
    active : boolean;
    userId : string;
    roomId : string;

}


export default function SongsSection(){
    const session = useSession();
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
  
    const urlRef = useRef<HTMLInputElement>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const [url,setUrl] = useState("");
    const [currentVideo , setCurrentVideo] = useState<Video | null>(null);

    // WebSocket connection for music synchronization
    useEffect(() => {
        if (!roomId || !session.data?.user?.id) return;

        console.log("Connecting to WebSocket for music sync...");
        const ws = new WebSocket("ws://localhost:8080");
        
        ws.onopen = () => {
            console.log("Music WebSocket connection established");
            ws.send(JSON.stringify({
                type: "join",
                payload: {
                    roomId: roomId,
                    displayName: session.data.user.name || session.data.user.email
                }
            }));
        };

        ws.onerror = (error) => {
            console.error("Music WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("Music WebSocket connection closed:", event.code, event.reason);
        };
        
        ws.onmessage = (e) => {
            console.log("Music message received:", e.data);
            const parsedMessage = JSON.parse(e.data);
            
            if (parsedMessage.type === "play_song") {
                console.log("Received play_song message:", parsedMessage.payload);
                setCurrentVideo(parsedMessage.payload);
         
            }
        };
        
        wsRef.current = ws;

        return () => {
            console.log("Cleaning up music WebSocket connection...");
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }
    }, [roomId, session.data?.user?.id]);

    useEffect(()=>{
        if(url) {
            setVideo();
        }
    },[url])
    

    async function setVideo(){
        console.log("Started");
        
        const res = await fetch("/api/stream",{
            method : "POST",
            body : JSON.stringify({
                creatorId : session.data?.user.id,
                roomId : roomId,
                url : url
            }),
            headers:{
                'Content' : 'Application/json'
            },
            credentials:"include"
        })
        const data = await res.json();
        
        if(urlRef.current){
            urlRef.current.value="";
        }
        
        // Set the current video locally
        setCurrentVideo(data.stream);
        
        // Send the play_song message to all other users in the room
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "play_song",
                
                payload: data.stream
            }));
        }
    }

    function play(){
        if(url == urlRef?.current?.value!){
            alert("Cannot play the same video in a row.");
            if(urlRef.current){
                urlRef.current.value="";
            }
            return ;
        }
        setUrl(urlRef?.current?.value!);
    }
    
   

    return (
        <div className="flex-col border border-gray-800 rounded-lg relative">
            <div className="text-white p-5 border-b-2 border-gray-800 flex justify-center mb-[25px]">Music Section</div>
            <div className="m-4"><Input placeholder="Paste youtube link of the song or video" className="text-white bg-neutral-950" ref={urlRef}></Input></div>
            <div className="flex justify-center"><Button className="mb-[25px] text-white bg-slate-800" onClick={play}>Play</Button></div>
            {currentVideo && (
                <>
                    <div className='p-4 my-4 text-white'>Now Playing: {currentVideo?.title}</div>
                    <div className='sticky w-full overflow-hidden bg-neutral-950 border-t border-gray-800'>
                        <Playing currentVideo={currentVideo} />
                    </div>
                </>
            )}
        </div>
    )
}