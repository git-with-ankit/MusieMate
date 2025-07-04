"use client"
import Appbar from "@/components/Appbar";
import Chat from "@/components/Chat";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { createContext } from "react";
import SongsSection from "@/components/SongsSection";
import { Button } from "@/components/ui/button";
import { participantsContext } from "./participantsContext";

interface Participant {
    id: string;
    name: string | null;
    displayName: string | null;
    email: string;
}
interface contextType {
    getParticipants: () => void;
}

function RoomPageContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('roomId');
    const session = useSession();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [roomDetails, setRoomDetails] = useState<{ name: string } | null>(null);
    const [displayName,setDisplayName] = useState("");

    async function getMyDetails() {
        try{
            const res = await fetch(`/api/my`);
            if (!res.ok) {
                throw new Error('Failed to fetch your details');
            }
            const data = await res.json();
            setDisplayName(data.displayName);
        }catch(e){
            console.log("There was a problem while fetching your display name.")
        }
    }

    async function getParticipants() {
        try {
            console.log("Calling to get participants for roomId : ", roomId);
            const response = await fetch(`/api/participants`,{
                method : "POST",
                body:JSON.stringify({
                    roomId : roomId
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch room details');
            }
            const data = await response.json();
            setRoomDetails({ name: data.name });
            setParticipants(data.participants);
        } catch (error) {
            console.error("Error fetching room details:", error);
        }
    }

    useEffect(()=>{
        getMyDetails();
        getParticipants();

        return ()=>{
            console.log("component unmounted")
            clearUser();
        }
    },[]);

    async function clearUser(){
        await fetch("/api/clearRoomUser"); 
    }

    async function copyId() {
        await navigator.clipboard.writeText(roomId!);
        alert("Room Id copied to clipboard!")
    }

    if (!roomId) {
        return <div>No room ID provided</div>;
    }

    return (
        <div className="min-h-screen w-full bg-neutral-950 antialiased">
            <Suspense fallback={null}>
                <Appbar />
            </Suspense>
            <div className="grid grid-cols-4 gap-3 p-4">
                <Suspense fallback={null}>
                    <SongsSection displayName={displayName}></SongsSection>
                </Suspense>
                <div className="col-span-2 border border-gray-800 rounded-lg overflow-hidden">
                    {roomDetails && (
                        <div className="flex justify-center items-center p-4 border-b border-gray-800">
                            <h2 className="text-xl text-white font-semibold">Welcome to {roomDetails.name}</h2>
                        </div>
                    )}
                    <participantsContext.Provider value={{getParticipants }}>
                        <Chat 
                        roomId={roomId} 
                        displayName={displayName}
                    />
                    </participantsContext.Provider>
                    
                </div>
                <div className="text-white p-4 border border-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-center">Room-Mates</h3>
                    <div className="space-y-2">
                        {participants.map((participant) => (
                            <div 
                                key={participant.id} 
                                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-900"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-200">
                                    {participant.displayName || participant.name || participant.email}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center"><Button className="my-4 bg-purple-600 mx-auto cursor-pointer" onClick={copyId}>Copy Room Id</Button></div>
                </div>
            </div>
            <BackgroundBeams />
        </div>
    );
}

export default function Main() {
    return (
        <Suspense fallback={null}>
            <RoomPageContent />
        </Suspense>
    );
}