var fs = require('fs');
var glob = require('glob');
var path = require('path');

function lineOffset(line) {
    for (var i = 0; i < line.length; i++) {
        if (line.charAt(i) != '\t') {
            return i;
        }
    }
    return -1;
}

function convertFile(file) {
    var pathname = path.dirname(file);
    var filename = path.basename(file, '.pgo');

    var data = fs.readFileSync(file, 'utf-8').split('\n');

    var pgo = [];
    var parts = [];
    data.forEach((line) => {
        var d = lineOffset(line);
        if (d == 3) {
            var text = line.trim().split(' ');
            var word = { name: text[0], start: parseFloat(text[1]), end: parseFloat(text[2]), parts: [] };
            pgo.push(word);
        }

        if (d == 4) {
            var text = line.trim().split(' ');
            var word = pgo[pgo.length - 1];
            var part = { name: text[1], start: parseFloat(text[0]) };
            parts.push(part);
            word.parts.push(part);
        }
    })


    fs.writeFileSync(pathname + `/${filename}-word.json`, JSON.stringify(pgo, null, 2));
    fs.writeFileSync(pathname + `/${filename}.json`, JSON.stringify({ total: parseInt(data[3], 10), words: parts }, null, 2));
}


glob('../assets/audio/lesson1/*.pgo', {}, function(err, files) {
    files.forEach(f => convertFile(f));
});