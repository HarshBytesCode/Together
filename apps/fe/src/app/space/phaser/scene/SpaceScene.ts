import { WebSocketHandler } from "@/ws/WebSocket";


export class MainScene extends Phaser.Scene {

    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private player!: Phaser.Physics.Arcade.Sprite;
    private wallsLayer!: Phaser.Tilemaps.TilemapLayer
    private wsHandler: WebSocketHandler;
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
        this.wsHandler = new WebSocketHandler(this);

    }
    
    
    preload() {

        this.load.image("tiles", "/tiles/castle.png");
        this.load.tilemapTiledJSON("map", "/maps/map3.json");
        this.load.spritesheet("char", "/sprites/ch1.png", {
            frameWidth: 32,
            frameHeight: 32
        })
        
    }
    
    create() {

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

        // Look into thiss
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
        
        // const camera = this.cameras.main;
        // camera.startFollow(this.player)
        // camera.setZoom(2)

        this.anims.create({
            key: "walkLeft",
            frames: this.anims.generateFrameNumbers("char", {start: 8, end: 11}),
            frameRate: 10,
        })
        this.anims.create({
            key: "walkRight",
            frames: this.anims.generateFrameNumbers("char", {start: 12, end: 15}),
            frameRate: 10,
        })
        this.anims.create({
            key: "walkUp",
            frames: this.anims.generateFrameNumbers("char", {start: 4, end: 7}),
            frameRate: 10,
        })
        this.anims.create({
            key: "walkDown",
            frames: this.anims.generateFrameNumbers("char", {start: 0, end: 3}),
            frameRate: 10,
        })

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
                this.users.slice(i, 1);
                
            }

        })
    }

    update() {
        
        const speed = 160;
        this.player.setVelocity(0)
        if(this.cursor.left.isDown || this.keys.A.isDown ) {
            this.player.setVelocityX(-speed)
            this.player.anims.play("walkLeft", true)  
            this.wsHandler.sendPosition({
                direction: "LEFT",
                x: this.player.x,
                y: this.player.y
            })
        }
        else if(this.cursor.right.isDown || this.keys.D.isDown ) {
            this.player.setVelocityX(speed)
            this.player.anims.play("walkRight", true)  
            this.wsHandler.sendPosition({
                direction: "RIGHT",
                x: this.player.x,
                y: this.player.y
            })
        }

        if(this.cursor.up.isDown || this.keys.W.isDown ) {
            this.player.setVelocityY(-speed)
            this.player.anims.play("walkUp", true)  
            this.wsHandler.sendPosition({
                direction: "UP",
                x: this.player.x,
                y: this.player.y
            })
        }
        else if(this.cursor.down.isDown || this.keys.S.isDown ) {
            this.player.setVelocityY(speed)
            this.player.anims.play("walkDown", true)  
            this.wsHandler.sendPosition({
                direction: "DOWN",
                x: this.player.x,
                y: this.player.y
            })
        }

        if(!this.cursor.left.isDown && !this.keys.A.isDown &&
            !this.cursor.right.isDown && !this.keys.D.isDown &&
            !this.cursor.up.isDown && !this.keys.W.isDown &&
            !this.cursor.down.isDown && !this.keys.S.isDown
        ) {
            this.player.anims.stop()
        }

        
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