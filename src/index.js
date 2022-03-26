import "./style.css";
import platform from "./img/platform.png";
import platformSmallTall from "./img/platformSmallTall.png";
import background from "./img/background.png";
import hills from "./img/hills.png";
import spriteRunLeft from "./img/spriteRunLeft.png";
import spriteRunRight from "./img/spriteRunRight.png";
import spriteStandLeft from "./img/spriteStandLeft.png";
import spriteStandRight from "./img/spriteStandRight.png";

const canvas = document.querySelector("canvas");
canvas.width = 1024;
canvas.height = 676;
const c = canvas.getContext("2d");
const gravity = 1.5;

class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 66;
    this.height = 150;
    this.speed = 10;
    this.image = createImage(spriteStandRight);
    this.frame = 0;
    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 66,
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875,
      },
    };
    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = this.sprites.stand.cropWidth;
  }

  draw() {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frame, //cropping starts from the x axis of 0, as frame is 0 for the first time
      0, //cropping starts from the y axis of 0
      this.currentCropWidth, //total width:10620 / total piece:60 = per piece width 177
      400, // height: 400
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frame++;
    if (
      this.frame > 59 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    ) {
      this.frame = 0;
    } else if (
      this.frame > 29 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    ) {
      this.frame = 0;
    }
    this.draw();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

function createImage(imageSrc) {
  const image = new Image();
  image.src = imageSrc;
  return image;
}

let platformImage = createImage(platform);
let platformSmallTallImage = createImage(platformSmallTall);

let player = new Player();
let platforms = [];
let genericObjects = [];

const keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

let scrollOffset = 0;

function init() {
  platformImage = createImage(platform);

  player = new Player();
  platforms = [
    new Platform({ x: -1, y: 560, image: platformImage }),
    new Platform({ x: platformImage.width - 3, y: 560, image: platformImage }),
    new Platform({
      x: platformImage.width * 2 + 100,
      y: 560,
      image: platformImage,
    }),
    new Platform({
      x:
        platformImage.width * 4 +
        300 -
        2 +
        platformImage.width -
        platformSmallTallImage.width,
      y: 340,
      image: platformSmallTallImage,
    }),
    new Platform({
      x: platformImage.width * 3 + 300,
      y: 560,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 4 + 300 - 2,
      y: 560,
      image: platformImage,
    }),
    new Platform({
      x:
        platformImage.width * 6 +
        700 -
        3 +
        platformImage.width -
        platformSmallTallImage.width,
      y: 340,
      image: platformSmallTallImage,
    }),
    new Platform({
      x: platformImage.width * 5 + 700 - 2,
      y: 560,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 6 + 700 - 3,
      y: 560,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 7 + 1200 - 3,
      y: 560,
      image: platformImage,
    }),
  ];
  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background),
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills),
    }),
  ];

  scrollOffset = 0;
}

let runPermission = true;
let lastKey;

function animate() {
  requestAnimationFrame(animate);

  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => {
    genericObject.draw();
  });

  platforms.forEach((platform) => {
    platform.draw();
  });

  player.update();

  //players' movement
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
  }

  //platform' movement
  if (keys.right.pressed && player.velocity.x === 0) {
    scrollOffset += player.speed;

    platforms.forEach((platform) => {
      platform.position.x -= player.speed;
    });

    genericObjects.forEach((genericObject) => {
      genericObject.position.x -= player.speed * 0.66;
    });
  } else if (keys.left.pressed && scrollOffset > 0 && player.velocity.x === 0) {
    scrollOffset -= player.speed;

    platforms.forEach((platform) => {
      platform.position.x += player.speed;
    });

    genericObjects.forEach((genericObject) => {
      genericObject.position.x += player.speed * 0.66;
    });
  }

  // platform collision detection
  platforms.forEach((platform) => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0;
    }
  });

  //player run right or left & stand right or left
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.frame = 1;
    player.currentSprite = player.sprites.run.right;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.currentSprite = player.sprites.run.left;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.currentSprite = player.sprites.stand.right;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.currentSprite = player.sprites.stand.left;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  }

  // lose situation
  if (runPermission && player.position.y > canvas.height) {
    runPermission = false;
    alert("Hey, you lose...");
    window.location.reload();
  }

  // win situation
  if (
    runPermission &&
    (scrollOffset > platformImage.width * 7 + 800) &
      (player.position.y + player.height >= 465)
  ) {
    runPermission = false;
    alert("Congratulations...\nYou have won the game.");
    window.location.reload();
  }
}

init();
animate();

window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      if (player.position.y > 200) {
        player.velocity.y -= 30;
      }
      break;
    case "ArrowLeft":
      keys.left.pressed = true;
      lastKey = "left";
      break;
    case "ArrowRight":
      keys.right.pressed = true;
      lastKey = "right";
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      player.velocity.y = 0;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowRight":
      keys.right.pressed = false;
      break;
  }
});
