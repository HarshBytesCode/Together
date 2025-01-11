import { WebSocketHandler } from "@/ws/WebSocket";
import { Device, types } from "mediasoup-client";
import { EventEmitter } from 'events';

export class RtcHandler extends EventEmitter{

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
        super();
        this.wsHandler = ws;
        this.device = new Device();

    }


    async loadDevice(routerRtpCapabilities: types.RtpCapabilities) {
        
        await this.device.load({routerRtpCapabilities: routerRtpCapabilities})
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
        
        this.recvTransport = this.device.createRecvTransport({

            id: data.recieverTransport.transportId,
            iceCandidates: data.recieverTransport.iceCandidates,
            iceParameters: data.recieverTransport.iceParameters,
            dtlsParameters: data.recieverTransport.dtlsParameters

        })

        this.sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await this.wsHandler.connectProducerTransport(dtlsParameters);
                callback()
                
            } catch (error: any) {
                console.log("Error connecting send Transport.", error);
                errback(error)
            }


        })
        
        this.recvTransport.on('connect', async ( { dtlsParameters }, callback, errback) => {
            try {
                this.wsHandler.connectConsumerTransport(dtlsParameters)
                callback()
                
            } catch (error: any) {
                console.log("Error connecting receive transport.", error);
                errback(error)
            }
        })

        this.sendTransport.on('produce', async ( {kind, rtpParameters}, callback, errback) => {
            
            try {
                this.wsHandler.Produce({
                    transportId: this.sendTransport.id,
                    kind,
                    rtpParameters
                })
    
                callback({id: this.sendTransport.id})
                
            } catch (error) {
                console.log("Error producing send Transport.", error);
                
            }
            
        })




    }

    async consume(data: any) {
        
        const consumedVideo = await this.recvTransport.consume({
            id: data.id,
            producerId: data.producerId,
            rtpParameters: data.rtpParameters,
            kind: data.kind,

        })
        const stream = new MediaStream();
        stream.addTrack(consumedVideo.track)

        this.emit("newVideoProducer", {
            stream
        })

    }

    async produceVideo() {

        try {

            await new Promise<void>((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (this.sendTransport) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
    
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = stream.getVideoTracks()[0];
    
            await this.sendTransport.produce({
                track: videoTrack,
                encodings: [
                    { maxBitrate: 100000 },
                ],
                codecOptions: {
                    videoGoogleStartBitrate: 1000,
                },
            });
    
        } catch (error) {
            console.error("Error producing video track:", error);
        }
    }
    

}