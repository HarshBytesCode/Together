import { WebSocketHandler } from "@/ws/WebSocket";

interface PERFORMANIMATION {
    player: Phaser.Physics.Arcade.Sprite,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    wsHandler: WebSocketHandler,
    keys: {
        W: Phaser.Input.Keyboard.Key,
        A: Phaser.Input.Keyboard.Key,
        S: Phaser.Input.Keyboard.Key,
        D: Phaser.Input.Keyboard.Key,
    }
}


export function PerformAnimation({player, cursor, wsHandler, keys}: PERFORMANIMATION) {

    const speed = 160;
        player.setVelocity(0)
        if(cursor.left.isDown || keys.A.isDown ) {
            player.setVelocityX(-speed)
            player.anims.play("walkLeft", true)  
            wsHandler.sendPosition({
                direction: "LEFT",
                x: player.x,
                y: player.y
            })
        }
        else if(cursor.right.isDown || keys.D.isDown ) {
            player.setVelocityX(speed)
            player.anims.play("walkRight", true)  
            wsHandler.sendPosition({
                direction: "RIGHT",
                x: player.x,
                y: player.y
            })
        }

        if(cursor.up.isDown || keys.W.isDown ) {
            player.setVelocityY(-speed)
            player.anims.play("walkUp", true)  
            wsHandler.sendPosition({
                direction: "UP",
                x: player.x,
                y: player.y
            })
        }
        else if(cursor.down.isDown || keys.S.isDown ) {
            player.setVelocityY(speed)
            player.anims.play("walkDown", true)  
            wsHandler.sendPosition({
                direction: "DOWN",
                x: player.x,
                y: player.y
            })
        }

        if(!cursor.left.isDown && !keys.A.isDown &&
            !cursor.right.isDown && !keys.D.isDown &&
            !cursor.up.isDown && !keys.W.isDown &&
            !cursor.down.isDown && !keys.S.isDown
        ) {
            player.anims.stop()
        }

}