var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87cefa',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var player;
var enemy;
var boxes;
var platforms;
var spades;
var cursors;
var score = 0;
var gameOver = false;
var moveRight = true;

var scoreText;
var timeText;
var rulestext;

var box;
var box_jump;
var box_tnt;
var box_nitro;
var consumable;
var apple;
var checkpoint;

var textGameOver;

var i;

function preload ()
{
    this.load.image('ground', 'assets/img/platform.png');
    this.load.image('ground_little', 'assets/img/platform_little.png');
    this.load.image('star', 'assets/img/star.png');
    this.load.spritesheet('crash', 'assets/img/crash.png', { frameWidth: 24, frameHeight: 45 });
    this.load.image('apple', 'assets/img/apple.png');
    this.load.image('box', 'assets/img/box.png');
    this.load.image('box_jump', 'assets/img/box_jump.png');
    this.load.image('box_tnt', 'assets/img/box_tnt.png');
    this.load.image('enemy', 'assets/img/enemy.png');
    this.load.image('spades', 'assets/img/void.png');
    this.load.image('checkpoint', 'assets/img/checkpoint.png');
}

function create ()
{
    textGameOver = this.add.text(350, 260);

    platforms = this.physics.add.staticGroup();
    spades = this.physics.add.staticGroup();
    boxes = this.physics.add.staticGroup();
    checkpoint = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(-60, 568, 'ground').setScale(2).refreshBody();
    platforms.create(987, 568, 'ground').setScale(2).refreshBody();
    platforms.create(460, 568, 'ground_little').setScale(2).refreshBody();
    spades.create(400, 600, 'spades').setScale(2).refreshBody();
    checkpoint.create(782, 534, 'checkpoint').refreshBody();

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'crash');
    player.setCollideWorldBounds(true);

    enemy = this.physics.add.sprite(600, 525, 'enemy');
    enemy.setCollideWorldBounds(true);

    box = this.physics.add.staticGroup({
        key: 'box',
        repeat: 2,
         setXY: { x: 200, y: 525, stepY: -23 }
    });
    consumable = this.physics.add.staticGroup({
        key: 'apple',
        repeat: 1,
         setXY: { x: 300, y: 450, stepY: -23 }
    });
    box_jump = this.physics.add.staticGroup({
        key: 'box_jump',
         setXY: { x: 300, y: 525}
    });

    box_tnt = this.physics.add.staticGroup();
    box_tnt.create(460, 525, 'box_tnt').refreshBody();
    box_tnt.create(200, 456, 'box_tnt').refreshBody();

    //  The score
    scoreText = this.add.text(16, 16, 'Apple: 0', { fontSize: '32px', fill: '#000' });
    timeText = this.add.text(630, 16, 'Time: 0', { fontSize: '32px', fill: '#000' });
    rulesText = this.add.text(320, 16, 'Catch all Apples!', { fontSize: '16px', fill: '#000' });

    //  Collide the player and the boxes with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);

    this.physics.add.collider(consumable, platforms);
    this.physics.add.collider(box, platforms);
    this.physics.add.collider(box_jump, platforms);
    this.physics.add.collider(box_tnt, platforms);
    this.physics.add.collider(box, box);

    this.physics.add.overlap(player, consumable, collectConsumable, null, this);
    this.physics.add.overlap(player, box, collectBox, null, this);
    this.physics.add.collider(player, box_jump, hitJump, null, this);
    this.physics.add.collider(player, box_tnt, hitTnt, null, this);
    this.physics.add.collider(player, spades, hitSpades, null, this);
    this.physics.add.collider(player, checkpoint, playerWin, null, this);

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //_____________________________________________________________________________________
    // Player moves
    //_____________________________________________________________________________________
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('crash', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'default',
        frames: [ { key: 'crash', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('crash', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    // setTimeout(() => {
    //     timeText.setText('Time: ' + 1);
    // }, 1000);  

    if (moveRight == true)
    {
        setTimeout(() => {
            enemy.setVelocityX(+50);
            moveRight = false
        }, 2000);  
    }
    else if (moveRight == false)
    {
        setTimeout(() => {
            enemy.setVelocityX(-50);
            moveRight = true
        }, 2000);
    }
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('default');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-230);
    }
}

function collectBox (player, box)
{   
    console.log('collectBox');
    box.disableBody(true, true);
    score += 5;
    scoreText.setText('Apple: ' + score);
}

function collectConsumable (apple, box)
{
    console.log('collectConsumable');
    box.disableBody(true, true);
    score += 1;
    scoreText.setText('Apple: ' + score);
}

function hitTnt (player, boxes)
{
    console.log('hitTNT');
    boxes.setTint(0xff0000);
    //TODO if player is still near he die
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameEnd();
}

function hitJump (player, boxes)
{
    console.log('hitJump');
    player.setVelocityY(-280);
    player.anims.play('default');
}

function hitEnemy (player, enemy)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameEnd();
}

function hitSpades (player, spades)
{
    console.log('hitSpades');
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameEnd();
}


function gameEnd (player, boxes){
    textGameOver.setText('GAME OVER');
    gameOver = true;
}

function playerWin (player, ckeckpoint){
    if (score > 16)
    {
        this.physics.pause();
        player.anims.play('default');
        textGameOver.setText('WELL DONE, YOU WON!');
        gameOver = true;
    }

}
