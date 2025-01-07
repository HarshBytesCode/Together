import { WebSocketHandler } from "@/ws/WebSocket";
import { LoadFiles } from "../utils/loadFiles";
import { AddCamera } from "../utils/camera";
import { AddKeys } from "../utils/addKeys";
import { createAnimation } from "../utils/createAnimation";
import { PerformAnimation } from "../utils/performAnimation";
import { RtcHandler } from "@/rtc/rtcHandler";


export class MainScene extends Phaser.Scene {

    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private player!: Phaser.Physics.Arcade.Sprite;
    private wallsLayer!: Phaser.Tilemaps.TilemapLayer
    private wsHandler: WebSocketHandler;
    private rtcHandler: RtcHandler;
    private users: {
        player: Phaser.Physics.Arcade.Sprite,
        userData: {
            name: string,
            userId: string
        }
    }[] = [];
    private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: {
        W: Phaser.Input.Keyboard.Key,
        A: Phaser.Input.Keyboard.Key,
        S: Phaser.Input.Keyboard.Key,
        D: Phaser.Input.Keyboard.Key,
    }

    constructor() {

        super({key: "MainScene"})
        this.wsHandler = WebSocketHandler.getInstance(this);
        this.rtcHandler = RtcHandler.getInstance(this.wsHandler);

    }
    
    
    preload() {
        LoadFiles(this.load)  
    }
    
    create() {

        // Later

        this.map = this.make.tilemap({key: "map", tileWidth: 16, tileHeight: 16 });
        this.tileset = this.map.addTilesetImage('castle', 'tiles')!;

        this.map.createLayer("Tile Layer 1", this.tileset);

        this.wallsLayer = this.map.createLayer("walls", this.tileset)!;
        this.wallsLayer.setCollisionByProperty({ collide: true });
        this.map.createLayer("objects", this.tileset);

        this.player = this.physics.add.sprite(100, 100, "char");
        this.player.setCollideWorldBounds(true)
        this.player.setFrame(1)
        this.physics.add.collider(this.player, this.wallsLayer);


        if(this.input.keyboard) {
            this.cursor = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys({
                W: Phaser.Input.Keyboard.KeyCodes.W,
                A: Phaser.Input.Keyboard.KeyCodes.A,
                S: Phaser.Input.Keyboard.KeyCodes.S,
                D: Phaser.Input.Keyboard.KeyCodes.D,
            }) as {
                W: Phaser.Input.Keyboard.Key,
                A: Phaser.Input.Keyboard.Key,
                S: Phaser.Input.Keyboard.Key,
                D: Phaser.Input.Keyboard.Key,
            }

        }

        AddCamera({
            cameras: this.cameras,
            player: this.player
        })

        createAnimation(this.anims)


        // Don't put this up in the order.
        this.wsHandler.connect();

    }

    
    addUser(userData: any) {
        
        const player = this.physics.add.sprite(100 ,100, "char");
        player.setFrame(1)
        
        this.users.push({
            player,
            userData
        })
            
    }

    removeUser(userId: any) {
        
        this.users.map((user, i) => {

            if(user.userData.userId == userId) {
                user.player.destroy();
                this.users.splice(i, 1);  
            }

        })
    }

    update() {
        
        PerformAnimation({
            player: this.player,
            cursor: this.cursor,
            wsHandler: this.wsHandler,
            keys: this.keys
        })
        
    }
    
    changePlayerPostion(data: any) {
        
        const speed = 160;
        this.users.map((user) => {
            
            if(user.userData.userId == data.user.userId) {
                if(data.direction == "RIGHT") {
                    user.player.setVelocityX(speed)
                    user.player.anims.play("walkRight", true)  
                }
                if(data.direction == "LEFT") {
                    user.player.setVelocityX(-speed);
                    user.player.anims.play("walkLeft", true)    
                }
                if(data.direction == "UP") { 
                    user.player.setVelocityY(-speed)
                    user.player.anims.play("walkUp", true)  
                }
                if(data.direction == "DOWN") {
                    user.player.setVelocityY(speed)
                    user.player.anims.play("walkDown", true)  
                }

                user.player.x = data.x,
                user.player.y = data.y
                user.player.setVelocity(0);
                
            }

        })
        
    }

}