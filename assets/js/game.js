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
var stars;
var boxes;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var box;
var box_jump;
var box_tnt;
var consumable;
var apple;

var textGameOver;

function preload ()
{
    this.load.image('ground', 'assets/img/platform.png');
    this.load.image('star', 'assets/img/star.png');
    this.load.spritesheet('crash', 'assets/img/crash.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('apple', 'assets/img/hd/apple.png');
    this.load.image('box', 'assets/img/hd/box.png');
    this.load.image('box_jump', 'assets/img/hd/box_jump.png');
    this.load.image('box_tnt', 'assets/img/hd/box_tnt.png');
    this.load.image('enemy', 'assets/img/enemy.png');
}

function create ()
{
    textGameOver = this.add.text(350, 260);

    platforms = this.physics.add.staticGroup();
    boxes = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    //platforms.create(750, 220, 'ground');
    

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'crash');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    enemy = this.physics.add.sprite(600, 525, 'enemy');
    enemy.setCollideWorldBounds(true);

    // stars = this.physics.add.group({
    //     key: 'star',
    //      setXY: { x: 12, y: 0, stepX: 70 }
    //     // repeat: 11,
    //     // setXY: { x: 12, y: 0, stepX: 70 }
    // });
    box = this.physics.add.staticGroup({
        key: 'box',
        repeat: 2,
         setXY: { x: 200, y: 525, stepY: -23 }
        // repeat: 11,
        // setXY: { x: 12, y: 0, stepX: 70 }
    });
    consumable = this.physics.add.staticGroup({
        key: 'apple',
        repeat: 1,
         setXY: { x: 300, y: 450, stepY: -23 }
        // repeat: 11,
        // setXY: { x: 12, y: 0, stepX: 70 }
    });
    box_jump = this.physics.add.staticGroup({
        key: 'box_jump',
         setXY: { x: 300, y: 525}
    });

    box_tnt = this.physics.add.staticGroup({
        key: 'box_tnt',
         setXY: { x: 450, y: 525}
    });
    box_tnt = this.physics.add.staticGroup({
        key: 'box_tnt',
         setXY: { x: 200, y: 456}
    });

    //boxes = this.physics.add.boxesGroup();

    // stars.children.iterate(function (child) {
    //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // });

    //bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'Apple: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);
    //this.physics.add.collider(stars, platforms);
    //this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(consumable, platforms);
    this.physics.add.collider(box, platforms);
    this.physics.add.collider(box_jump, platforms);
    this.physics.add.collider(box_tnt, platforms);
    this.physics.add.collider(box, box);


    //this.physics.add.overlap(player, stars, collectStar, null, this);
    //this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.overlap(player, consumable, collectConsumable, null, this);
    this.physics.add.overlap(player, box, collectBox, null, this);
    this.physics.add.collider(player, box_jump, hitJump, null, this);
    this.physics.add.collider(player, box_tnt, hitTnt, null, this);
    this.physics.add.collider


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
    enemy.setVelocityX(-100);
    enemy.setVelocityX(+100);

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

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Apple: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        // var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        // var bomb = bombs.create(x, 16, 'bomb');
        // bomb.setBounce(1);
        // bomb.setCollideWorldBounds(true);
        // bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        // bomb.allowGravity = false;

    }
}
function gameOver (player, boxes){
    console.log('Game Over!');
    textGameOver.setText('GAME OVER');
    player.setTint(0xff0000);
    player.anims.play('default');
    gameOver = true;
}

function collectBox (player, box)
{
    console.log('collectBox');
    box.disableBody(true, true);
    score += 10;
    scoreText.setText('Apple: ' + score);
}

function hitTnt (player, boxes)
{
    this.physics.pause();
    console.log('Game Over!');
    textGameOver.setText('GAME OVER');
    player.setTint(0xff0000);
    player.anims.play('default');
    gameOver = true;
}

function hitJump (player, boxes)
{
    player.setVelocityY(-280);
    player.anims.play('default');
}


function hitEnemy (player, enemy)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameOver = true;
}

function collectConsumable (apple, box)
{
    console.log('collectConsumable');
    box.disableBody(true, true);
    score += 6;
    scoreText.setText('Apple: ' + score);
}
