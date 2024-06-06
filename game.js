let player;
let backgroundMusic;
let cursors;
let keyA, keyD, keyW, keySpace, keyEsc;
let slash;
let playerDirection = 'right'; // Variable to track player direction
let enemies;
let lastEnemyTime = 0;
let enemySpawnInterval = 2000; // 2 seconds
let health = 10;
let hearts = [];
let points = 0;
let pointsText;
let kunaiSpeed = 350;
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
        this.load.image('shop', 'assets/shop.png');
        this.load.image('gamebg', 'assets/gamebg.jpg');
        this.load.image('kunai', 'assets/kunai3.png');
        this.load.spritesheet('bat', 'assets/32x32-bat-sprite.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const backg = this.add.image(400, 300, 'gamebg').setOrigin(0.5, 0.5);
        backg.displayWidth = 800;
        backg.displayHeight = 1000;

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
        keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.escKeyPressed = false;

        // Create enemies group
        enemies = this.physics.add.group();
        this.physics.add.collider(enemies, platforms);
        this.physics.add.collider(enemies, player, this.hitPlayer, null, this);

        // Create hearts
        this.createHearts();

        pointsText = this.add.text(10, 50, 'Points: 0', { fontSize: '32px', fill: '#000', fontStyle: 'bold' });

        backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        backgroundMusic.play();

        const button = this.add.image(790, 10, 'shop').setInteractive().setScale(0.5).setOrigin(1, 0);
        button.on('pointerdown', () => {
            this.togglePopup();
        });

        this.createPopup();

        this.projectiles = this.physics.add.group({
            defaultKey: 'kunai',
            maxSize: 10
        });
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

        if ((cursors.up.isDown || keyW.isDown) && (player.body.touching.down || player.y > 750)) {
            player.setVelocityY(-330);
        }

        // Check for slash and cooldown
        if (keySpace.isDown && time > lastSlashTime + slashCooldown) {
            this.shootProjectile(player.x, player.y);
            lastSlashTime = time; // Update last slash time
        }

        if (keyEsc.isDown && !this.escKeyPressed) {
            this.togglePopup();
            this.escKeyPressed = true;
        } else if (keyEsc.isUp) {
            this.escKeyPressed = false;
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
        this.physics.overlap(this.projectiles, enemies, this.destroyEnemy, null, this);

        this.projectiles.children.iterate(function (projectile) {
            if (projectile.active) {
                projectile.rotation = projectile.body.velocity.x > 0 ? 0 : Math.PI;
            }
        });
    }

    drawSlash() {
        // Create the texture for the black circle projectiles
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('circle', 10, 10);
        graphics.destroy();
    }

    shootProjectile(x, y) {
        const projectile = this.projectiles.get(x, y);
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.body.velocity.x = playerDirection === 'right' ? kunaiSpeed : -kunaiSpeed;
            projectile.setScale(1.75);
        }
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
        console.log('Player hit by enemy', player.x, player.y); // Debug: log collision
        enemy.destroy();
        health--;
        this.removeHeart();
    }

    destroyEnemy(slash, enemy) {
        slash.destroy(); // Destroy the projectile
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

    createPopup() {
        this.popup = this.add.container(400, 300).setVisible(false);
    
        const popupBg = this.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRect(-150, -100, 300, 200);
    
        const closeButtonBg = this.add.graphics();
        closeButtonBg.fillStyle(0xff0000, 1); // Red background for close button
        closeButtonBg.fillRect(-85, -60, 175, 40);
    
        const increaseSpeedButtonBg = this.add.graphics();
        increaseSpeedButtonBg.fillStyle(0x00ff00, 1); // Green background for increase speed button
        increaseSpeedButtonBg.fillRect(-125, 20, 250, 40);
    
        const closeButton = this.add.text(0, -40, 'Close (esc)', {
            fontSize: '20px',
            fill: '#fff'
        }).setInteractive();
        closeButton.setOrigin(0.5);
        closeButton.on('pointerdown', () => {
            this.togglePopup();
        });
    
        const increaseSpeedButton = this.add.text(0, 40, 'Increase Speed (-50 points)', {
            fontSize: '15px',
            fill: '#000'
        }).setInteractive();
        increaseSpeedButton.setOrigin(0.5);
        increaseSpeedButton.on('pointerdown', () => {
            if (points >= 50) {
                points -= 50;
                kunaiSpeed += 100;
                pointsText.setText('Points: ' + points);
            }
        });
    
        this.popup.add([popupBg, closeButtonBg, increaseSpeedButtonBg, closeButton, increaseSpeedButton]);
    }
    
    

    togglePopup() {
        this.popup.setVisible(!this.popup.visible);
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
