let player;
let backgroundMusic;
let cursors;
let keyA, keyD, keyW, keySpace;
let slash;
let playerDirection = 'right'; // Variable to track player direction
let enemies;
let lastEnemyTime = 0;
let enemySpawnInterval = 2000; // 2 seconds
let health = 10;
let hearts = [];
let points = 0;
let pointsText;
let lastSlashTime = 0; // To track slash cooldown
const slashCooldown = 750; // 0.75 seconds cooldown in milliseconds
let gameOver = false;

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/menu-b.png');
    }

    create() {
        const bg = this.add.image(400, 300, 'menuBackground').setOrigin(0.5, 0.5);
        bg.displayWidth = 800;
        bg.displayHeight = 1000;

        const title = this.add.text(400, 200, 'Luna the Fox', {
            fontSize: '48px',
            fill: '#fff'
        });
        title.setOrigin(0.5);

        const startButton = this.add.text(400, 300, 'Start Game', {
            fontSize: '32px',
            fill: '#fff'
        }).setInteractive();
        startButton.setOrigin(0.5);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ff0' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#fff' });
        });

        const creditsButton = this.add.text(400, 500, 'Credits', {
            fontSize: '32px',
            fill: '#fff'
        }).setInteractive();
        creditsButton.setOrigin(0.5);

        creditsButton.on('pointerdown', () => {
            this.scene.start('CreditsScene');
        });

        creditsButton.on('pointerover', () => {
            creditsButton.setStyle({ fill: '#ff0' });
        });

        creditsButton.on('pointerout', () => {
            creditsButton.setStyle({ fill: '#fff' });
        });
    }

}

class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/menu-b.png');
    }

    create() {
        const title = this.add.text(400, 200, 'Credits', {
            fontSize: '48px',
            fill: '#fff'
        });
        title.setOrigin(0.5);

        const MenuButton = this.add.text(400, 300, 'Menu', {
            fontSize: '32px',
            fill: '#fff'
        }).setInteractive();
        MenuButton.setOrigin(0.5);

        MenuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        MenuButton.on('pointerover', () => {
            MenuButton.setStyle({ fill: '#ff0' });
        });

        MenuButton.on('pointerout', () => {
            MenuButton.setStyle({ fill: '#fff' });
        });
    }

}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('walk0', 'assets/walk0.png');
        this.load.image('walk1', 'assets/walk1.png');
        this.load.image('walk2', 'assets/walk2.png');
        this.load.image('dead', 'assets/dead.png');
        this.load.image('heart', 'assets/Heart.png');
        this.load.audio('backgroundMusic', 'assets/background.mp3');
        this.load.spritesheet('bat', 'assets/32x32-bat-sprite.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(0, 0, 500, 32);
        graphics.fillStyle(0x00FF00, 1);
        graphics.generateTexture('platform', 400, 32);
        graphics.destroy(); 

        const platforms = this.physics.add.staticGroup();
        platforms.create(600, 700, 'platform').refreshBody();
        platforms.create(100, 560, 'platform').refreshBody();
        platforms.create(400, 400, 'platform').refreshBody();

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

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        cursors = this.input.keyboard.createCursorKeys();
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        slash = this.add.graphics();
        this.drawSlash();
        slash.setVisible(false);

        // Create enemies group
        enemies = this.physics.add.group();
        this.physics.add.collider(enemies, platforms);
        this.physics.add.collider(enemies, player, this.hitPlayer, null, this);

        // Enable physics on the slash for collision detection
        this.physics.add.existing(slash);
        slash.body.setCircle(60); // Increase the collision radius
        slash.body.setEnable(false); // Initially disable collision detection for the slash

        // Create hearts
        this.createHearts();

        pointsText = this.add.text(10, 50, 'Points: 0', { fontSize: '32px', fill: '#fff' });

        backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        backgroundMusic.play();
    }

    update(time) {
        if (gameOver) return; // Stop updating if game is over
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

        // Check for slash and cooldown
        if (keySpace.isDown && time > lastSlashTime + slashCooldown) {
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

            // Enable collision detection for the slash
            slash.body.setEnable(true);

            // Animate the slash to glide like a real slash
            this.tweens.add({
                targets: slash,
                x: targetX, // Adjust the distance as needed
                alpha: 0,
                duration: 200, // Duration of the animation
                onComplete: () => {
                    slash.setVisible(false);
                    slash.alpha = 1; // Reset alpha for next use
                    slash.body.setEnable(false); // Disable collision detection for the slash
                    lastSlashTime = time; // Update last slash time
                }
            });
        }

        // Spawn enemies at intervals
        if (time > lastEnemyTime + enemySpawnInterval) {
            this.spawnEnemy(); // Ensure the correct context for `this`
            lastEnemyTime = time;
        }

        // Update enemies to move towards the player
        enemies.children.iterate(function (enemy) {
            this.physics.moveToObject(enemy, player, 100);
        }, this);

        // Check for collisions between slash and enemies
        this.physics.overlap(slash, enemies, this.destroyEnemy, null, this);
    }

    drawSlash() {
        slash.clear();
        slash.fillStyle(0x808080, 1);
        slash.beginPath();
        slash.arc(0, 0, 60, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(450), false); // Increase the radius
        slash.arc(0, 0, 50, Phaser.Math.DegToRad(450), Phaser.Math.DegToRad(270), true);
        slash.closePath();
        slash.fillPath();
    }

    spawnEnemy() {
        console.log('Spawning enemy'); // Debug: log spawning
        const side = Phaser.Math.Between(0, 1); // Randomly choose 0 (left) or 1 (right)
        const x = side === 0 ? 0 : 800; // Spawn at left or right side
        const y = Phaser.Math.Between(0, 600); // Random y position
        const enemy = this.physics.add.sprite(x, y, 'bat'); // Create an enemy sprite
        enemy.setCircle(16); // Set the collision size to match the original circles
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(side === 0 ? 100 : -100); // Move towards the player
        enemy.setVelocityY(Phaser.Math.Between(-50, 50)); // Random vertical velocity
        enemy.anims.play('fly'); // Play the flying animation
        enemies.add(enemy);
        console.log('Enemy created at:', x, y); // Debug: log enemy position
    }

    hitPlayer(player, enemy) {
        // Handle player being hit by an enemy
        console.log('Player hit by enemy'); // Debug: log collision
        enemy.destroy();
        health--;
        this.removeHeart();
    }

    destroyEnemy(slash, enemy) {
        enemy.destroy();
        points += 10; // Increment points by 10
        pointsText.setText('Points: ' + points); // Update points text
    }

    createHearts() {
        for (let i = 0; i < 10; i++) {
            let heart = this.add.image(30 + i * 40, 30, 'heart');
            heart.setScale(2);
            hearts.push(heart);
        }
    }

    removeHeart() {
        if (hearts.length > 0) {
            const heart = hearts.pop();
            heart.destroy();
            if (hearts.length === 0) {
                player.setTexture('dead');
                player.setVelocity(0);
                gameOver = true;
            }
        }
    }
}

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
    scene: [MenuScene, GameScene, CreditsScene]
};

const game = new Phaser.Game(config);
