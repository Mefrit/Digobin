const fs = require('fs');
const { parseLabels } = require('./lib/parser');

function getWords(text) {
    return text.toLowerCase().split(/[\s.\-\"\'\?]/g).filter(x => x.length);
}

function matchLabel(label, w) {
    var s = 0;
    for(var j = 0; j < label.length; j++) {
        for(var i = 0; i < w.length; i++) {
            if (label[j] == w[i]) {
                s++;
                break;
            }
        }
    }
    return s; 
}

function findLabel(text, list) {
    var words = getWords(text);

    var result = list.map(l => {
        var n = getWords(l.name);
        return matchLabel(n, words)/*n.length*/;
    });
    var m = result.reduce((acc, v, i) => {
        return v > acc[1] ? [i, v] : acc;
    }, [0, result[0]]);

//    console.log(text, m, list[m[0]].name);

    return m[0];
}


function setLabels(path, role) {
    var list = parseLabels(fs.readFileSync(path + 'audio/' + role +  '.txt', 'utf-8'));
    var story = JSON.parse(fs.readFileSync(path + 'index.json', 'utf-8'));

    for(let i in story) {
        if (story.hasOwnProperty(i) && story[i].active == role) {
            var item = story[i];
            item.sound_labels = item.text.map(text => {                
                return findLabel(text, list);
            });
        }
    }
    fs.writeFileSync(path + 'index.json', JSON.stringify(story, null, 4));
}


setLabels('../assets/projects/lesson3/', 'professor');