let start = function (data) {
    const gameWindow = document.getElementById('gameWindow');
    const canv = document.getElementById('canvas');
    canv.style.height = 550;
    canv.style.width = 550;
    let canvas;
    let context;
    const renderer = PIXI.autoDetectRenderer(550, 550, {
        transparent: false,
        resolution: 1
    });
    gameWindow.appendChild(renderer.view);
    let stage = new PIXI.Container();
    let loader = PIXI.loader;
    loader.add('spriteSheet');
    loader.load(setup);
    let runeTypeChance = function () {
        return  data;
    };
    let pickRuneType = function (_types) {
        let types = JSON.parse(JSON.stringify(_types));
        let num = Math.floor((Math.random() * 100) + 1);
        let percentage = 0;
        for (let x in types) {
            percentage += types[x].percentage;
            if (num <= percentage) {
                types[x].type = +x;
                types[x].horizontal_match = 1;
                types[x].vertical_match = 1;
                return types[x];
            }
        }
    };

    let createLevelGrid = function () {
        let gridContainer = new PIXI.Container();
        gridContainer.name = "gridContainer";
        let grid_w = 550;
        let grid_h = 550;
        let block_w = grid_w / 5;
        let block_h = grid_h / 5;
        let grid_y = 225 / 2 + block_h / 2;
        for (let row = 0; row <= 4; row++) {
            let rowContainer = new PIXI.Container();
            for (let col = 0; col <= 4; col++) {
                let blockData = pickRuneType(runeTypeChance());
                let blockTexture = PIXI.Texture.from(`images/runes_ind/rune${blockData.type}.png`);
                let block = new PIXI.Sprite(blockTexture);
                block.type = blockData;
                block.x = block_w * col;
                block.y = (grid_y + block_h * row) - 1000;
                block.width = block_h * 1;
                block.height = block_h * 1;
                TweenMax.to(block, 0.7 + (col * 0.06) + row * 0.01, {y: block_h * row + 1, x: block_w * col + 0.1, repeat: 0, delay: 0.9 + (col * 0.03), yoyo: false, ease: Linear.easeInOut});
                rowContainer.addChild(block);
            }
            gridContainer.addChild(rowContainer);
        }
        stage.addChild(gridContainer);
        checkForMatches();
    };

    function fillEmptyCells() {
        let grid_h = 550;
        let grid_w = 550;
        let block_w = grid_w / 5;
        let block_h = grid_h / 5;
        for (let row = 0; row <= 4; row++) {
            for (let col = 0; col <= 4; col++) {
                if (stage.children[0].children[row].children[col].type.type === null) {
                    let blockData = pickRuneType(runeTypeChance());
                    let texture = PIXI.Texture.from(`images/runes_ind/rune${blockData.type}.png`);
                    stage.children[0].children[row].children[col].alpha = 1;
                    stage.children[0].children[row].children[col].type = blockData;
                    stage.children[0].children[row].children[col].setTexture(texture);
                    stage.children[0].children[row].children[col].y = -1000;
                    TweenMax.to(stage.children[0].children[row].children[col], 1 + (col * 0.06) + row * 0.01, {y: block_h * row + 1, x: block_w * col + 0.1, repeat: 0, delay: 0.1, yoyo: false, ease: Linear.easeInOut});
                }
            }
        }
        setTimeout(function () {
            checkForMatches();
        }, 900);
    }

    function setup() {
        createLevelGrid();
        animationLoop();
    }
    function animationLoop() {
        renderer.render(stage);
        requestAnimationFrame(animationLoop);
    }
    function checkForMatches() {
        for (let j = 0; j <= 4; j++) {
            for (let k = 0; k <= 4; k++) {
                //check horizontal
                for (let c = 1; c < 5; c++) {
                    try {
                        if (stage.children[0].children[j].children[k].type.type === stage.children[0].children[j].children[k + c].type.type) {
                            stage.children[0].children[j].children[k].type.horizontal_match += 1;
                        } else {
                            break;
                        }
                    } catch (e) {
                        break;
                    }
                }
                //check vertical
                for (let c = 1; c < 5; c++) {
                    try {
                        if (stage.children[0].children[j].children[k].type.type === stage.children[0].children[j + c].children[k ].type.type) {
                            stage.children[0].children[j].children[k].type.vertical_match++;
                        } else {
                            break;
                        }
                    } catch (e) {
                    }
                }
            }
        }
        let exploadingBlocks = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        let match = false;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
//            bomb
                if (stage.children[0].children[r].children[c].type.special) {
                    exploadingBlocks[r][ c] = 2;
                    for (let w = -1; w < 2; w++) {
                        for (let q = -1; q < 2; q++) {
                            try {
                                exploadingBlocks[r + w][c + q] = 1;
                                match = true;
                            } catch (e) {
                            }
                        }
                    }
                }
//          horizontal
                if (stage.children[0].children[r].children[c].type.horizontal_match >= stage.children[0].children[r].children[c].type.consecutive) {
                    for (let i = 0; i < stage.children[0].children[r].children[c].type.consecutive; i++) {
                        if (i + c > 4) {
                            break;
                        }
                        exploadingBlocks[r][i + c] = 1;
                    }
                    match = true;
                }
//          vertical
                if (stage.children[0].children[r].children[c].type.vertical_match >= stage.children[0].children[r].children[c].type.consecutive) {
                    for (let i = 0; i < stage.children[0].children[r].children[c].type.consecutive; i++) {
                        if (i + r > 4) {
                            break;
                        }
                        exploadingBlocks[i + r][ c] = 1;
                    }
                    match = true;
                }
            }
        }
        setTimeout(function () {
            if (match) {
                blurMatches(exploadingBlocks);
                setTimeout(function () {
                    createProton(exploadingBlocks);
                }, 2000);
            }
        }, 2500);
    }

    (function () {
        canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext('2d');
        context.globalCompositeOperation = "lighter";
        tick();
    })();

    function createProton(t) {
        proton = new Proton;
        let w = window.innerWidth / 2 - 225 + 110;
        let h = window.innerHeight / 2 - 225 + 110;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (t[r][c] === 1) {
                    let emitter = new Proton.Emitter();
                    emitter.addInitialize(new Proton.Body('images/f2.png'));
                    emitter.addInitialize(new Proton.Mass(0.5));
                    emitter.addInitialize(new Proton.Radius(1, 1));
                    emitter.addInitialize(new Proton.Life(0, 0.1));
                    emitter.addInitialize(new Proton.V(new Proton.Span(1, 15), new Proton.Span(-220, 220), 'polar'));
                    emitter.addBehaviour(new Proton.RandomDrift(1, 1, 0.1));
                    emitter.addBehaviour(new Proton.Alpha(1, 0));
                    emitter.addBehaviour(new Proton.Scale(0.13, 0.002));
                    emitter.p.x = w + stage.children[0].children[r ].children[c ].x - 110;
                    emitter.p.y = h + stage.children[0].children[r ].children[c ].y - 110;
                    emitter.emit();
                    proton.addEmitter(emitter);
                    let item = new Proton.CanvasRenderer(canvas);
                    proton.addRenderer(item);
                    setTimeout(function () {
                        t[r][c] = -1;
                        stage.children[0].children[r ].children[c ].type.type = null;
                        proton.removeEmitter(emitter);
                    }, 800);
                }
            }
        }
        setTimeout(function () {
            moveDown(t);
        }, 2000);
    }

    function blurMatches(t) {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (t[r][c] === 1) {
                    if (!stage.children[0].children[r].children[c].type.special) {
                        stage.children[0].children[r].children[ c].alpha = 0.6;
                        TweenMax.to(stage.children[0].children[r].children[ c], 1, {alpha: 0, delay: 2.2, yoyo: false, ease: Linear.easeInOut});
                        continue;
                    }
                    TweenMax.to(stage.children[0].children[r].children[c], 1, {alpha: 0, delay: 2.7, yoyo: false, ease: Linear.easeInOut});
                }
            }
        }
    }

    function tick() {
        requestAnimationFrame(tick);
        if (typeof proton !== "undefined") {
            proton.update();
        }
    }

    function moveDown(t) {
        for (let r = 4; r >= 0; r--) {
            for (let c = 4; c >= 0; c--) {
                let emptyCells = 0;
                for (let i = r + 1; i < 5; i++) {
                    if (t[i][c] === -1) {
                        emptyCells++;
                    }
                }
                if (emptyCells > 0) {
                    (function () {
                        let temp = stage.children[0].children[r].children[c];
                        stage.children[0].children[r].children[c] = stage.children[0].children[r + emptyCells].children[c];
                        stage.children[0].children[r + emptyCells].children[c] = temp;
                        TweenMax.to(stage.children[0].children[r + emptyCells].children[c], emptyCells * 0.2, {y: stage.children[0].children[r + emptyCells].children[c].y + emptyCells * 110, repeat: 0, yoyo: true, ease: Linear.easeInOut, onComplete: function () {}});
                    })();
                    let temp = t[r][c];
                    t[r][c] = -1;
                    t[r + 1][c] = temp;
                }
            }
        }
        setTimeout(function () {
            fillEmptyCells();
        }, 1000);
    }
};

const jsonRequest = async () => {
    let t = document.getElementsByClassName("table")[0];
    t.style.display = "none";
    let j = document.getElementById("json-btn");
    j.style.display = "none";
    let c = document.getElementById("custom-btn");
    c.style.display = "none";
    let res = await fetch('https://api.myjson.com/bins/15l3ml',);
    let data = await res.json();
    start(data);
};