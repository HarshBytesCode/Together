


export function LoadFiles(load: Phaser.Loader.LoaderPlugin) {
    
    load.image("tiles", "/tiles/castle.png");
    load.tilemapTiledJSON("map", "/maps/map3.json");
    load.spritesheet("char", "/sprites/ch1.png", {
        frameWidth: 32,
        frameHeight: 32
    })

}