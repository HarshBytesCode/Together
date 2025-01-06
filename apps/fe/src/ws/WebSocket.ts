import { MainScene } from "@/app/space/phaser/scene/SpaceScene";
import { RtcHandler } from "@/rtc/rtcHandler";


export class WebSocketHandler{

    private static instance: WebSocketHandler;
    private socket: WebSocket | null = null;
    private scene: MainScene;
    private n: string = (Math.floor(Math.random()*100)).toString();
    private rtcHandler: RtcHandler;

    constructor(scene: MainScene) {
        this.scene = scene;
        this.rtcHandler = RtcHandler.getInstance(WebSocketHandler.instance)

    }

    public static getInstance(scene: MainScene) {

        if(!WebSocketHandler.instance) {
            WebSocketHandler.instance = new WebSocketHandler(scene)
        }

        return WebSocketHandler.instance;
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
            console.log("mess", event);
            
            const parshedData = JSON.parse(event.data)
            console.log(parshedData);
            
            if(parshedData.type == "rtpCapabilities") {
                
                this.rtcHandler.loadDevice(parshedData.rtpCapabilities)
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
            payload
        }))
    }

    

}