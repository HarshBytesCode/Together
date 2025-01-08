import { MainScene } from "@/app/space/phaser/scene/SpaceScene";
import { RtcHandler } from "@/rtc/rtcHandler";
import { DtlsParameters } from "mediasoup-client/lib/types";


export class WebSocketHandler{

    private static instance: WebSocketHandler;
    private socket: WebSocket | null = null;
    private scene: MainScene;
    private n: string = (Math.floor(Math.random()*100)).toString();
    private rtcHandler!: RtcHandler;

    constructor(scene: MainScene) {
        this.scene = scene;
    }

    public static getInstance(scene: MainScene) {

        if(!WebSocketHandler.instance) {
            WebSocketHandler.instance = new WebSocketHandler(scene)
        }

        return WebSocketHandler.instance;
    }

    public setRtcHandler(rtcHandler: RtcHandler) {
        this.rtcHandler = rtcHandler;
    }

    connect() {

        this.socket = new WebSocket("ws://localhost:8081");

        this.socket.onopen = () => {

            this.socket?.send(JSON.stringify({

                userId: this.n,
                name: "Harsh",
                spaceId: "qwer",
                type: "JOIN_SPACE"

            }))
        }

        this.socket.onmessage = (event: MessageEvent) => { 
            
            const parshedData = JSON.parse(event.data)
            console.log(parshedData);
            
            if(parshedData.type == "rtpCapabilities") {
                
                this.rtcHandler.loadDevice(parshedData.rtpCapabilities)

                this.socket?.send(JSON.stringify({
                    type: "CREATE_TRANSPORT",
                }))

                
            }

            if(parshedData.type == "TRANSPORT_CREATED") {

                this.rtcHandler.initializeTransport(parshedData)

            }

            if(parshedData.type == "NEW_PRODUCER") {
                const capabilities = this.rtcHandler.getDeviceCapabilities()

                this.socket?.send(JSON.stringify({
                    type: "CONSUME",
                    producerId: parshedData.producerId,
                    kind: parshedData.kind,
                    rtpCapabilities: capabilities
                }))
            }

            if(parshedData.type == "CONSUMER_CREATED") {
                
                this.rtcHandler.consume(parshedData)
                
            }
            
            if(parshedData.type == "USER_JOINED") {

                this.scene.addUser(parshedData.user);
                
            }


            if(parshedData.type == "CHANGE_POSITION") {
                
                this.scene.changePlayerPostion(parshedData);
            }

            if(parshedData.type == "USER_LEFT") {
                
                this.scene.removeUser(parshedData.userId);

            }
        }

    }

    sendPosition({direction, x, y}: any) {

        this.socket?.send(JSON.stringify({
            type: "CHANGE_POSITION",
            spaceId: "qwer",
            direction,
            x,
            y,
            userId: this.n 
        }))
    }

    sendRtcData({type, payload}: any) {

        this.socket?.send(JSON.stringify({
            type,
            ...payload
        }))
    }

    async connectProducerTransport(dtlsParameters: DtlsParameters) {

        this.socket?.send(JSON.stringify({
            type: "CONNECTPRODUCER",
            dtlsParameters
        }))

    }

    async Produce({transportId, kind, rtpParameters}: any) {

        this.socket?.send(JSON.stringify({
            type: "PRODUCE",
            transportId,
            kind,
            rtpParameters

        }))
    }

    connectConsumerTransport(dtlsParameters: DtlsParameters) {
        this.socket?.send(JSON.stringify({
            type: "CONNECTCONSUMER",
            dtlsParameters
        }))
    }

    

}