import { RtcHandler } from "@/rtc/rtcHandler";
import { WebSocketHandler } from "@/ws/WebSocket";
import { createContext, useContext } from "react";

interface ContextType{
    wsHandler: WebSocketHandler,
    rtcHandler: RtcHandler
}

interface ContextProviderType extends ContextType {
    children: React.ReactNode
}

const contexts = createContext< ContextType | null>(null);


export const useContexts = () => {

    const context = useContext(contexts);
    if(!context) throw new Error("No socket or rtc available.")

    return context;
}

export const ContextProvider = ({ wsHandler, rtcHandler, children}: ContextProviderType ) => {
    return (
        <contexts.Provider value={{wsHandler, rtcHandler}}>
            {children}
        </contexts.Provider>
    )
}