
interface ADDCAMERA {
    cameras: Phaser.Cameras.Scene2D.CameraManager,
    player: Phaser.Physics.Arcade.Sprite
}


export function AddCamera({cameras, player}: ADDCAMERA) {

    const camera = cameras.main;
    camera.startFollow(player)
    camera.setZoom(2)

}