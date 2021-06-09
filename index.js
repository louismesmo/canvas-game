// Classes
class Sheet {
  constructor(canvasSize, pixelsPerRow, ctx, currentColor, currentTool) {
    this.pixels = [];
    this.ctx = ctx;
    this.currentColor = currentColor;
    this.currentTool = currentTool;
    this.pixelsPerRow = pixelsPerRow;

    var pixelSize = canvasSize / pixelsPerRow;
    var x,
      y = 0,
      i = 0;
    for (y = 0; y < pixelsPerRow; y++) {
      for (x = 0; x < pixelsPerRow; x++) {
        this.pixels.push(new Pixel(pixelSize * x, pixelSize * y, pixelSize, i));
        i++;
      }
    }

    this.handleDown = this.handleDown.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.setColor = this.setColor.bind(this);
    this.setTool = this.setTool.bind(this);
    this.execute = this.execute.bind(this);
    this.fill = this.fill.bind(this);
  }

  handleDown(event) {
    isDown = true;
  }
  handleMove(event) {
    event.preventDefault();
    document.body.classList.add("unselectable");

    if (isDown) {
      this.execute(event);
    }
  }
  handleUp(event) {
    event.preventDefault();
    document.body.classList.remove("unselectable");

    isDown = false;

    this.execute(event);
  }

  execute(event) {
    var x = event.pageX - canvasLeft,
      y = event.pageY - canvasTop;
    ctx.globalCompositeOperation = "source-over";
    this.pixels.forEach(function (pixel) {
      if (pixel.collides(x, y)) {
        switch (this.currentTool) {
          case "pencil":
            pixel.setColor(this.currentColor);
            break;
          case "eraser":
            ctx.globalCompositeOperation = "destination-out";
            pixel.setColor("rgba(255,0,255,1)");
            break;
          case "bucket":
            if (!isDown) this.fill(pixel);
            break;
        }
        pixel.draw(ctx);
      }
    }, this);
  }

  setColor(color) {
    this.currentColor = color;
  }
  setTool(tool) {
    this.currentTool = tool;
  }
  fill(pixel) {
    var connectedPixels = [];
    var indexesVerified = [];
    const firstColor = pixel.color;
    connectedPixels.push(pixel);
    
    while(connectedPixels.length > 0){
      var currentPixel = connectedPixels.pop();
      currentPixel.setColor(this.currentColor);
      currentPixel.draw(ctx);
      
      var indexesToVerify = currentPixel.surroundingPixels(this.pixelsPerRow).filter(
        i => !indexesVerified.includes(i)
      );
      console.log(indexesToVerify);

      indexesToVerify.forEach(function (index) {
        var verifiedPixel = this.pixels[index];
        if(firstColor == verifiedPixel.color) {
          connectedPixels.push(verifiedPixel);
        }
      }, this);
      indexesVerified.push.apply(indexesVerified, indexesToVerify);
    }
    console.log("DONE", indexesVerified);
  }
  draw(ctx) {
    this.pixels.forEach(function (pixel) {
      pixel.draw(ctx);
    });
  }
}

class Pixel {
  constructor(posX, posY, size, index, color = "rgba(255,255,255,0)") {
    this.color = color;
    this.posX = posX;
    this.posY = posY;
    this.index = index;
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

  surroundingPixels(pixelsPerRow) {
    var surroundingPixels = []

    if (this.posX > 0){
      surroundingPixels.push(this.index - 1);
    }
    if (this.posY > 0){
      surroundingPixels.push(this.index - pixelsPerRow);
    }
    if (this.posX<((pixelsPerRow*this.size)-this.size)){
      surroundingPixels.push(this.index + 1);
    }
    if (this.posY<((pixelsPerRow*this.size)-this.size)){
      surroundingPixels.push(this.index + pixelsPerRow);
    }

    return surroundingPixels;
  }

  hardDraw(color, ctx) {
    var padding = 2;
    ctx.fillStyle = color;
    ctx.fillRect(this.posX, this.posY, this.size, this.size);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.posX + padding, this.posY + padding, this.size - padding, this.size - padding);
  }
}

var canvas = document.getElementById("game-canvas"),
  picker = document.getElementById("picker"),
  canvasLeft = canvas.offsetLeft + canvas.clientLeft,
  canvasTop = canvas.offsetTop + canvas.clientTop,
  elements = [],
  tools = document.getElementsByName("tool"),
  isDown = false;

var ctx = canvas.getContext("2d");
var sheet = new Sheet(512, 16, ctx, picker.value, "pencil");
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
tools.forEach(function (tool) {
  tool.addEventListener("click", (event) => {
    sheet.setTool(tool.value);
  });
});
