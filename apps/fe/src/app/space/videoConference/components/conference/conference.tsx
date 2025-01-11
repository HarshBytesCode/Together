'use client'

import { useContexts } from '@/app/space/context/context';
import React, { useEffect, useState } from 'react';
import Video from './video';

function Conference({isToggled}: any) {

  const [users, setusers] = useState<{}[]>([]);
  const { rtcHandler } = useContexts();

  function updateUsers(newUser: any) {
    console.log("update", newUser);
    
    setusers((prev) => [...prev, newUser])
  }

  useEffect(() => {
    
    rtcHandler.on('newVideoProducer', updateUsers)
  
    return () => {
      rtcHandler.off('newVideoProducer', updateUsers)
    }
  }, [])
  


    

  return (
    <div className={` ${isToggled ? "fixed w-full top-0 left-0 h-[94%]": "hidden"} border border-red-700 bg-black/60 rounded-md backdrop-blur overflow-hidden flex`}>
        <div 
        className='w-full grid grid-cols-4 grid-rows-3 gap-6 border border-green-700 justify-center items-center p-5'>
          {users.map((user:any, index) => (
            <Video stream={user.stream} key={index} index={index} />
          ))}
        </div>
    </div>
  )
}

export default Conference