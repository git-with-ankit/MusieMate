import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/lib/util";
import { prismaClient } from "@/lib/db";

const createStreamSchema = z.object({
    creatorId : z.string(),
    url : z.string(),
    roomId : z.string()
});

export async function POST(req:NextRequest) {
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user.id){
            return NextResponse.json({
                message : "Unauthorized"
            })
        }
        const user = session.user;
        const data = createStreamSchema.parse(await req.json());

        if(!data.url.trim()){
            return NextResponse.json({
                message : "Youtube Link cannot be empty."
            })
        }

        const isYt = data.url.match(YT_REGEX);
        const videoId = data.url ? data.url.match(YT_REGEX)?.[1] : null;
        if (!isYt || !videoId) {
          return NextResponse.json(
            {
              message: "Invalid YouTube URL format",
            },
            {
              status: 400,
            },
          );
        }
        const res = await youtubesearchapi.GetVideoDetails(videoId);
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) =>
            a.width < b.width ? -1 : 1,
          );

        const stream = await prismaClient.streams.create({
            data:{
                url : data.url,
                playedBy : data.creatorId,
                extractedId : videoId,
                title : res.title ?? "Title cannot be found.",
                bigImg : thumbnails[thumbnails.length-1].url ?? "https://imgs.search.brave.com/PdZLaibqYEin1UA4t9NTRDjNbjN8NtMIiZ1iw1mUmBA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzEyLzI5LzYzLzg0/LzM2MF9GXzEyMjk2/Mzg0NzdfY0VBRDcy/OWc1Tzc0eE1nM2p4/b20wWDFWZVBZMnRP/WTIuanBn",
                roomId : data.roomId

            }
        })
        return NextResponse.json({
            stream
        })
    }catch(e){
        console.error(e);
        return NextResponse.json({
            message : "There was an error while adding the stream."
        })
    }
}