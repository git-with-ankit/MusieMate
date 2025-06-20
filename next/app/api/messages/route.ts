import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { roomId, content, senderId } = await req.json();
        if (!roomId || !content || !senderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const message = await prismaClient.chats.create({
            data: {
                roomId,
                message: content,
                sentBy: senderId,
            },
            include: {
                sentByrel: {
                    select: { displayName: true }
                }
            }
        });
        return NextResponse.json({
            id: message.id,
            content: message.message,
            sender: message.sentByrel?.displayName || 'Unknown',
            sentOn: message.sentOn
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
} 