const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let keyA, keyD, keySpace;

function preload() {
    this.load.image('walk0', 'assets/walk0.png');
    this.load.image('walk1', 'assets/walk1.png');
    this.load.image('walk2', 'assets/walk2.png');
}

function create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 500, 32);
    graphics.fillStyle(0x00FF00, 1);
    graphics.generateTexture('platform', 400, 32);
    graphics.destroy(); 
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'platform').refreshBody();

    player = this.physics.add.sprite(400, 400, 'walk0');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(3); 

    // collider
    this.physics.add.collider(player, platforms);

    // animations
    this.anims.create({
        key: 'left',
        frames: [
            { key: 'walk1' },
            { key: 'walk2' }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'walk0' }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: [
            { key: 'walk1' },
            { key: 'walk2' }
        ],
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
    if (cursors.left.isDown || keyA.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;
    } else if (cursors.right.isDown || keyD.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if ((cursors.up.isDown || keySpace.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}