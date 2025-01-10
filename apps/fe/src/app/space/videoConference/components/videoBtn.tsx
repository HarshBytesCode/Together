'use client'

import { RtcHandler } from '@/rtc/rtcHandler';
import { Video, VideoOff } from 'lucide-react'
import React, { useState } from 'react'
import { useContexts } from '../../context/context';

function sendVideo(rtcHandler: RtcHandler) {
  
  rtcHandler.produceVideo()

}

function VideoBtn() {
  
    const { rtcHandler, wsHandler } = useContexts();
    const [isSharing, setIsSharing] = useState(false);


  return (
    <button className='flex items-center justify-center rounded-xl p-2 bg-[#6E9887] '
    onClick={() => {
      setIsSharing(!isSharing);
      sendVideo(rtcHandler);

    }}
    >
        {isSharing ? 
        <VideoOff/> : <Video/>}
    </button>
  )
}

export default VideoBtn