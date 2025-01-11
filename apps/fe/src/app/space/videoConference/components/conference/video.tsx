'use client'


import React, { useEffect, useRef } from 'react'

function Video({stream, index}: any) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {

        if(stream && videoRef.current) {

            videoRef.current.srcObject = stream;
            
        }

    }, [stream])
    
  return (
    <video
    ref={videoRef}
    key={index}
    autoPlay
    className=' rounded-xl'
    />
  )
}

export default Video