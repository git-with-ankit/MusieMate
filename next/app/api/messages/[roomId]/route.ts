import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    try {
        const messages = await prismaClient.chats.findMany({
            where: { roomId },
            orderBy: { sentOn: 'asc' },
            include: {
                sentByrel: {
                    select: { displayName: true }
                }
            }
        });
        return NextResponse.json(messages.map(msg => ({
            id: msg.id,
            content: msg.message,
            sender: msg.sentByrel?.displayName || 'Unknown',
            senderId: msg.sentBy,
            sentOn: msg.sentOn
        })));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
} 