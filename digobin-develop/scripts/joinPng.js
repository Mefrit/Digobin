const path = require("path");
Canvas = require("canvas");
const {
    createCanvas,
    loadImage
} = require("canvas");
const glob = require("glob");
const fs = require("fs");
var image_cahe = [],
    kol_img,
    canvas;

function loadImg(folder, files = "*.png") {
    image_cahe = [];

    // var filenames = `../assets/library/dragon/${folder}/${files}`;
    var filenames = `../assets/library/speak/${folder}/${files}`;
    var img,
        total_width = 0,
        max_height = 0,
        config_elements = [];
    console.log(filenames);
    glob(filenames, {}, function (err, files) {
        files.forEach((filename) => {
            fs.readFile(filename, function (err, data) {
                img = new Canvas.Image();
                img.onload = function () {
                    img.name = filename.split("/")[filename.split("/").length - 1].split(".")[0];
                    image_cahe.push(img);
                    console.log(img);
                };
                img.src = data;
                kol_img = files.length;
                total_width += img.width;
                if (max_height < img.height) {
                    max_height = img.height;
                }
            });
        });
    });
    onReady().then(() => {
        console.log("then(() =>", max_height);

        max_width = 0;
        image_cahe.sort((a, b) => {
            if (a.width < b.width) {
                return -1;
            } else {
                return 1;
            }
        });
        config_elements = advanceJoin(image_cahe, max_height);

        save(canvas, config_elements, folder);
    });
}

function simpleJoin(image_cahe, total_width, max_height) {
    canvas = createCanvas(total_width, max_height);
    ctx = canvas.getContext("2d");
    let byf_y = 0,
        curent_x = 0,
        config_elements = [];
    image_cahe.forEach((elem) => {
        config_elements.push({
            name: elem.name,
            width: elem.width,
            height: elem.height,
            x: curent_x,
            y: byf_y,
        });
        byf_y = 0;
        console.log(elem.name);
        ctx.drawImage(elem, curent_x, byf_y);
        curent_x += elem.width;
    });
    return config_elements;
}

function advanceJoin(image_cahe, max_height) {
    let byf_y = 0,
        curent_x = 0,
        max_width = 0,
        config_elements = [];
    image_cahe.forEach((elem) => {
        if (elem.width > max_width) {
            max_width = elem.width;
        }
        if (byf_y + elem.height > max_height) {
            byf_y = 0;

            curent_x += max_width;
        }
        config_elements.push({
            name: elem.name,
            width: elem.width,
            height: elem.height,
            x: curent_x,
            y: byf_y,
        });
        byf_y += elem.height;
    });
    canvas = createCanvas(curent_x + max_width, max_height);
    ctx = canvas.getContext("2d");

    byf_y = 0;
    curent_x = 0;
    max_width = 0;
    image_cahe.forEach((elem) => {
        if (elem.width > max_width) {
            max_width = elem.width;
        }
        console.log(byf_y, curent_x, "max_width", max_width, max_height);

        if (byf_y + elem.height > max_height) {
            byf_y = 0;

            curent_x += max_width;
        }
        ctx.drawImage(elem, curent_x, byf_y);
        byf_y += elem.height;
    });
    return config_elements;
}

function save(canvas, config_elements, folder) {
    let final_sprite = new Canvas.Image();
    canvas.toDataURL("image/png", (err, png) => {
        final_sprite.src = png;
        var data = png.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer.from(data, "base64");
        fs.writeFile(`../assets/library/speak/${folder}/${folder.split("_")[0]}_sprite.png`, buf, function (err) {
            if (err) {
                console.log("ERROR->", err);
            }
        });
    });
    var json = JSON.stringify(config_elements);
    fs.writeFile(`../assets/library/speak/${folder}/${folder.split("_")[0]}_sprite_config.json`, json, "utf8", function (err) {
        if (err) {
            console.log("ERROR->", err);
        }
    });
    // assets\library\speak\images
}
onReady = () => {
    console.log("onready init");
    return new Promise((resolve, reject) => {
        let checkLoad = () => {
            if (kol_img == image_cahe.length) {
                resolve("good");
            } else {
                console.log("checkLoad false", kol_img, image_cahe.length);
                setTimeout(checkLoad, 70);
            }
        };
        checkLoad();
    });
};
// assets\library\speak\images
loadImg("images");