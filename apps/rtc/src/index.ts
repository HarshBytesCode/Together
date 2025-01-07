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
        console.log(this.socket, "hee");
        
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
                    const rtpCapabilites = this.router.rtpCapabilities

                    this.socket.send(JSON.stringify({
                        type: "rtpCapabilities",
                        rtpCapabilites,
                        spaceId: parshedData.spaceId,
                        userId: parshedData.userId
                    }))
                    break;

                case "CREATE_TRANSPORT":
                    
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
                            transpordId: producerTransport.id,
                            iceCandidates: producerTransport.iceCandidates,
                            iceParameters: producerTransport.iceParameters,
                            dtlsParameters: producerTransport.dtlsParameters
                        },
                        recieverTransport: {
                            transpordId: recieverTransport.id,
                            iceCandidates: recieverTransport.iceCandidates,
                            iceParameters: recieverTransport.iceParameters,
                            dtlsParameters: recieverTransport.dtlsParameters
                        }
                    }))

                    for(const [producerTransport] of space.users) {
                        this.socket.send(JSON.stringify({
                            spaceId: parshedData.spaceId,
                            userId: parshedData.userId,
                            type: "NEW_PRODUCER",
                            producerId: producerTransport.id,
                            kind: producerTransport.kind,
                        }))
                    }

                    break;

                case 'CONNECTPRODUCER':
                    const space2 = this.spaces.get(parshedData.spaceId);
                    const user = space2.users.get(parshedData.userId);

                    user.producerTransport.connect({dtlsParameters: parshedData.dtlsParameters})
                    break;
                case 'CONNECTCONSUMER':
                    const space3 = this.spaces.get(parshedData.spaceId);
                    const user2 = space3.users.get(parshedData.userId);

                    user2.recieverTransport.connect({dtlsParameters: parshedData.dtlsParameters})
                    break;

                case "CONSUME":

                    const space4 = this.spaces.get(parshedData.spaceId);
                    const user3 = space3.users.get(parshedData.userId);

                    const consumer = user3.recieverTransport.consume({
                        producerId: parshedData.producerId,
                        kind: parshedData.kind,
                        rtpCapabilites: parshedData.rtpCapabilites
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