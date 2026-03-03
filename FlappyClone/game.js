//Sprites
const sprGround = new Image(); 
sprGround.src = 'img/ground.png';

const sprBackground = new Image(); 
sprBackground.src = 'img/background.png';

const sprPipe = [new Image(), new Image()]; 
sprPipe[0].src = 'img/pipe1.png'; 
sprPipe[1].src = 'img/pipe2.png';

const sprBird = [];
for (let i = 0; i < 3; i++) {
  const img = new Image();
  img.src = `img/bird${i}.png`;
  sprBird.push(img);
}

const sprGameOver = new Image();
sprGameOver.src = 'img/gameover.png';

const sprNumeros = [];
for (let i = 0; i < 10; i++) {
  const img = new Image();
  img.src = `img/numbers/${i}.png`;
  sprNumeros.push(img);
}

const sprStart = [new Image(), new Image()];
sprStart[0].src = 'img/start0.png';
sprStart[1].src = 'img/start1.png';
let spriteStartFrame = 0;
let delayAnimationStart = 30;

//Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const collisionCanvas = document.getElementById('collisionCanvas');
collisionCanvas.width = canvas.width;
collisionCanvas.height = canvas.height;
const collisionCtx = collisionCanvas.getContext('2d', { willReadFrequently: true });

const bgCanvas = document.getElementById('backgroundCanvas');
const bgCtx = bgCanvas.getContext('2d');
bgCanvas.width = 288 * 2;
bgCanvas.height = 512;
sprBackground.onload = () => {
  bgCtx.drawImage(sprBackground, 0, 0);
  bgCtx.drawImage(sprBackground, 288, 0);
};
let xBackground = 0; 

const gCanvas = document.getElementById('groundCanvas');
const gCtx = gCanvas.getContext('2d');
gCanvas.width = 336 * 2;
gCanvas.height = 112;
sprGround.onload = () => {
  gCtx.drawImage(sprGround, 0, 0);
  gCtx.drawImage(sprGround, 336, 0);
}
let xGround = 0; 

//Efeitos sonoros
const dieSound = new Audio('sounds/die.ogg');
const hitSound = new Audio('sounds/hit.ogg');
const pointSound = new Audio('sounds/point.ogg');
const wingSound = new Audio('sounds/wing.ogg');
const swooshSound = new Audio('sounds/swoosh.ogg');

//Controle execução do gameLoop
const targetFPS = 60;
const frameDuration = 1000 / targetFPS; 
let lastFrameTime = performance.now();

//Variaveis do jogo
let frame = 0;
let objects = [];
let idPipe = 0; //id individual, usado quando se é criado um cano
let idPipeCurrent = 0; //id do cano a frente (o esse valor é igual ao da pontuação)
let gameState = 0; //0: tela de start, 1: jogo em andamento, 2: gameover
let bestScore = 0;

//Detectar teclas pressionadas e soltas
let keyState = {}; 
window.addEventListener('keydown', e => {
  if (!keyState[e.code]) keyState[e.code] = { down: false, pressed: false, released: false };
  if (!keyState[e.code].down) {
    keyState[e.code].pressed = true; 
  }
  keyState[e.code].down = true;
});
window.addEventListener('keyup', e => {
  if (!keyState[e.code]) keyState[e.code] = { down: false, pressed: false, released: false };
  keyState[e.code].released = true; 
  keyState[e.code].down = false;
});

//Criar o player
let bird = instance_create(obj_bird());

