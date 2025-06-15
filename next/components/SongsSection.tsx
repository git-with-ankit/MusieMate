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
    const videoPlayerRef = useRef<HTMLDivElement>(null);
    const urlRef = useRef<HTMLInputElement>(null);
    const playerRef = useRef<any>(null);
    const [url,setUrl] = useState("");
    const [currentVideo , setCurrentVideo] = useState<Video | null>(null);

    useEffect(()=>{
        setVideo();
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
         setCurrentVideo(data.stream);
        
    }

    
   

    return (
        <div className="flex-col border border-gray-800 rounded-lg relative">
            <div className="text-white p-5 border-b-2 border-gray-800 flex justify-center mb-[25px]">Music Section</div>
            <div className="m-4"><Input placeholder="Paste youtube link of the song or video" className="text-white bg-neutral-950" ref={urlRef}></Input></div>
            <div className="flex justify-center"><Button className="mb-[25px] text-white bg-slate-800" onClick={()=>setUrl(urlRef?.current?.value!)}>Play</Button></div>
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