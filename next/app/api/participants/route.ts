
import { prismaClient } from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";

async function POST(req:NextRequest){

    try {
        const data = await req.json();
        const roomId = data.roomId;
        console.log("getting details for roomId: ",roomId);
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId as string
            },
            include: {
                joinedUsersrel: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        console.log("room name : ", room.name,"participants: ", room.joinedUsersrel)
        return NextResponse.json({
            name: room.name,
            participants: room.joinedUsersrel
        });
    } catch (error) {
        console.error("Error fetching room details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export {POST as POST, POST as GET}