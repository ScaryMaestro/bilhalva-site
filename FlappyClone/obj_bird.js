function obj_bird() {
    return {
      type: 'obj_bird',
      x: 50,
      y: 200,
      width: 34,
      height: 24,
      velocity: -5.185,
      gravity: 0.28,
      jumpStrength: -5.185,
      animationOrder: [1, 0, 2, 0],
      delayAnimation: 0,
      animationFrame: 0,
      frame: 0,
  
      create() {
        
      },
  
      update() {
        //Pulo
        if (keyState['Space']?.pressed) {
          this.velocity = this.jumpStrength;
          playSound('wing');
        }

        //Gravidade e velocidade
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        //Detectar colisão com o chão ou com o limite de cima
        if (this.y < 0 || this.y + this.height > 400) {
          gameState = 2;
          playSound('hit');
          playSound('die');
          if (idPipeCurrent > bestScore) {
            bestScore = idPipeCurrent;
          }
        }
  
        //Sistema de colisão com o cano atual
        for (let obj of objects) {
          if (obj.id == idPipeCurrent && checkCollisionPipe(this, obj)) {
            gameState = 2;
            playSound('hit');
            playSound('die');
            if (idPipeCurrent > bestScore) {
              bestScore = idPipeCurrent;
            }
            break;
          } 
        }
      },
  
      draw() {
        //Animação das asas
        if (gameState < 2) {
          this.delayAnimation--;
          if (this.delayAnimation < 1) { 
            this.delayAnimation = 10;
            this.animationFrame++;
            if (this.animationFrame >= this.animationOrder.length) {
              this.animationFrame = 0;
            }
          }
        }
        ctx.drawImage(sprBird[this.animationOrder[this.animationFrame]], this.x, this.y, this.width, this.height);
      }
    };
  }