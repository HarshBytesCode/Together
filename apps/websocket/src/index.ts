import {WebSocket, WebSocketServer} from "ws";
import { ChangePosition, JoinSpace } from "./handlers/messageHandler";


export enum MessageType {
    JOIN_SPACE = "JOIN_SPACE",
    CHANGE_POSITION = "CHANGE_POSITION",
    USER_LEFT = "USER_LEFT",
    MEDIASOUP = "MEDIASOUP",
    RTPCAPABILITIES = "rtpCapabilities",
    CREATE_TRANSPORT = "CREATE_TRANSPORT",
    TRANSPORT_CREATED = "TRANSPORT_CREATED",
    CONNECTPRODUCER = "CONNECTPRODUCER",
    CONNECTCONSUMER = "CONNECTCONSUMER",
    NEW_PRODUCER = "NEW_PRODUCER",
    CONSUME= "CONSUME",
    CONSUMER_CREATED = "CONSUMER_CREATED",
    PRODUCE = "PRODUCE"
}

interface MessageDataType {

    name: string
    userId: string,
    spaceId: string,
    type: MessageType,

}


class WebSocketService {

    private mediasoupWs!: WebSocket;
    private spaces: Map<string, {users: { 
        userDetails: {name: string, userId: string},
        ws: WebSocket
    }[]}> = new Map();

    constructor() {

        const wss = new WebSocketServer({port: 8081});
        this.initialize(wss)
        
    }

    private initialize(wss: WebSocketServer) {

        wss.on('connection', (ws) => {
            
            let spaceId = null;
            let userId = null;
            this.handleConnection({spaceId, ws, userId})
        })

    }

    private handleConnection({spaceId, ws, userId}: any) {

        ws.on('close', () => {
            console.log("closed", spaceId);
            const space = this.spaces.get(spaceId)

            space?.users.map((user, i) => {

                if(user.ws == ws) {
                    space.users.slice(i, 1);

                } else {
                    console.log("message send fro mbe");
                    
                    user.ws.send(JSON.stringify({
                        type: "USER_LEFT",
                        userId: userId
                    }))
                }
                
            })
        })

        ws.on('message', (data: string) => {
            const parsedData: any = JSON.parse(data);
            console.log(parsedData);
            
            switch (parsedData.type) {

                case MessageType.MEDIASOUP:
                    
                    if(!this.mediasoupWs) {
                        this.mediasoupWs = ws;
                    }
                    
                    break;
                
                case MessageType.CREATE_TRANSPORT:

                    this.mediasoupWs.send(JSON.stringify({
                        type: parsedData.type,
                        spaceId,
                        userId
                    }))
                    break;

                case MessageType.CONNECTPRODUCER:
                case MessageType.CONNECTCONSUMER:
                case MessageType.PRODUCE:
                case MessageType.CONSUME:

                    this.mediasoupWs.send(JSON.stringify({
                        ...parsedData,
                        spaceId,
                        userId
                    }))
                    break;

                case MessageType.JOIN_SPACE:

                    JoinSpace({
                        data: parsedData,
                        ws,
                        spaces: this.spaces,
                    })

                    this.mediasoupWs.send(JSON.stringify({
                        type: "getRtpCapabilities",
                        spaceId: parsedData.spaceId,
                        userId: parsedData.userId
                    }))
    
                    spaceId = parsedData.spaceId
                    userId = parsedData.userId
                    break;

                case MessageType.CHANGE_POSITION:

                    ChangePosition({
                        data: parsedData,
                        spaces: this.spaces,
                        ws
                    });
                    break;

                case MessageType.RTPCAPABILITIES:
                case MessageType.TRANSPORT_CREATED:
                case MessageType.CONSUMER_CREATED:

                    const space = this.spaces.get(parsedData.spaceId)
                    space?.users.map((user) => {
                        if(user.userDetails.userId == parsedData.userId) {
                            user.ws.send(JSON.stringify({
                                ...parsedData
                            }))
                        }
                    })
                    break;

                case MessageType.NEW_PRODUCER:

                    const space2 = this.spaces.get(parsedData.spaceId)
                    space2?.users.map((user) => {
                            user.ws.send(JSON.stringify({
                                ...parsedData
                            }))
                    })
                    break;

                default:
                    break;

            }
            
        })
        
    }
}

new WebSocketService()