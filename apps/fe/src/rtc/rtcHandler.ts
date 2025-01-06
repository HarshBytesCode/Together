import { WebSocketHandler } from "@/ws/WebSocket";
import { Device, types } from "mediasoup-client"


export class RtcHandler {

    private static instance: RtcHandler;
    private device: Device;
    private sendTransport!: types.Transport;
    private recvTransport!: types.Transport;
    private wsHandler: WebSocketHandler;


    public static getInstance(ws: WebSocketHandler) {
        if(!RtcHandler.instance) {
            RtcHandler.instance = new RtcHandler(ws);

        }
        return RtcHandler.instance;
    }

    constructor(ws: WebSocketHandler) {
        this.wsHandler = ws;
        this.device = new Device();

    }


    async loadDevice(routerRtpCapabilities: types.RtpCapabilities) {
        
        await this.device.load({routerRtpCapabilities})
    }

    async initializeTransport(data: any) {

        this.sendTransport = this.device.createSendTransport({

            id: data.id,
            iceCandidates: data.iceCandidates,
            iceParameters: data.iceParameters,
            dtlsParameters: data.dtlsParameters

        })

        this.sendTransport.on('connect', async ({ dtlsParameters }, callbackify, errback) => {
            
            

        })

        this.sendTransport.on( 'produce', async ( {kind, rtpParameters}, callbackify, errback) => {

        })

        this.recvTransport = this.device.createRecvTransport({

            id: data.id,
            iceCandidates: data.iceCandidates,
            iceParameters: data.iceParameters,
            dtlsParameters: data.dtlsParameters

        })

        this.recvTransport.on('connect', async ( { dtlsParameters }, callbackify, errback) => {

        })


        
    }


}