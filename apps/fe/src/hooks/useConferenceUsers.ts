'use client'
import { useState } from "react";


export const useConferenceUsers = () => {

    const [conferenceUsers, setConferenceUsers] = useState<{
        id: string,
        stream: any
    }[]>([]);

    function addConferenceUser(newUser: any) {
        setConferenceUsers(newUser)
    }

    return { conferenceUsers, addConferenceUser};
}
