var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var boxes;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

//box
var box;
var box_jump;
var box_tnt;



var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/img/sky.png');
    this.load.image('ground', 'assets/img/platform.png');
    this.load.image('star', 'assets/img/star.png');
    //this.load.image('bomb', 'assets/img/bomb.png');
    this.load.spritesheet('crash', 'assets/img/crash.png', { frameWidth: 32, frameHeight: 48 });

    this.load.image('box', 'assets/img/box.png');
    this.load.image('box_jump', 'assets/img/box_jump.png');
    this.load.image('box_tnt', 'assets/img/box_tnt.png');
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'crash');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    player.setCollideWorldBounds(true);



    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
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
    box_jump = this.physics.add.staticGroup({
        key: 'box_jump',
         setXY: { x: 300, y: 525}
    });
    box_tnt = this.physics.add.staticGroup({
        key: 'box_tnt',
         setXY: { x: 450, y: 525}
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
    //this.physics.add.collider(stars, platforms);
    //this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(box, platforms);
    this.physics.add.collider(box_jump, platforms);
    this.physics.add.collider(box_tnt, platforms);
    this.physics.add.collider(box, box);


    //this.physics.add.overlap(player, stars, collectStar, null, this);
    //this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.add.overlap(player, box, collectBox, null, this);
    this.physics.add.collider(player, box_jump, hitJump, null, this);
    this.physics.add.collider(player, box_tnt, hitTnt, null, this);






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
function collectBox (player, box)
{
    box.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Apple: ' + score);

}
function hitTnt (player, boxes)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameOver = true;
}

function hitJump (player, boxes)
{
    player.setVelocityY(-280);
    player.anims.play('default');
}

function gameOver ()
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('default');
    gameOver = true;
}
