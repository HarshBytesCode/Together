'use client'

import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react'

function ToggleVideoView({isToggled, setIsToggled}: any) {

  return (
    <button className='flex items-center justify-center rounded-xl p-2 bg-[#37371F] '
    onClick={() => {
        setIsToggled(!isToggled);
        
    }}
    >
        {isToggled ? <ChevronUp/> : <ChevronDown/>}
    </button>
  )
}

export default ToggleVideoView