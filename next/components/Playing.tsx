import { useEffect, useRef } from "react";
//@ts-ignore
import YoutubePlayer from "youtube-player"

interface Video {
    id : string;
    title : string;
    url : string;
    extractedId : string;
    smallImg : string;
    bigImg : string;
    active : boolean;
    userId : string;
    roomId : string;

}

interface PlayingProps {
    currentVideo: Video;
}

export default function Playing({ currentVideo }: PlayingProps) {
    const videoPlayerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if(!videoPlayerRef.current || !currentVideo) {
            return;
        }

        let player = YoutubePlayer(videoPlayerRef.current);
        player.loadVideoById(currentVideo.extractedId);
        player.playVideo();

        return ()=> {
            player.destroy();
        };
    },[videoPlayerRef,currentVideo])


    return (
        <>
            <div className="w-full aspect-video" ref={videoPlayerRef}></div>
        </>
    )
}