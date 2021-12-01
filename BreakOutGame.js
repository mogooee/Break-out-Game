const canvas = document.getElementById("drawing");
const ctx = canvas.getContext("2d");

const volumeOn = document.querySelector(".volumeOn");
const volumeOnDefault = document.querySelector(".volumeOnDefault");
const volumeOff = document.querySelector(".volumeOff");

//[V]bgm
//[]효과음
const sound = document.getElementById("sound");
const bgm = document.getElementById("bgm");

volumeOff.addEventListener("click", (event) => {
  volumeOff.classList.toggle("hidden");
  volumeOn.classList.toggle("hidden");

  sound.muted = false;
  bgm.muted = false;
  bgm.volume = 0.4;
  bgm.play();
  //sound.play();
});

volumeOn.addEventListener("click", (event) => {
  volumeOff.classList.toggle("hidden");
  volumeOn.classList.toggle("hidden");
  bgm.pause();
});

const ballRadius = 12;
const paddleHeight = 10;
const paddleWidth = 160;

//keyboard
let rightMoved = false;
let leftMoved = false;

//brick
const brickRowCount = 6;
const brickColumnCount = 5;
const brickWidth = canvas.width / brickColumnCount;
const brickHeight = 30;
const brickPadding = 5;
let brickOffsetTop = 134;
const brickOffsetLeft = 2.8;

let level = 1;
let initialSpeed = 10;

//local storage
const bestScore = localStorage.getItem("bestScore");

class DrawObject {
  constructor() {
    this.ballX = canvas.width / 2;
    this.ballY = canvas.height - paddleHeight - ballRadius;

    this.ball2X = canvas.width / 2;
    this.ball2Y = canvas.height - paddleHeight - ballRadius;
    this.paddleX = canvas.width / 2 - paddleWidth / 2;
    this.bricks = [];
    this.MakeBricks(level);
  }
  DrawBall() {
    ctx.beginPath();
    ctx.arc(this.ballX, this.ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#396EB0";
    ctx.fill();
    ctx.closePath();
  }

  DrawBall2() {
    ctx.beginPath();
    ctx.arc(this.ball2X, this.ball2Y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  DrawPaddle() {
    ctx.beginPath();
    ctx.rect(
      this.paddleX,
      canvas.height - paddleHeight,
      paddleWidth,
      paddleHeight
    );
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }
  MakeBricks(level) {
    //행
    for (let r = 0; r < brickRowCount; r++) {
      this.bricks[r] = [];
      //열
      for (let c = 0; c < brickColumnCount; c++) {
        //난수= 1~level
        this.bricks[r][c] = Math.floor(Math.random() * level + 1);
      }
    }
  }
  DrawBricks() {
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        //X축은 열을 기준으로
        let brickX = c * brickWidth + brickOffsetLeft;
        //Y축은 행을 기준으로
        let brickY = r * brickHeight + brickOffsetTop;

        if (this.bricks[r][c]) {
          ctx.beginPath();
          ctx.rect(
            brickX,
            brickY,
            brickWidth - brickPadding,
            brickHeight - brickPadding
          );
          if (this.bricks[r][c] == 1) {
            ctx.fillStyle = "#F08A5D";
          } else if (this.bricks[r][c] == 2) {
            ctx.fillStyle = "#B83B5E";
          } else if (this.bricks[r][c] == 3) {
            ctx.fillStyle = "#6A2C70";
          } else if (this.bricks[r][c] == 4) {
            ctx.fillStyle = "#865858";
          }
          ctx.fill();

          ctx.closePath();
        }
      }
    }
  }

  DrawBestCore() {
    ctx.font = "bold 17pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`BEST SCORE: ${bestScore}`, 165, 120);
  }

  DrawLevel() {
    ctx.font = "bold 20pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`LEVEL${level}`, 200, 92);
  }

  DrawScore(score) {
    ctx.font = "bold 20pt Arial";
    ctx.fillStyle = "#57837B";
    // 💥 💘 💰 🚀 🎇 🌟
    ctx.fillText(`🚀 Score: ${score}`, 49, 38);
  }

  DrawLine() {
    ctx.font = "bold 20pt Arial";
    ctx.fillStyle = "black";
    ctx.fillText("|", 240, 38);
    ctx.fillText("_______________________________", 10, 55);
  }
  DrawLife(life) {
    ctx.font = "bold 20pt Arial";
    ctx.fillStyle = "#D54C4C";
    ctx.fillText(`💘 Life: ${life}`, 290, 38);
  }
}

class DrawCanvas {
  constructor(drawObject) {
    this.drawObject = drawObject;
    this.dx = 0;
    this.dy = -5;

    this.dx2 = 0;
    this.dy2 = -5;
    this.score = 0;
    this.life = 3;
    this.contact = 0;
    this.calTimer;
  }

