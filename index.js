const TRANSPARENT_COLOR = "rgba(255,255,255,0)";
const LIGHT_GREY = "#EEE";
const DARK_GREY = "#DDD";

// Classes
class App {
  constructor(canvas) {
    this.canvas = canvas;
    (this.canvasLeft = canvas.offsetLeft + canvas.clientLeft),
      (this.canvasTop = canvas.offsetTop + canvas.clientTop),
      (this.isDown = false);
    this.ctx = canvas.getContext("2d");

    this.handleDown = this.handleDown.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.setColor = this.setColor.bind(this);
    this.setTool = this.setTool.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  start(color, tool) {
    this.currentColor = color;
    this.currentTool = tool;

    this.sheet = new Sheet(512, 16, this.ctx);
    this.sheet.draw(this.ctx);
  }

  handleOutsideUp() {
    this.isDown = false;
  }

  handleSave() {
    var sheetJson = JSON.stringify(this.sheet);
    var bl = new Blob([sheetJson], {
      type: "text/html",
    });
    var a = document.createElement("a");

    a.href = URL.createObjectURL(bl);
    a.download = "painting.json";
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "someinnerhtml";
    a.click();
    a.remove();
  }

  handleOpen(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      var contents = e.target.result;
      console.log(contents);

      var newPixels = [];
      var parsedFile = JSON.parse(contents);
      parsedFile.pixels.forEach(pixel => newPixels.push(Object.assign(new Pixel(), pixel)));
      var newSheet = Object.assign(new Sheet(), parsedFile);
      newSheet.pixels = newPixels;

      this.sheet = newSheet;
      this.sheet.draw(this.ctx);
      console.log(newSheet);
    };
    reader.readAsText(file);
  }

  handleDown() {
    this.isDown = true;
  }

  handleMove(event) {
    event.preventDefault();
    document.body.classList.add("unselectable");

    if (this.isDown) {
      this.executeSheet(event);
    }
  }

  handleUp(event) {
    event.preventDefault();
    document.body.classList.remove("unselectable");

    this.isDown = false;
    this.executeSheet(event);
  }

  executeSheet(event) {
    var x = event.pageX - this.canvasLeft,
      y = event.pageY - this.canvasTop;
    this.sheet.execute(x, y, this.currentTool, this.currentColor, this.ctx);
  }

  setColor(color) {
    this.currentColor = color;
  }

  setTool(tool) {
    this.currentTool = tool;
  }
}
class Sheet {
  constructor(canvasSize, pixelsPerRow) {
    this.pixels = [];
    this.pixelsPerRow = pixelsPerRow;
    this.canvasSize = canvasSize;

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

    this.execute = this.execute.bind(this);
    this.fill = this.fill.bind(this);
  }

  execute(x, y, tool, color, ctx) {
    this.pixels.forEach(function (pixel) {
      if (pixel.collides(x, y)) {
        switch (tool) {
          case "pencil":
            pixel.setColor(color);
            break;
          case "eraser":
            pixel.setColor(TRANSPARENT_COLOR);
            break;
          case "bucket":
            if (!isDown) this.fill(pixel, color, ctx);
            break;
        }
        pixel.draw(ctx);
      }
    }, this);
  }

  fill(pixel, color, ctx) {
    var connectedPixels = [];
    var indexesVerified = [];
    const firstColor = pixel.color;
    connectedPixels.push(pixel);

    while (connectedPixels.length > 0) {
      var currentPixel = connectedPixels.pop();
      currentPixel.setColor(color);
      currentPixel.draw(ctx);

      var indexesToVerify = currentPixel
        .surroundingPixels(this.pixelsPerRow)
        .filter((i) => !indexesVerified.includes(i));

      indexesToVerify.forEach(function (index) {
        var verifiedPixel = this.pixels[index];
        if (firstColor == verifiedPixel.color) {
          connectedPixels.push(verifiedPixel);
        }
      }, this);
      indexesVerified.push.apply(indexesVerified, indexesToVerify);
    }
  }
  draw(ctx) {
    this.pixels.forEach(function (pixel) {
      pixel.draw(ctx);
    }, this);
  }
}

class Pixel {
  constructor(posX, posY, size, index, color = TRANSPARENT_COLOR) {
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
    if (this.color == TRANSPARENT_COLOR) {
      this.drawTransparency(ctx);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.posX, this.posY, this.size, this.size);
    }
  }

  drawTransparency(ctx) {
    ctx.fillStyle = DARK_GREY;
    ctx.fillRect(this.posX, this.posY, this.size, this.size);
    ctx.fillStyle = LIGHT_GREY;
    ctx.fillRect(this.posX, this.posY, this.size / 2, this.size / 2);
    ctx.fillRect(
      this.posX + this.size / 2,
      this.posY + this.size / 2,
      this.size / 2,
      this.size / 2
    );
    ctx.fillStyle = this.color;
  }

  surroundingPixels(pixelsPerRow) {
    var surroundingPixels = [];

    if (this.posX > 0) {
      surroundingPixels.push(this.index - 1);
    }
    if (this.posY > 0) {
      surroundingPixels.push(this.index - pixelsPerRow);
    }
    if (this.posX < pixelsPerRow * this.size - this.size) {
      surroundingPixels.push(this.index + 1);
    }
    if (this.posY < pixelsPerRow * this.size - this.size) {
      surroundingPixels.push(this.index + pixelsPerRow);
    }

    return surroundingPixels;
  }

  hardDraw(color, ctx) {
    var padding = 2;
    ctx.fillStyle = color;
    ctx.fillRect(this.posX, this.posY, this.size, this.size);
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.posX + padding,
      this.posY + padding,
      this.size - padding,
      this.size - padding
    );
  }
}

var canvas = document.getElementById("game-canvas"),
  picker = document.getElementById("picker"),
  saveBtn = document.getElementById("save"),
  openBtn = document.getElementById("open"),
  tools = document.getElementsByName("tool");

var app = new App(canvas);
app.start(picker.value, "pencil");

saveBtn.addEventListener("click", app.handleSave, false);
openBtn.addEventListener("change", app.handleOpen, false);
canvas.addEventListener("click", app.handleMove, false);
canvas.addEventListener("mousedown", app.handleDown, false);
canvas.addEventListener("mousemove", app.handleMove, false);
canvas.addEventListener("mouseup", app.handleUp, false);
window.addEventListener("mouseup", app.handleOutsideUp);
picker.addEventListener("change", (event) => {
  app.setColor(event.target.value);
});
tools.forEach(function (tool) {
  tool.addEventListener("click", (event) => {
    app.setTool(tool.value);
  });
});
