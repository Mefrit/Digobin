
var fs = require('fs');
var path = require('path');

var parseString = require('xml2js').parseString;

var name = '../data/image.svg';
var xml = fs.readFileSync(name, 'utf-8');
var state = {};
var gen = 0;

function getImageState(img, transform) {

    var props = img.$;
    var img = {
        name: 'name' + (gen++),
        left: parseFloat(props.x), 
        top: parseFloat(props.y), 
        width: parseFloat(props.width), 
        height: parseFloat(props.height), 
        path: 'images/' + path.basename(props['xlink:href'])
    };

    if (transform) {
        var s = transform;
        var m = s.match(/\s*(translate|matrix|rotate|scale)\(([^\)]*)\)/);
        if (m) {
            var op = m[1];
            var args = m[2].split(',').map(x => parseFloat(x));
            console.log(args);
            if (op == 'translate') {
                img.left += args[0];
                img.top += args[1];
            }
            if (op == 'matrix') {
                img.left = img.left * args[0] + img.top * args[2] + args[4];
                img.top = img.top * args[3] + img.left * args[1] + args[5];
                img.width *= args[0];
                img.height *= args[3];
            }
        }
    }

    return img;
}

function getLayerState(item) {
    if (item.hasOwnProperty('image')) {
//        console.log(item.$.transform);
        return item.image.map((img) => getImageState(img, item.$.transform));
    }

    if (item.hasOwnProperty('g')) {
        var state = {};
        var layers = item.g;
        for(var i = 0; i < layers.length; i++) {
            var sitem = layers[i];
            if (sitem.$.hasOwnProperty('inkscape:label')) {
                var name = sitem.$['inkscape:label'];
                state[name] = getLayerState(sitem);
            } else {
                return getLayerState(sitem);
            }
        }
        return state;      
    }
}

function treeToList(state) {
    var result = [];
    for(var i in state) {
        result.push({name: i, children: Array.isArray(state[i]) ? state[i] : treeToList(state[i])})
    }
    return result;
}


var output = 'professor-state';

parseString(xml, function (err, result) {
    var layers = result.svg.g;
    for(var i = 0; i < layers.length; i++) {
        var item = layers[i];
        var name = item.$['inkscape:label'];
        console.log(name);

        state[name] = getLayerState(item);
    }
    
    var tree = treeToList(state);

    fs.writeFileSync('../assets/data/'+output+'.json', JSON.stringify(tree, null, 4));
});

