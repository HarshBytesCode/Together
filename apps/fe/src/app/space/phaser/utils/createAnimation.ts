


export function createAnimation(animation: Phaser.Animations.AnimationManager) {

    animation.create({
        key: "walkLeft",
        frames: animation.generateFrameNumbers("char", {start: 8, end: 11}),
        frameRate: 10,
    })
    animation.create({
        key: "walkRight",
        frames: animation.generateFrameNumbers("char", {start: 12, end: 15}),
        frameRate: 10,
    })
    animation.create({
        key: "walkUp",
        frames: animation.generateFrameNumbers("char", {start: 4, end: 7}),
        frameRate: 10,
    })
    animation.create({
        key: "walkDown",
        frames: animation.generateFrameNumbers("char", {start: 0, end: 3}),
        frameRate: 10,
    })

}