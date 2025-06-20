"use client"
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import Appbar from "@/components/Appbar";
import { CardSpotlightDemo } from "@/components/CardSpotlight";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function Dashboard() {
  const router = useRouter();
  return (

    <div className="min-h-screen w-full bg-neutral-950 antialiased">
     <div className="max-h-6 pt-0.5 mb-[200px]"> <Suspense fallback={null}><Appbar/></Suspense></div>
      <div className="max-w-2xl mx-auto p-4 relative flex flex-col justify-center items-center">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Dashboard
        </h1>
        <p></p>
        <div className="mt-5 flex justify-center items-center gap-10">
            <Button className="cursor-pointer mt-5 text-white bg-slate-800" onClick={()=>{router.push("/create-room")}}>Create Room</Button>
            <Button className="cursor-pointer mt-5 text-white bg-slate-800" onClick={()=>{router.push("/join-room")}}>Join Room</Button>
        </div>
        <div className="mt-10 bg-slate-600">
            <CardSpotlightDemo />
        </div>
      </div>
      <BackgroundBeams />
      

    </div>
  );
}