//Loop do Jogo
function gameLoop(currentTime) {
  //Controle execução do gameLoop
  const elapsed = currentTime - lastFrameTime;
  if (elapsed >= frameDuration) {
    lastFrameTime = currentTime - (elapsed % frameDuration);

    if (gameState == 0) {
      //Tela de Start
      if (keyState['Space']?.pressed) {
        gameState = 1;
        playSound('wing');
      }
    } else if (gameState == 1) {
      //Jogo em andamento
      //Remover os canos que sairem do canvas pela esquerda 
      objects = objects.filter(obj =>
       obj.type !== 'obj_pipe' || obj.x + obj.width >= 0
      );

      //Criar os canos 
      if (frame % 105 == 0) {
        instance_create(obj_pipe());
      }

      //Executar evento update dos objetos
      for (let obj of objects) obj.update();
    } else {
      //Tela de morte
      if (keyState['Enter']?.pressed) {
        restartGame();
      }
    }
  
    //Eventos Draw
    //Movimentar o ponto de origem do background e do chão/base
    if (gameState < 2) {
      xBackground -= 0.25;
      if (xBackground < -288) {
        xBackground = 0;
      }
      xGround -= 1.8;
      if (xGround < -336) {
        xGround = 0;
      }
    }
    //Limpar o canvas para os eventos draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Desenhar o background
    ctx.drawImage(bgCanvas, xBackground, 0);
    //Executar evento draw dos objetos
    for (let obj of objects) obj.draw();
    //Desenhar o chão
    ctx.drawImage(gCanvas, xGround, canvas.height - 112);
    //Exibir elementos visuais de acordo com o estado do jogo 
    switch (gameState) {
      case 0:
      //Animação tela de start  
      delayAnimationStart--;
        if (delayAnimationStart < 1) {
          delayAnimationStart = 30;
          if (spriteStartFrame == 0) {
            spriteStartFrame = 1;
          } else {
            spriteStartFrame = 0;
          }
        }
        ctx.drawImage(sprStart[spriteStartFrame], 0, 0)
      break;
      case 1:
        drawScore(idPipeCurrent, 278, 10, 'left', 1);
      break;
      case 2:
        ctx.drawImage(sprGameOver, 0, 0);
        drawScore(idPipeCurrent, 167, 199, 'left', 1);
        drawScore(bestScore, 167, 257, 'left', 1);
      break;
    }

    //Resetar sistema de teclas pressionadas e soltas
    for (let code in keyState) {
      keyState[code].pressed = false;
      keyState[code].released = false;
    }

    frame++;
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

//Função criar objetos e executar o evento create
function instance_create(obj) {
  objects.push(obj);
  objects[objects.length - 1].create();
  return objects[objects.length - 1];
}

//Checar colisão entre o player e um cano
function checkCollisionPipe(objBird, objPipe) {
  let rectangularCollision = 0;
  
  //Checar colisão retangular 
  if (objBird.x < objPipe.xCollision1 + objPipe.widthCollision && objBird.x + objBird.width > objPipe.xCollision1 && objBird.y < objPipe.yCollision1 + objPipe.heightCollision && objBird.y + objBird.height > objPipe.yCollision1) {
    rectangularCollision = 1;
  } else if (objBird.x < objPipe.xCollision2 + objPipe.widthCollision && objBird.x + objBird.width > objPipe.xCollision2 && objBird.y < objPipe.yCollision2 + objPipe.heightCollision && objBird.y + objBird.height > objPipe.yCollision2) {
    rectangularCollision = 2;
  } else {
    return false;
  }
  
  //Checar colisão pixel-perfect 
  if (rectangularCollision > 0) {
    const imgBird = sprBird[0];
    const imgPipe = rectangularCollision == 1 ? sprPipe[0] : sprPipe[1];
    
    const pipeX = rectangularCollision == 1 ? objPipe.xCollision1 : objPipe.xCollision2;
    const pipeY = rectangularCollision == 1 ? objPipe.yCollision1 : objPipe.yCollision2;
    
    const xStart = Math.max(objBird.x, pipeX);
    const yStart = Math.max(objBird.y, pipeY);
    const xEnd = Math.min(objBird.x + imgBird.width, pipeX + imgPipe.width);
    const yEnd = Math.min(objBird.y + imgBird.height, pipeY + imgPipe.height);
    const width = Math.floor(xEnd - xStart);
    const height = Math.floor(yEnd - yStart);
    
    if (width <= 0 || height <= 0) return false;

    collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    collisionCtx.drawImage(imgBird, objBird.x - xStart, objBird.y - yStart);
    const imgData1 = collisionCtx.getImageData(0, 0, width, height).data;

    collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    collisionCtx.drawImage(imgPipe, pipeX - xStart, pipeY - yStart);
    const imgData2 = collisionCtx.getImageData(0, 0, width, height).data;

    for (let i = 0; i < width * height; i++) {
      const alpha1 = imgData1[i * 4 + 3];
      const alpha2 = imgData2[i * 4 + 3];
  
      if (alpha1 > 0 && alpha2 > 0) {
        return true;
      }
    }
  
    return false;
  }
}

//Desenhar pontuação
function drawScore(score, x, y, position, scale) {
  const scoreString = score.toString();
  const digits = scoreString.split('');

  const digitWidth = sprNumeros[0].width * scale; 
  const digitHeight = sprNumeros[0].height * scale;
  const totalWidth = digitWidth * digits.length;

  let startX;
  switch (position) {
    case 'center':
      startX = x - (totalWidth / 2);
    break;
    case 'right':
      startX = x;
    break;
    case 'left':
      startX = x - totalWidth;
    break;
  }

  for (let i = 0; i < digits.length; i++) {
    const num = parseInt(digits[i]);
    ctx.drawImage(sprNumeros[num], startX + (i * digitWidth), y, digitWidth , digitHeight);
  }
}

//Função reiniciar o jogo
function restartGame() {
  frame = 0; 
  objects = [];  
  idPipe = 0; 
  idPipeCurrent = 0; 
  gameState = 0; 
  xBackground = 0; 
  xGround = 0; 
  spriteStartFrame = 0;
  delayAnimationStart = 30;

  bird = instance_create(obj_bird());

  playSound('swoosh');
}

//Função para os efeitos sonoros
function playSound(sound) {
  let som;

  switch (sound) {
    case 'die':
      som = dieSound.cloneNode();
    break;
    case 'hit':
      som = hitSound.cloneNode();
    break;
    case 'point':
      som = pointSound.cloneNode();
    break;
    case 'wing':
      som = wingSound.cloneNode();
    break;
    case 'swoosh':
      som = swooshSound.cloneNode();
    break;
  }

  som.play();
}