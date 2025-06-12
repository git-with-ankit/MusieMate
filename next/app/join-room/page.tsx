"use client"
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import Appbar from "@/components/Appbar";
import { CardSpotlightDemo } from "@/components/CardSpotlight";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReactElement, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";



export default function JoinRoom() {
  const router = useRouter();
  const roomIdRef = useRef<HTMLInputElement | null>(null);
  const displayNameRef = useRef<HTMLInputElement | null>(null);
  const session = useSession();
  
  async function handleJoinRoom(){

    const res = await fetch("/api/join-room", {
        method: "POST",
        body: JSON.stringify({
            roomId: roomIdRef.current?.value,
            displayName: displayNameRef.current?.value,
            userId: session.data?.user.id
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
 
    const data = await res.json();
    if(data.roomId){
        console.log("roomId: ",data.roomId)
        router.push(`/room/?roomId=${data.roomId}`);
        
    }
    else{
      alert("No Rooms Found")
    }
  }
  return (

    <div className="min-h-screen w-full bg-neutral-950 antialiased">
      <div className="max-h-6 pt-0.5 mb-[200px]"><Appbar/></div>
      <div className="max-w-2xl mx-auto p-4 relative flex flex-col justify-center items-center">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Join Room
        </h1>
        <p></p>
        <div className="mt-10 flex justify-center items-center gap-10">
            
            <Card className="bg-neutral-950 w-[330px] h-[360px] border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="absolute inset-0 border border-slate-800/50 rounded-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              <div className="relative z-10">
                <CardContent>
                <div className="flex flex-col justify-center items-center">
                        <div className="text-white">Room Id</div>
                        <div className="m-[25px] text-white"><Input placeholder="Paste Room Id" ref={roomIdRef}></Input></div>
                        <div className="text-white">Display Name</div>
                         <div className="m-[25px] text-white"><Input placeholder="Enter your Display Name" ref={displayNameRef}></Input></div>
                </div>
            
            </CardContent>
          
                <div className="flex justify-center items-center"><Button className="m-[25px]" onClick={handleJoinRoom}>Join</Button></div>
           
            </div>
            </Card>
        </div>
        
       
      </div>
      <BackgroundBeams />
      

    </div>
  );
}
