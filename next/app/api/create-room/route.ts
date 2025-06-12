import { prismaClient } from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const data = await req.json();
    try{
        const room = await prismaClient.room.create({
            data:{
                name : data.roomName,
                creatorId : data.creatorId
            }
        });
        await prismaClient.user.update({
            where:{
                id : data.creatorId
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