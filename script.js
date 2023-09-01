let gameState = "initial";
window.addEventListener("load", function () {
  const dropdown = document.getElementById("dropdown");

  let diffChoice = 0;
  const selectedDifficuly = dropdown.value;
  diffChoice = parseFloat(selectedDifficuly);

  dropdown.addEventListener("input", handSelect);

  function handSelect(ev) {
    let select = ev.target;
    let selectedDifficuly = select.value;
    diffChoice = parseFloat(selectedDifficuly);
  }
  diffChoice;

  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 720;
  let obstacles = [];
  let score = 0;
  let gameOver = false;

  const gameOverMessages = [
    "Game Over: That Escalated Quickly...",
    "Game Over: Keep Calm and Restart the Game.",
    "Game Over: Your Dino Needs a Gym Membership.",
    "Game Over: May the Retry Button Be Ever in Your Favor.",
    "Game Over: Failed with Style!",
  ];

  class InputHandler {
    constructor() {
      this.keys = [];

      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowLeft") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
      });

      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowLeft"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
    }
  }

  class Backround {
    constructor(gameWidth, gameHeight) {
      this.gameHeight = gameHeight;
      this.gameWidth = gameWidth;

      this.x = 0;
      this.y = 0;
      this.image = document.getElementById("backroundImage");
      this.width = 2834;
      this.height = 1700;
      this.speed = 20;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed * diffChoice,
        this.y,
        this.width,
        this.height
      );
    }

    update() {
      this.x -= this.speed * diffChoice;
      if (this.x < 0 - this.width) {
        this.x = 0;
      }
    }
  }

  class Obstacle {
    constructor(gameWidth, gameHeight) {
      this.gameHeight = gameHeight;
      this.gameWidth = gameWidth;
      this.width = 65;
      this.height = Math.floor(Math.random() * (171 - 130 + 1)) + 130;
      this.speed = 4;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("obstacleImage");
      this.markedForDeletion = false;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
      this.x -= this.speed * diffChoice;

      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }
    }
  }

  function handleObstacles(deltaTime) {
    if (obstacleTimer > obstacleInterval + randomObstacleInterval) {
      obstacles.push(new Obstacle(canvas.width, canvas.height));
      randomObstacleInterval = Math.random() * 1000 + 500;
      obstacleTimer = 0;
    } else {
      obstacleTimer += deltaTime;
    }

    obstacles.forEach((obstacle) => {
      obstacle.draw(ctx);
      obstacle.update();
    });

    obstacles = obstacles.filter((obstacle) => !obstacle.markedForDeletion);
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameHeight = gameHeight;
      this.gameWidth = gameWidth;

      this.width = 87.5;
      this.height = 102;

      this.x = 30;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("dinoImage");
      this.speed = 0;
      this.vy = 0;
      this.gravity = 0.5;
      this.frameX = 0;
      this.frameY = 0;

      this.maxFrame = 3;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.strokeStyle = "white";
      context.beginPath();
      context.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
    }

    update(input, deltaTime, obstacles) {
      // collision detection
      obstacles.forEach((obstacle) => {
        const dx = obstacle.x + obstacle.width / 2 - (this.x + this.width / 2);
        const dy =
          obstacle.y + obstacle.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < obstacle.width / 2 + this.width / 2) {
          gameOver = true;
          gameState = "gameOver";
        }
      });

      // sprite animation
      if (
        this.frameTimer > this.frameInterval / diffChoice &&
        this.onGround()
      ) {
        if (this.frameX >= this.maxFrame) {
          this.frameX = 0;
        } else {
          this.frameX++;
        }
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 7;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -7;
      } else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
        this.vy -= 15;
      } else {
        this.speed = 0;
      }

      this.x += this.speed;
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.gameWidth - this.width) {
        this.x = this.gameWidth - this.width;
      }

      this.y += this.vy;

      if (!this.onGround()) {
        this.vy += this.gravity;
      } else {
        this.vy = 0;
      }

      if (this.y > this.gameHeight - this.height) {
        this.y = this.gameHeight - this.height;
      }
    }

    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  function displayStatusText(context) {
    context.font = "40px Courier New";
    let scoreX = 20;
    let scoreY = 50;

    context.fillStyle = "white";
    context.fillText(score, scoreX, scoreY);

    if (gameOver) {
      context.font = "20px Courier New";

      const message =
        gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];

      context.textAlign = "center";
      context.fillStyle = "black";
      context.fillText(message, canvas.width / 2, 300);

      context.fillStyle = "white";
      context.fillText(message, canvas.width / 2 + 2, 300 + 2);
    }
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const backround = new Backround(canvas.width, canvas.height);

  let lastTime = 0;
  let obstacleTimer = 0;

  let obstacleInterval = 2000;
  let randomObstacleInterval = Math.random() * 1000 + 500;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;

    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    backround.draw(ctx);
    backround.update();

    handleObstacles(deltaTime);

    player.draw(ctx);
    player.update(input, deltaTime, obstacles);
    displayStatusText(ctx);
    score++;
    document.addEventListener("keydown", function (event) {
      if (event.key === " " && gameState === "gameOver") {
        gameState = "playing";
        gameOver = false;
        player.x = 30;
        player.y = player.gameHeight - player.height;
        player.frameX = 0;
        player.frameY = 0;

        backround.x = 0;
        backround.y = 0;

        obstacles = [];

        score = 0;

        requestAnimationFrame(animate);
      }
    });

    if (!gameOver) requestAnimationFrame(animate);
  }
  backround.draw(ctx);
  player.draw(ctx);
  let scoreX = 30;
  let scoreY = 50;
  ctx.font = "40px Courier New";
  ctx.fillStyle = "white";
  ctx.fillText(score, scoreX, scoreY);

  document.addEventListener("keydown", function (event) {
    if (event.key === " " && gameState === "initial") {
      gameState = "playing";
      animate(0);
    }
  });
});
