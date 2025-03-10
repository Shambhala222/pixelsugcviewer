let game;

async function loadUGCData() {
    let response = await fetch("https://drive.google.com/file/d/1RJAaMX2XPxNkBqJMhzLeRoh-48-colRr/view?usp=drive_link");
    let ugcData = await response.json();
    return Object.values(ugcData);
}

function createPhaserGame(imageUrl, frames) {
    let config = {
        type: Phaser.AUTO,
        width: 120,
        height: 120,
        parent: 'game-container',
        scene: {
            preload: function() {
                this.load.spritesheet('ugc', imageUrl, { frameWidth: 120, frameHeight: 120 });
            },
            create: function() {
                this.anims.create({
                    key: 'play',
                    frames: this.anims.generateFrameNumbers('ugc', { start: 0, end: frames - 1 }),
                    frameRate: 5,
                    repeat: -1
                });
                let sprite = this.add.sprite(60, 60, 'ugc').setScale(1);
                sprite.play('play');
            }
        }
    };
    return new Phaser.Game(config);
}

async function init() {
    let ugcList = await loadUGCData();
    ugcList.forEach(item => {
        if (item.animated === "Yes") {
            createPhaserGame(item.image, item.frames);
        }
    });
}

init();
