
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/route";
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";

async function GET(req:NextRequest){

    const session = await getServerSession(authOptions);
    console.log("User id: " ,session?.user.id);
    const res = await prismaClient.user.findFirst({
        where:{
            id : session?.user.id as string
        },
        select:{
            displayName : true
        }
    })
    if(res){
        return  NextResponse.json({
            displayName : res.displayName
        })
    }else{
        return NextResponse.json({
            error : "my details error"
        })
    }

}

export {GET as GET, GET as POST}