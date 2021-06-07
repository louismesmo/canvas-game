// Classes
class Sheet {
  constructor(canvasSize, pixelsPerRow, ctx, currentColor) {
    this.pixels = [];
    this.ctx = ctx;
    this.currentColor = currentColor;

    var pixelSize = canvasSize / pixelsPerRow;
    var x,
      y = 0;
    for (y = 0; y < pixelsPerRow; y++) {
      for (x = 0; x < pixelsPerRow; x++) {
        this.pixels.push(new Pixel(pixelSize * x, pixelSize * y, pixelSize));
      }
    }

    this.handleDown = this.handleDown.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.setColor = this.setColor.bind(this);
    this.paint = this.paint.bind(this);
  }

  handleDown(event) {
    isDown = true;
  }
  handleMove(event) {
    event.preventDefault();
    document.body.classList.add("unselectable");

    if (isDown) {
      this.paint(event);
    }
  }
  handleUp(event) {
    event.preventDefault();
    document.body.classList.remove("unselectable");

    isDown = false;
    this.paint(event);
  }

  paint(event) {
    var x = event.pageX - canvasLeft,
      y = event.pageY - canvasTop;
    this.pixels.forEach(function (pixel) {
      if (pixel.collides(x, y)) {
        if (tool[0].checked) {
          ctx.globalCompositeOperation = "source-over";
          pixel.setColor(this.currentColor);
        } else {
          ctx.globalCompositeOperation = "destination-out";
          pixel.setColor("rgba(255,255,255,1)");
        }
        pixel.draw(ctx);
      }
    }, this);
  }

  setColor(color) {
    this.currentColor = color;
  }

  draw(ctx) {
    this.pixels.forEach(function (pixel) {
      pixel.draw(ctx);
    });
  }
}

class Pixel {
  constructor(posX, posY, size, color = "rgba(255,255,255,0)") {
    this.color = color;
    this.posX = posX;
    this.posY = posY;
    this.size = size;
  }

  setColor(color) {
    this.color = color;
  }

  collides(x, y) {
    return (
      y >= this.posY &&
      y < this.posY + this.size &&
      x >= this.posX &&
      x < this.posX + this.size
    );
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.posX, this.posY, this.size, this.size);
  }
}

var canvas = document.getElementById("game-canvas"),
  picker = document.getElementById("picker"),
  canvasLeft = canvas.offsetLeft + canvas.clientLeft,
  canvasTop = canvas.offsetTop + canvas.clientTop,
  elements = [],
  tool = document.getElementsByName("tool"),
  isDown = false;

var ctx = canvas.getContext("2d");
var sheet = new Sheet(512, 16, ctx, picker.value);
sheet.draw(ctx);

canvas.addEventListener("click", sheet.handleMove, false);
canvas.addEventListener("mousedown", sheet.handleDown, false);
canvas.addEventListener("mousemove", sheet.handleMove, false);
canvas.addEventListener("mouseup", sheet.handleUp, false);
window.addEventListener("mouseup", (event) => {
  isDown = false;
});
picker.addEventListener("change", (event) => {
  sheet.setColor(event.target.value);
});
