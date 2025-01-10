'use client'

import Phaser from 'phaser'
import React, { useEffect, useRef } from 'react'
import { MainScene } from './phaser/scene/SpaceScene'
import UtilBar from './videoConference/utilBar'
import { ContextProvider } from './context/context'

function Space() {

    const spaceRef = useRef<HTMLDivElement>(null);
    const handler = MainScene.getInstance();

    useEffect(() => {
        if(spaceRef) {
            
            const config = {
              type: Phaser.AUTO,
              width: window.innerWidth,
              height: window.innerHeight * 0.94,
              parent: spaceRef.current,
              scene: handler,
              render: {pixelArt: true},
              physics: {
                default: "arcade",
                arcade: {
                    debug: true
                }
              }
      
            }
            new Phaser.Game(config);

        }
    }, [])
    

  return (
    <div>
        <div ref={spaceRef} className=' rounded-md' />
        <ContextProvider wsHandler={handler.wsHandler} rtcHandler={handler.rtcHandler} >
          <UtilBar/>
        </ContextProvider>
    </div>
  )
}

export default Space