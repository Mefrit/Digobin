"use strict";
var index_1 = require("ag-psd");

class Canvas {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.ctx = null;
    }

    getContext(name) {
        this.ctx = new Context();
        return this.ctx;
    }

    getBuffer() {
        return this.ctx.buf.data;
    }
}

class ImageData {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.data = Buffer.alloc(w*h*4);
    }
}

class Context {
    constructor() {
        this.buf = null;
    }

    drawImage(img, x, y) {
        this.buf = img;
    }

    createImageData(w, h) {
        return new ImageData(w, h);
    }

    putImageData(data, x, y) {
        this.buf = data;
    }
}

function createCanvas(w, h) {
    var c = new Canvas();
    c.width = w;
    c.height = h;
    return c;
}

function createCanvasFromData(data) {
    var buffer = new Buffer(data);
    var canvas = createCanvas(image.width, image.height);
    canvas.getContext('2d').drawImage(buffer, 0, 0);
    return canvas;
}

index_1.initializeCanvas(createCanvas, createCanvasFromData);
