import { prismaClient } from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const data = await req.json();
    try{
        const room = await prismaClient.room.findFirst({
            where:{
                id : data.roomId
            }
        });
        if(!room){
            return NextResponse.json({
                message : "No room Found"
            })
        }
        await prismaClient.user.update({
            where:{
                id : data.userId
            },
            data:{
                displayName: data.displayName,
                currentRoomId : room.id
            }
        })
        return NextResponse.json({
            roomId : room.id
        })
    }catch(error){
        return NextResponse.json({
            "error" : error
        }, {status : 500})
    }
    
    
}