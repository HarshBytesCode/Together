
interface CREATEMAP_PLAYER {
    map: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
    wallsLayer: Phaser.Tilemaps.TilemapLayer,
    player: Phaser.Physics.Arcade.Sprite,
    make: Phaser.GameObjects.GameObjectCreator,
    physics: Phaser.Physics.Arcade.ArcadePhysics

}

export function CreateMap_Player({map, tileset, wallsLayer, player, make, physics}: CREATEMAP_PLAYER) {
    map = make.tilemap({key: "map", tileWidth: 16, tileHeight: 16 });
        tileset = map.addTilesetImage('castle', 'tiles')!;
        map.createLayer("Tile Layer 1", tileset);

        wallsLayer = map.createLayer("walls", tileset)!;
        wallsLayer.setCollisionByProperty({ collide: true });
        map.createLayer("objects", tileset);

        player = physics.add.sprite(100, 100, "char");
        player.setCollideWorldBounds(true)
        player.setFrame(1)
        physics.add.collider(player, wallsLayer);
}