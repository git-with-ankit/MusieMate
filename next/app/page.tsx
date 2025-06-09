"use client"
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from 'react';





export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }


  const handleSignIn = () => {
    try {
      console.log("Sign in clicked");
      signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
   
    <div className="min-h-screen h-[40rem] w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      
      <div className="max-w-2xl mx-auto p-4 ">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          MusieMate
        </h1>
        <p></p>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          Groove together. Chat together.
        </p>
        
        <div className="mt-5 flex justify-center items-center">
         
          <Button 
            type="button"
            onClick={handleSignIn}
            className="text-white cursor-pointer bg-slate-800 hover:bg-slate-700"
          >
            Sign In
          </Button>
        </div>
         
      </div>
      <BackgroundBeams />
    </div>
  );
}
