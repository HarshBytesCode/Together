'use client'

import { useConferenceUsers } from '@/hooks/useConferenceUsers'
import React from 'react'

function Conference({isToggled}: any) {

    const { conferenceUsers } = useConferenceUsers();

  return (
    <div className={` ${isToggled ? "fixed top-0 left-0 h-[80%]": "hidden"} `}>
        <div 
        id='conference-video'
        className='grid col-span-4'>
            {conferenceUsers.map((user) => (
                <video src={user.stream} autoPlay />
            ))}
        </div>
    </div>
  )
}

export default Conference