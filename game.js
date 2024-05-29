const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    pixelArt: true,
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
let slash;
let playerDirection = 'right'; // Variable to track player direction
let enemies;
let lastEnemyTime = 0;
let enemySpawnInterval = 2000; // 2 seconds
let health = 10;
let credits = 0;
let hearts = [];
let points = 0;
let pointsText;

function preload() {
    this.load.image('walk0', 'assets/walk0.png');
    this.load.image('walk1', 'assets/walk1.png');
    this.load.image('walk2', 'assets/walk2.png');
    this.load.image('heart', 'assets/Heart.png'); // Preload the heart image
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

    this.physics.add.collider(player, platforms);

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
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    slash = this.add.graphics();
    drawSlash();
    slash.setVisible(false);

    // Create enemies group
    enemies = this.physics.add.group();
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(enemies, player, hitPlayer, null, this);

    // Create hearts
    createHearts.call(this);
}

function drawSlash() {
    slash.clear();
    slash.fillStyle(0x808080, 1);
    slash.beginPath();
    slash.arc(0, 0, 50, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(450), false);
    slash.arc(0, 0, 40, Phaser.Math.DegToRad(450), Phaser.Math.DegToRad(270), true);
    slash.closePath();
    slash.fillPath();
}

function spawnEnemy() {
    console.log('Spawning enemy'); // Debug: log spawning
    const side = Phaser.Math.Between(0, 1); // Randomly choose 0 (left) or 1 (right)
    const x = side === 0 ? 0 : 800; // Spawn at left or right side
    const y = Phaser.Math.Between(0, 600); // Random y position
    const enemy = this.add.circle(x, y, 20, 0xff0000); // Create a red circle
    this.physics.add.existing(enemy);
    enemy.body.setCircle(20);
    enemy.body.setBounce(1);
    enemy.body.setCollideWorldBounds(true);
    enemy.body.setVelocityX(side === 0 ? 100 : -100); // Move towards the player
    enemy.body.setVelocityY(Phaser.Math.Between(-50, 50)); // Random vertical velocity
    enemies.add(enemy);
    console.log('Enemy created at:', x, y); // Debug: log enemy position
}

function update(time) {
    if (cursors.left.isDown || keyA.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;
        playerDirection = 'left'; // Update direction
        } else if (cursors.right.isDown || keyD.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
            player.flipX = false;
            playerDirection = 'right'; // Update direction
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
    }

    if ((cursors.up.isDown || keyW.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    if (keySpace.isDown) {
        slash.setVisible(true);
        slash.setPosition(player.x, player.y);
        slash.setScale(1); // Adjust the scale as needed

        let targetX = player.x;
        if (playerDirection === 'right') {
            targetX += 100; // Slash to the right
            slash.scaleX = 1; // Ensure normal scale for right direction
        } else if (playerDirection === 'left') {
            targetX -= 100; // Slash to the left
            slash.scaleX = -1; // Flip horizontally for left direction
        }

        // Animate the slash to glide like a real slash
        this.tweens.add({
            targets: slash,
            x: targetX, // Adjust the distance as needed
            alpha: 0,
            duration: 200, // Duration of the animation
            onComplete: () => {
                slash.setVisible(false);
                slash.alpha = 1; // Reset alpha for next use
            }
        });
    }

    // Spawn enemies at intervals
    if (time > lastEnemyTime + enemySpawnInterval) {
        spawnEnemy.call(this); // Ensure the correct context for `this`
        lastEnemyTime = time;
    }

    // Update enemies to move towards the player
    enemies.children.iterate(function (enemy) {
        this.physics.moveToObject(enemy, player, 100);
    }, this);
}

function hitPlayer(player, enemy) {
    // Handle player being hit by an enemy
    // For now, just destroy the enemy
    console.log('Player hit by enemy'); // Debug: log collision
    enemy.destroy();
    health--;
    removeHeart();
}

function createHearts() {
    for (let i = 0; i < 10; i++) {
        let heart = this.add.image(30 + i * 40, 30, 'heart');
        heart.setScale(2);
        hearts.push(heart);
    }
}

function removeHeart() {
    if (hearts.length > 0) {
        const heart = hearts.pop(); // Remove the last heart from the array
        heart.destroy(); // Destroy the heart image
        if (hearts.length === 0) {
            // Game over logic here
            console.log('Game Over');
        }
    }
}