  init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ChangeSpeed() {
    //ball1
    if (
      this.drawObject.ballX > this.drawObject.paddleX &&
      this.drawObject.ballX < this.drawObject.paddleX + paddleWidth
    ) {
      //패들 중간보다 공이 오른쪽에 있으면 -(-)=+로 오른쪽으로 공이 튕김
      this.dx =
        -(
          (this.drawObject.paddleX + paddleWidth / 2 - this.drawObject.ballX) /
          paddleWidth
        ) * 10;
    }

    if (
      this.drawObject.ball2X > this.drawObject.paddleX &&
      this.drawObject.ball2X < this.drawObject.paddleX + paddleWidth
    ) {
      this.dx2 =
        ((this.drawObject.paddleX + paddleWidth / 2 - this.drawObject.ball2X) /
          paddleWidth) *
        10;
    }
  }

  BounceBall() {
    this.init();
    //좌우벽
    if (
      this.drawObject.ballX + this.dx < ballRadius ||
      this.drawObject.ballX + this.dx > canvas.width - ballRadius
    ) {
      this.dx = -this.dx;
    } else if (
      this.drawObject.ball2X - this.dx2 < ballRadius ||
      this.drawObject.ball2X - this.dx2 > canvas.width - ballRadius
    ) {
      this.dx2 = -this.dx2;
    }
    //상
    if (this.drawObject.ballY + this.dy < ballRadius) {
      this.dy = -this.dy;
    } else if (this.drawObject.ball2Y + this.dy2 < ballRadius) {
      this.dy2 = -this.dy2;
    }

    //하 - 바닥 (게임종료)
    if (
      this.drawObject.ballY + this.dy > canvas.height - ballRadius ||
      this.drawObject.ball2Y + this.dy2 > canvas.height - ballRadius
    ) {
      this.life--;

      if (!this.life) {
        //sound.src = "./laugh.mp3";
        localStorage.setItem("bestScore", this.score);
        alert("GAME OVER 😝");
      } else if (this.life > 0) {
        alert(`YOU HAVE ${this.life} MORE CHANCE!  🙏 `);
        this.drawObject.ballX = canvas.width / 2;
        this.drawObject.ballY = canvas.height - paddleHeight - ballRadius;
        this.drawObject.ball2X = canvas.width / 2;
        this.drawObject.ball2Y = canvas.height - paddleHeight - ballRadius;
        this.drawObject.paddleX = canvas.width / 2 - paddleWidth / 2;
        this.dx = 0;
        this.dx2 = 0;
      }
    }
    //하 - 패들
    if (
      this.drawObject.ballY + this.dy >
      canvas.height - paddleHeight - ballRadius
    ) {
      if (
        this.drawObject.ballX > this.drawObject.paddleX &&
        this.drawObject.ballX < this.drawObject.paddleX + paddleWidth
      ) {
        this.dy = -this.dy;
        this.ChangeSpeed();
        sound.src = "./touchPaddle.mp3";
      }
    }
    //ball2
    else if (
      this.drawObject.ball2Y + this.dy2 >
      canvas.height - paddleHeight - ballRadius
    ) {
      if (
        this.drawObject.ball2X > this.drawObject.paddleX &&
        this.drawObject.ball2X < this.drawObject.paddleX + paddleWidth
      ) {
        this.dy2 = -this.dy2;
        this.ChangeSpeed();
        sound.src = "./touchPaddle.mp3";
      }
    }

    this.DetectCollision();

    this.drawObject.ballX += this.dx;
    this.drawObject.ballY += this.dy;

    if (level > 3) {
      this.drawObject.ball2X -= this.dx2;
      this.drawObject.ball2Y += this.dy2;
    }
  }

