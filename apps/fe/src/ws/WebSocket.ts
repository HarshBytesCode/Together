import { MainScene } from "@/app/space/phaser/scene/SpaceScene";


export class WebSocketHandler{

    private socket: WebSocket | null = null;
    private scene: MainScene;
    private n: string = (Math.floor(Math.random()*10)).toString()

    constructor(scene: MainScene) {
        this.scene = scene;

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

    

}