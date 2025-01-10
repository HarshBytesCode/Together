'use client'
import React, { useState } from 'react';
import VideoBtn from './components/videoBtn';
import ToggleVideoView from './components/toggleVideo';
import Conference from './components/conference/conference';


function UtilBar() {

  const [isToggled, setIsToggled] = useState(false);

  return (
    <div>
      <div
      className=' fixed flex items-center bottom-0 left-0 h-[6%] bg-[#175676] w-full px-2 '
      >
          <ToggleVideoView isToggled={isToggled} setIsToggled={setIsToggled} />
          <VideoBtn/>
      </div>

      <Conference isToggled = {isToggled}/>
    </div>
  )
}

export default UtilBar