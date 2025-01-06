import * as mediasoup from 'mediasoup';

class RTC {
    private worker!: mediasoup.types.Worker;
    private router!: mediasoup.types.Router;
    private socket!: WebSocket;
    
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