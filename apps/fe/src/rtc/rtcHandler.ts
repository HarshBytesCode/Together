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

    getDeviceCapabilities() {
        return this.device.rtpCapabilities
    }

    async initializeTransport(data: any) {

        this.sendTransport = this.device.createSendTransport({

            id: data.producerTransport.transportId,
            iceCandidates: data.producerTransport.iceCandidates,
            iceParameters: data.producerTransport.iceParameters,
            dtlsParameters: data.producerTransport.dtlsParameters

        })

        this.sendTransport.on('connect', async ({ dtlsParameters }, callbackify, errback) => {
            
            this.wsHandler.connectProducerTransport(dtlsParameters)

        })

        this.sendTransport.on( 'produce', async ( {kind, rtpParameters}, callbackify, errback) => {

        })

        this.recvTransport = this.device.createRecvTransport({

            id: data.recieverTransport.transportId,
            iceCandidates: data.recieverTransport.iceCandidates,
            iceParameters: data.recieverTransport.iceParameters,
            dtlsParameters: data.recieverTransport.dtlsParameters

        })

        this.recvTransport.on('connect', async ( { dtlsParameters }, callbackify, errback) => {

            this.wsHandler.connectConsumerTransport(dtlsParameters)
        })


    }



}