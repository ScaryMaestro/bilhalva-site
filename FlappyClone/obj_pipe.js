function obj_pipe() {
    return {
      type: 'obj_pipe',
      id: idPipe,
      heightHole: 96,
      x: 288,
      y: Math.floor(Math.random() * ((-245) - (-501) + 1)) + (-501),
      width: 52,
      height: 1146,
  
      //Configuração das duas hit boxes
      xCollision1: 0,
      yCollision1: 0,
      widthCollision: 0,
      heightCollision: 0,
      xCollision2: 0,
      yCollision2: 0,
  
      create() {
        idPipe++;
  
        //Setando os valores das hit boxes
        this.xCollision1 = this.x;
        this.yCollision1 = this.y;
        this.widthCollision = this.width,
        this.heightCollision = (this.height - this.heightHole) / 2;
        this.xCollision2 = this.x;
        this.yCollision2 = this.y + this.heightCollision + this.heightHole + 1;
      },
  
      update() {
        this.x -= 1.8;

        //Verificar se this é o cano atual e passar para o próximo quando deixar de ser
        if (this.id == idPipeCurrent && this.x + this.width < bird.x) {
          idPipeCurrent++;
          playSound('point');
        }
  
        //Atualizar os pontos de origem das hit boxes
        this.xCollision1 = this.x;
        this.yCollision1 = this.y;
        this.xCollision2 = this.x,
        this.yCollision2 = this.y + this.heightCollision + this.heightHole + 1;
      },
  
      draw() {
        ctx.drawImage(sprPipe[0], this.xCollision1, this.yCollision1, this.widthCollision, this.heightCollision);
        ctx.drawImage(sprPipe[1], this.xCollision2, this.yCollision2, this.widthCollision, this.heightCollision);
      }
    };
  }