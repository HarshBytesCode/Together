import * as mediasoup from 'mediasoup';
import os from 'os';

function getLocalIPv4Address() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === "IPv4" && !iface.internal) {
            return iface.address;
          }
        }
      }
    }

    // CHECKKKK
    return undefined;
}

class RTC {

    private worker!: mediasoup.types.Worker;
    private router!: mediasoup.types.Router;
    private socket!: WebSocket;
    private spaces = new Map();
    
    constructor() {
        this.socket = new WebSocket('ws://localhost:8081');
        
    }
    
    async initialize() {  

        if(!this.socket) console.log("nooo");
        console.log(this.socket.readyState);
        
        
        this.socket.onopen = () => {
            
            this.socket.send(JSON.stringify({
                type: "MEDIASOUP"
            }))

        }
        this.socket.onclose = () => {
            
        }

        this.socket.onerror = (error) => {
            console.log(error);
            
        }

        this.socket.onmessage = async(data: MessageEvent) => {

            const parshedData = await JSON.parse(data.data)
            console.log(parshedData);
            
            switch(parshedData.type) {

                case "getRtpCapabilities":
                    const rtpCapabilities = this.router.rtpCapabilities

                    this.socket.send(JSON.stringify({
                        type: "rtpCapabilities",
                        rtpCapabilities,
                        spaceId: parshedData.spaceId,
                        userId: parshedData.userId
                    }))
                    break;

                case "CREATE_TRANSPORT":

                    try {
                        const producerTransport = await this.router.createWebRtcTransport({
                            listenIps: [{
                                ip: "0.0.0.0",
                                announcedIp: getLocalIPv4Address()
                            }],
                            enableUdp: true,
                            enableTcp: true,
                            preferUdp: true
                        })
    
                        const recieverTransport = await this.router.createWebRtcTransport({
                            listenIps: [{
                                ip: "0.0.0.0",
                                announcedIp: getLocalIPv4Address()
                            }],
                            enableUdp: true,
                            enableTcp: true,
                            preferUdp: true
                        })
    
                        const spaceExist = await this.spaces.get(parshedData.spaceId);
    
                        if(!spaceExist) {
                            this.spaces.set(parshedData.spaceId, {
                                users: new Map()
                            })
                        }
    
                        const space = await this.spaces.get(parshedData.spaceId);
    
                        space.users.set(parshedData.userId, {
                            producerTransport,
                            recieverTransport
                        })
    
                        this.socket.send(JSON.stringify({
    
                            type: "TRANSPORT_CREATED",
                            spaceId: parshedData.spaceId,
                            userId: parshedData.userId,
                            producerTransport: {
                                transportId: producerTransport.id,
                                iceCandidates: producerTransport.iceCandidates,
                                iceParameters: producerTransport.iceParameters,
                                dtlsParameters: producerTransport.dtlsParameters
                            },
                            recieverTransport: {
                                transportId: recieverTransport.id,
                                iceCandidates: recieverTransport.iceCandidates,
                                iceParameters: recieverTransport.iceParameters,
                                dtlsParameters: recieverTransport.dtlsParameters
                            }
                        
                        }))

                    } catch (error) {
                        console.log("Error creating transport.", error);
                        
                    }
                    

                    
                    break;
                    
                case 'CONNECTPRODUCER':

                    try {
                        const space2 = this.spaces.get(parshedData.spaceId);
                        const user = space2.users.get(parshedData.userId);
                        console.log("reach");
                        
                        await user.producerTransport.connect({dtlsParameters: parshedData.dtlsParameters})
                        
                    } catch (error) {
                        console.log("Error in connecting producer.", error);
                        
                    }

                    break;

                case 'PRODUCE':
                    try {
                        
                        const space5 = this.spaces.get(parshedData.spaceId);
                        const user4 = space5.users.get(parshedData.userId);                      
                        const producer = await user4.producerTransport.produce({
                            kind: parshedData.kind,
                            rtpParameters: parshedData.rtpParameters
                        })

                        this.socket.send(JSON.stringify({
                            type: "NEW_PRODUCER",
                            spaceId: parshedData.spaceId,
                            userId: parshedData.userId,
                            producerId: producer.id,
                            kind: producer.kind,
                        }))
                    } catch (error) {
                        console.log("Error in producing.", error);
                        
                    }
                        
                case 'CONNECTCONSUMER':
                    try {
                        const space3 = this.spaces.get(parshedData.spaceId);
                        const user2 = space3.users.get(parshedData.userId);
                        console.log(user2);
                        
                        await user2.recieverTransport.connect({dtlsParameters: parshedData.dtlsParameters})
                        
                    } catch (error) {
                        console.log("Error in connecting consumer.", error);
                        
                    }
                    break;

                case "CONSUME":
                    try {
                        const space4 = this.spaces.get(parshedData.spaceId);
                        const user3 = space4.users.get(parshedData.userId);
    
                        const consumer = await user3.recieverTransport.consume({
                            producerId: parshedData.producerId,
                            kind: parshedData.kind,
                            rtpCapabilities: parshedData.rtpCapabilities
                        })
    
                        
                        this.socket.send(JSON.stringify({
                            type: "CONSUMER_CREATED",
                            id: consumer.id,
                            producerId: parshedData.producerId,
                            rtpParameters: consumer.rtpParameters,
                            kind: consumer.kind,
                            userId: parshedData.userId,
                            spaceId: parshedData.spaceId
                        }))
                        
                    } catch (error) {
                        console.log("Error during consuming.", error);
                        
                    }


                    break;
            }

        }

        this.initializeMediaSoup()
        
        
    }

    private async initializeMediaSoup() {

        try {
            
            this.worker = await mediasoup.createWorker({
                logLevel: "debug",
                rtcMinPort: 10000,
                rtcMaxPort: 10100,
            })
    
            this.router = await this.worker.createRouter({
                mediaCodecs: [
                    {
                        kind: 'audio',
                        mimeType: 'audio/opus',
                        clockRate: 48000,
                        channels: 2
                    },
                    {
                        kind: 'video',
                        mimeType: "video/VP8",
                        clockRate: 90000,
                        parameters: { 'x-google-start-bitrate': 1000 }
                    }
                ]
            })
        } catch (error) {
            console.log("Error in mediasoup");
            
        }

    }
}

( async() => {
    console.log("runnn");
    
    const rtc = new RTC();
    await rtc.initialize()
})()