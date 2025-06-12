import { prismaClient } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { roomId: string } }
) {
    try {
        const roomId = await params.roomId
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId
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

        return NextResponse.json({
            name: room.name,
            participants: room.joinedUsersrel
        });
    } catch (error) {
        console.error("Error fetching room details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 