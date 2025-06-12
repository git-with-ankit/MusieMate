import { prismaClient } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextResponse } from "next/server";

 async function GET(){
    const session = await getServerSession(authOptions);
    const userId = session?.user.id as string;
    try {
        await prismaClient.user.update({
        where:{
            id : userId
        },
        data:{
            currentRoomId : null
        }
        })
        return NextResponse.json({
            message : "Done"
        })
    }catch(e){
        return NextResponse.json({
            "Error" : e
        })
    }
 }

 export{GET as GET , GET as POST}