  DetectCollision() {
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        let brickX = c * brickWidth + brickOffsetLeft;
        let brickY = r * brickHeight + brickOffsetTop;

        if (this.drawObject.bricks[r][c]) {
          if (
            //원 중심의 x축이 아니라 반지름 값만큼 더한 값이 벽돌 끝에 닿는 조건.
            this.drawObject.ballX + ballRadius > brickX &&
            this.drawObject.ballX - ballRadius <
              brickX + brickWidth - brickPadding &&
            //y축
            this.drawObject.ballY + ballRadius > brickY &&
            this.drawObject.ballY - ballRadius <
              brickY + brickHeight - brickPadding
          ) {
            //벽돌에 닿으면 튕긴다
            this.dy = -this.dy;
            this.contact++;
          }

          //ball2

          if (
            //원 중심의 x축이 아니라 반지름 값만큼 더한 값이 벽돌 끝에 닿는 조건.
            this.drawObject.ball2X + ballRadius > brickX &&
            this.drawObject.ball2X - ballRadius <
              brickX + brickWidth - brickPadding &&
            //y축
            this.drawObject.ball2Y + ballRadius > brickY &&
            this.drawObject.ball2Y - ballRadius <
              brickY + brickHeight - brickPadding
          ) {
            //벽돌에 닿으면 튕긴다
            this.dy2 = -this.dy2;
            this.contact++;
          }

          if (this.contact) {
            if (this.calTimer) {
              return;
            }

            //[V]연속해서 깰 수 없게? - 스로틀
            this.calTimer = setTimeout(() => {
              this.calTimer = null;
              this.drawObject.bricks[r][c] -= 1;
              if (!this.drawObject.bricks[r][c]) {
                this.score++;
                sound.src = "./break.mp3";
                //sound.play();
              }
              this.contact = 0;
            }, 50);
          }
        }
      }
    }

    if (this.score === brickColumnCount * brickRowCount * level) {
      level++;
      //호출되는 시간을 짧게 해서 공의 속도 증가
      initialSpeed -= 1.5;

      if (level < 5) {
        alert(`🌟 LEVEL UP 🌟`);
        this.drawObject.MakeBricks(level);
        this.drawObject.DrawBricks();
        this.drawObject.ballX = canvas.width / 2;
        this.drawObject.ballY = canvas.height - paddleHeight - ballRadius;
        this.drawObject.ball2X = canvas.width / 2;
        this.drawObject.ball2Y = canvas.height - paddleHeight - ballRadius;
        this.drawObject.paddleX = canvas.width / 2 - paddleWidth / 2;
        this.dx = 0;
        this.dx2 = 0;
        brickOffsetTop += 20;
      } else {
        bgm.pause();
        localStorage.setItem("bestScore", this.score);
        alert("YOU WIN 😄");
        clearInterval(timer);
        document.location.reload();
      }
    }
  }

  MovePaddle() {
    if (rightMoved) {
      this.drawObject.paddleX += 7;
      //paddleX+paddleWidth>canvas.width
      if (this.drawObject.paddleX > canvas.width - paddleWidth) {
        this.drawObject.paddleX = canvas.width - paddleWidth;
      }
    } else if (leftMoved) {
      this.drawObject.paddleX -= 7;
      if (this.drawObject.paddleX < 0) {
        this.drawObject.paddleX = 0;
      }
    }
  }

  Draw() {
    this.drawObject.DrawBricks();
    this.drawObject.DrawBall();
    this.drawObject.DrawPaddle();
    this.drawObject.DrawScore(this.score);
    this.drawObject.DrawLife(this.life);
    this.drawObject.DrawLevel();
    this.drawObject.DrawLine();
    this.drawObject.DrawBestCore();

    if (level == 4) {
      this.drawObject.DrawBall2();
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key == "ArrowRight") {
    rightMoved = true;
  } else if (event.key == "ArrowLeft") {
    leftMoved = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key == "ArrowRight") {
    rightMoved = false;
  } else if (event.key == "ArrowLeft") {
    leftMoved = false;
  }
});

document.addEventListener("mousemove", (event) => {
  //브라우저에서 마우스 x좌표값 - 캔버스가 시작되는 x값 (좌측 여백)
  let myX = event.clientX - canvas.offsetLeft;

  if (myX > 0 && myX < canvas.width) {
    //myX = paddle의 중앙
    drawObject.paddleX = myX - paddleWidth / 2;
  }

  //paddleX+paddleWidth>canvas.width
  if (drawObject.paddleX > canvas.width - paddleWidth) {
    drawObject.paddleX = canvas.width - paddleWidth;
  } else if (drawObject.paddleX < 0) {
    drawObject.paddleX = 0;
  }
});

const drawObject = new DrawObject();
const drawCanvas = new DrawCanvas(drawObject);

function play() {
  drawCanvas.BounceBall();
  drawCanvas.Draw();
  if (rightMoved || leftMoved) {
    drawCanvas.MovePaddle();
  }
}

function timer() {
  if (drawCanvas.life) {
    play();
    setTimeout(timer, initialSpeed);
  } else {
    clearTimeout();
    document.location.reload();
  }
}
timer();
