const path = require("path");
Canvas = require("canvas");
const {
    createCanvas,
    loadImage
} = require("canvas");
const glob = require("glob");
const fs = require("fs");
var image_cache = [],
    kol_img = 0,
    image_cache = [];

function loadJson(folder, files = "*.png") {
    var filenames = `../assets/library/dragon/${folder}/${files}`;
    var config_elements = [],
        path_image,
        canvas,
        ctx;
    glob(filenames, {}, function (err, files) {
        files.forEach((filename) => {

            fs.readFile(filename, function (err, data) {
                path_image = filename.split("_config")[0] + "_sprite.png";
                config_elements[path_image] = JSON.parse(data, "utf8");

                var img = new Canvas.Image();
                img.name = path_image;
                fs.readFile(path_image, function (err, data) {
                    img.onload = function () {

                        console.log("img!!!!!!!!!!!!!!!!!", img.name);
                        kol_img += config_elements[img.name].length;
                        onReady().then(() => {
                            console.log("done", image_cache[0].name);
                        })
                        console.log("kol_img-> ", kol_img)
                        config_elements[img.name].forEach((elem) => {

                            canvas_2 = createCanvas(elem.width, elem.height);
                            ctx_2 = canvas_2.getContext("2d");

                            ctx_2.drawImage(
                                img,
                                elem.x,
                                elem.y,
                                elem.width,
                                elem.height,
                                0,
                                0,
                                elem.width,
                                elem.height
                            );
                            // save(canvas_2, elem, path_image);
                            saveAsImageObject(canvas_2, elem, path_image);

                        });

                    };
                    img.src = data;
                });
            });

        });


    });


}

function save(canvas_2, elem, path_image) {
    canvas_2.toDataURL("image/png", (err, png) => {
        // boof_image.src = png;
        var data = png.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer.from(data, "base64");
        fs.writeFile(
            `../assets/library/dragon/sprites_splits/${
                elem.name + "_w_" + Math.floor(Math.random() * 100) + elem.height
            }.png`,
            buf,
            function (err) {
                if (err) {
                    console.log(err);
                }
            }
        );
    });
}

function saveAsImageObject(canvas_2, elem, path_image) {
    let image = new Canvas.Image();
    image.onload = function () {
        image.name = elem.name;
        image_cache.push(image);
        console.log("load", image.name, image_cache.length, typeof image_cache);
        document.getElementById("scene").appendChild(image)
    };

    image.src = canvas_2.toDataURL();


}

onReady = () => {
    console.log("onready start ++++++++");
    return new Promise((resolve, reject) => {
        let checkLoad = () => {
            console.log("checkload", kol_img, image_cache.length);
            // && kol_img != 0
            if (kol_img == image_cache.length && kol_img != 0) {
                resolve("good");
            } else {
                console.log("checkLoad false", kol_img, image_cache.length);
                setTimeout(checkLoad, 70);
            }
        };
        checkLoad();
    });
};


loadJson("sprites", "*.json");

// var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");