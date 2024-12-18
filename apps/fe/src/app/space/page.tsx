'use client'

import Phaser from 'phaser'
import React, { useEffect, useRef } from 'react'
import { MainScene } from './phaser/scene/SpaceScene'

function Space() {

    const spaceRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(spaceRef) {
            
            const config = {
              type: Phaser.AUTO,
              width: 1800,
              height: 820,
              parent: spaceRef.current,
              scene: MainScene,
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
        <div ref={spaceRef} className='' />
    </div>
  )
}

export default Space