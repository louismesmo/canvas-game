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

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    var x = event.pageX - canvasLeft,
      y = event.pageY - canvasTop;

    this.pixels.forEach(function (pixel) {
      if (pixel.collides(x, y)) { 
        pixel.setColor(picker.value);
        pixel.draw(ctx);
      }
    });
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
  constructor(posX, posY, size, color = "#fff") {
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
      y > this.posY &&
      y < this.posY + this.size &&
      x > this.posX &&
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
  elements = [];

var ctx = canvas.getContext("2d");
var sheet = new Sheet(512, 8, ctx, picker.value);
sheet.draw(ctx);

canvas.addEventListener("click", sheet.handleClick, false);
picker.addEventListener("change", (event) => {
  sheet.setColor(event.target.value);
});