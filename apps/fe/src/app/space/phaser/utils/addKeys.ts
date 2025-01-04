
interface ADDKEYS {
    input: Phaser.Input.InputPlugin,
    cursor: Phaser.Types.Input.Keyboard.CursorKeys,
    keys: {
        W: Phaser.Input.Keyboard.Key,
        A: Phaser.Input.Keyboard.Key,
        S: Phaser.Input.Keyboard.Key,
        D: Phaser.Input.Keyboard.Key,
    }

}

export function AddKeys({input, cursor, keys}: ADDKEYS) {

    if(input.keyboard) {
        cursor = input.keyboard.createCursorKeys();
        keys = input.keyboard.addKeys({
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
}