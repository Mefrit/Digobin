const fs = require('fs');
var data = JSON.parse(fs.readFileSync('../assets/data/lesson1.json', 'utf-8'));
var out = Object.keys(data).reduce((s,  x) => s.concat(data[x].text), []);

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

var words = out.reduce(
        (s, line) => s.concat(line.split(/\s+/).map(w => w.replace(/[\.0-9=+\(\),\?!:]/g, '').toLowerCase())), 
        []
    ).filter(w => w.length > 1).filter( onlyUnique );

words.forEach(w => console.log(w));