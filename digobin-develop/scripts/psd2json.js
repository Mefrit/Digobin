const fs = require('fs');
require('./initializeCanvas'); // only needed for reading image data and thumbnails
const { readPsd } = require('ag-psd');
var Jimp = require("jimp");

function exportFile(filename, group) {
    const buffer = fs.readFileSync(filename);
    const psd2 = readPsd(buffer);

    function saveAsPng(layer, path) {
        var c = layer.canvas;
        var image = new Jimp(c.width, c.height, function (err, image) {
            this.bitmap.data = c.getBuffer();
            this.write(path);
        });
    }


    var savePath = '../assets/data/';

    var json = [];
    for (var i = 0; i < psd2.children.length; i++) {
        var layer = psd2.children[i];

        if (!layer.hidden) {
            var path = group + '/' + i + '.png';
            var item = {
                top: layer.top,
                left: layer.left,
                height: layer.bottom - layer.top,
                width: layer.right - layer.left,
                name: layer.name,
                hidden: layer.hidden,
                path: path
            };
            json.push(item);
            saveAsPng(layer, savePath + path);
        }
    }

    fs.writeFileSync(savePath + group + '.json', JSON.stringify(json, null, 2));
}


//exportFile("../data/images/Сергей Геннадьевич/Основная поза.psd", 'data');
//exportFile('../data/images/Домовенок/Топает ногой.psd', 'digobin');
//exportFile('../data/images/Домовенок/Задумчивость.psd', 'thinking');
//exportFile('../data/images/Домовенок/Приветствие.psd', 'greeting');
exportFile('../data/images/Домовенок/Недоумение.psd', 'confusion');
