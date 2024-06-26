let player;
let backgroundMusic;
let cursors;
let keyA, keyD, keyW, keySpace, keyEsc;
let slash;
let playerDirection = 'right';
let enemies;
let lastEnemyTime = 0;
let lastBirdTime = 0;
let enemySpawnInterval = 2000;
let birdSpawnInterval = 5000;
let health = 10;
let hearts = [];
let points = 0;
let pointsText;
let kunaiSpeed = 350;
let lastSlashTime = 0;
const slashCooldown = 750;
let gameOver = false;
let shootBothDirections = false; 

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

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const bg = this.add.image(400, 300, 'menuBackground').setOrigin(0.5, 0.5);
        bg.displayWidth = 800;
        bg.displayHeight = 1000;

        const gameOverText = this.add.text(400, 200, 'Game Over', {
            fontSize: '48px',
            fill: '#fff'
        });
        gameOverText.setOrigin(0.5);

        const playAgainButton = this.add.text(400, 400, 'Play Again', {
            fontSize: '32px',
            fill: '#fff'
        }).setInteractive();
        playAgainButton.setOrigin(0.5);

        playAgainButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        playAgainButton.on('pointerover', () => {
            playAgainButton.setStyle({ fill: '#ff0' });
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setStyle({ fill: '#fff' });
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

        const text = this.add.text(250, 300, 'music - pixabay.com', {
            fontSize: '24px',
            fill: '#fff'
        });
        title.setOrigin(0.5);

        const text2 = this.add.text(200, 400, 'animations - opengameart.org', {
            fontSize: '24px',
            fill: '#fff'
        });
        title.setOrigin(0.5);

        const MenuButton = this.add.text(400, 500, 'Menu', {
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
        this.load.spritesheet('bird', 'assets/bird.jpg', { frameWidth: 129, frameHeight: 250 });
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

        this.anims.create({
            key: 'birdFly',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 13 }),
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

        this.birds = this.physics.add.group();
        this.physics.add.collider(this.birds, player, this.hitPlayer, null, this);

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

        this.physics.add.collider(this.projectiles, platforms, this.returnProjectileToPool, null, this);
    }

    update(time) {
        if (gameOver) return; 
        if (cursors.left.isDown || keyA.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
            player.flipX = true;
            playerDirection = 'left';
        } else if (cursors.right.isDown || keyD.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
            player.flipX = false;
            playerDirection = 'right'; 
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if ((cursors.up.isDown || keyW.isDown) && (player.body.touching.down || player.y > 750)) {
            player.setVelocityY(-330);
        }

        if (keySpace.isDown && time > lastSlashTime + slashCooldown) {
            if (shootBothDirections) {
                this.shootProjectile(player.x, player.y, 'left');
                this.shootProjectile(player.x, player.y, 'right');
            } else {
                this.shootProjectile(player.x, player.y);
            }
            lastSlashTime = time; 
        }

        if (keyEsc.isDown && !this.escKeyPressed) {
            this.togglePopup();
            this.escKeyPressed = true;
        } else if (keyEsc.isUp) {
            this.escKeyPressed = false;
        }

        if (time > lastEnemyTime + enemySpawnInterval) {
            this.spawnEnemy();
            lastEnemyTime = time;
        }

        enemies.children.iterate(function (enemy) {
            this.physics.moveToObject(enemy, player, 100);
        }, this);

        this.physics.overlap(this.projectiles, enemies, this.destroyEnemy, null, this);

        this.projectiles.children.iterate(function (projectile) {
            if (projectile.active) {
                projectile.rotation = projectile.body.velocity.x > 0 ? 0 : Math.PI;
                if (projectile.x < 0 || projectile.x > 800) {
                    this.returnProjectileToPool(projectile);
                }
            }
        }, this);

        this.birds.children.iterate(function (bird) {
            if (bird.x < 0 || bird.x > 800) {
                bird.setVelocityX(bird.body.velocity.x * -1);
            }
        });
    }

    drawSlash() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('circle', 10, 10);
        graphics.destroy();
    }

    shootProjectile(x, y, direction = playerDirection) {
        const projectile = this.projectiles.get(x, y);
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.body.velocity.x = direction === 'right' ? kunaiSpeed : -kunaiSpeed;
            projectile.setScale(1.75);
            console.log(`Shooting kunai ${direction} at speed ${kunaiSpeed}`);

            projectile.body.enable = false;
            projectile.body.enable = true;
        } else {
            console.log('No available kunai'); 
        }
    }

    returnProjectileToPool(projectile) {
        projectile.setActive(false);
        projectile.setVisible(false);
        projectile.body.velocity.x = 0;
        this.projectiles.killAndHide(projectile);
    }

    spawnEnemy() {
        console.log('Spawning enemy'); 
        const side = Phaser.Math.Between(0, 1);
        const x = side === 0 ? 0 : 800; 
        const y = Phaser.Math.Between(0, 600);
        const enemy = this.physics.add.sprite(x, y, 'bat'); 
        enemy.setCircle(16);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(side === 0 ? 100 : -100);
        enemy.setVelocityY(Phaser.Math.Between(-50, 50)); 
        enemy.anims.play('fly'); 
        enemies.add(enemy);
        console.log('Enemy created at:', x, y); 
    }

    spawnBird() {
        const x = Phaser.Math.Between(0, 800); 
        const y = Phaser.Math.Between(50, 550); 
        const bird = this.physics.add.sprite(x, y, 'bird'); 
        bird.body.allowGravity = false;
        bird.setVelocityX(Phaser.Math.Between(100, 200) * (Phaser.Math.Between(0, 1) ? 1 : -1)); 
        bird.setCollideWorldBounds(true);
        bird.body.onWorldBounds = true;
        bird.setBounce(1);
        bird.anims.play('birdFly'); 
        this.birds.add(bird);
    }

    hitPlayer(player, enemy) {
        console.log('Player hit by enemy', player.x, player.y);
        enemy.destroy();
        health--;
        this.removeHeart();
        if (health <= 0) {
            this.scene.start('GameOverScene');
            health = 10;
            points = 0;
            kunaiSpeed = 350;
        }
    }

    destroyEnemy(slash, enemy) {
        slash.destroy(); 
        enemy.destroy();
        points += 10; 
        pointsText.setText('Points: ' + points); 
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
        }
    }

    createPopup() {
        this.popup = this.add.container(400, 300).setVisible(false);
    
        const popupBg = this.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRect(-200, -100, 400, 350);
    
        const closeButtonBg = this.add.graphics();
        closeButtonBg.fillStyle(0xff0000, 1);
        closeButtonBg.fillRect(-85, -60, 175, 40);
    
        const increaseSpeedButtonBg = this.add.graphics();
        increaseSpeedButtonBg.fillStyle(0x00ff00, 1);
        increaseSpeedButtonBg.fillRect(-125, 20, 250, 40);

        const buyHeartButtonBg = this.add.graphics();
        buyHeartButtonBg.fillStyle(0x00E6FF, 1); 
        buyHeartButtonBg.fillRect(-125, 80, 250, 40);

        const shootBothDirectionsButtonBg = this.add.graphics();
        shootBothDirectionsButtonBg.fillStyle(0xffa500, 1);
        shootBothDirectionsButtonBg.fillRect(-175, 140, 350, 40);
    
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

        const buyHeartButton = this.add.text(0, 100, 'Buy Heart (-100 points)', {
            fontSize: '15px',
            fill: '#000'
        }).setInteractive();
        buyHeartButton.setOrigin(0.5);
        buyHeartButton.on('pointerdown', () => {
            if (points >= 100 & hearts.length < 10) {
                points -= 100;
                this.addHeart();
                pointsText.setText('Points: ' + points);
            }
        });

        const shootBothDirectionsButton = this.add.text(0, 160, 'Shoot Both Directions (-500 points)', {
            fontSize: '15px',
            fill: '#000'
        }).setInteractive();
        shootBothDirectionsButton.setOrigin(0.5);
        shootBothDirectionsButton.on('pointerdown', () => {
            if (points >= 500) {
                points -= 500;
                shootBothDirections = true;
                pointsText.setText('Points: ' + points);
            }
        });
    
        this.popup.add([popupBg, closeButtonBg, increaseSpeedButtonBg, buyHeartButtonBg, shootBothDirectionsButtonBg, closeButton, increaseSpeedButton, buyHeartButton, shootBothDirectionsButton]);
    }
    
    togglePopup() {
        this.popup.setVisible(!this.popup.visible);
    }

    addHeart() {
        if (hearts.length < 10) {
            let heart = this.add.image(30 + hearts.length * 40, 30, 'heart');
            heart.setScale(2);
            hearts.push(heart);
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
    scene: [MenuScene, GameScene, CreditsScene, GameOverScene]
};

const game = new Phaser.Game(config);
