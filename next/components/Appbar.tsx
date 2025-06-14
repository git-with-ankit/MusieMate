"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button";
import { Music } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Appbar() {
    const session = useSession();
    const router = useRouter()
    const handleSignOut = async () => {
        await fetch("/api/clearRoomUser");
        signOut({callbackUrl:"/"});
    }
    return (
        <div className="flex justify-between px-5 py-5">
           
                <div className="flex justify-center items-center relative z-10 text-lg md:text-2xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">MusieMate
                    <Music className="ml-2 text-white"></Music>
                </div>
            
                <div>
                    <Button className="cursor-pointer text-white bg-slate-800" onClick={handleSignOut}>Sign Out</Button>
              
                 </div>
    </div>
    );
}
