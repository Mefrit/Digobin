// Преобразует формат story
const fs = require('fs');
const {
    parseLabels
} = require('./lib/parser');

const path = '../assets/projects/lesson2/';
const filename = path + 'index.json';

let data = JSON.parse(fs.readFileSync(filename, 'utf-8'));

function hashToArray(data) {
    if (!Array.isArray(data.steps)) {
        var steps = Object.keys(data.steps);
        var result = [];
        steps.forEach((name, i) => {
            var item = data.steps[name];
            item.name = name;
            item.order = i;
            result.push(item);
        });

        data.steps = result;
        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
    }
}

function checkLabels(list, file) {
    var data = [];
    list.forEach((item, n) => {
        if (data.hasOwnProperty(item.name)) {
            throw new Error(`${file} dublicate ${item.name} ${n} - ${data[item.name]}`);
        }
        data[item.name] = n;
    });

    return list;
}

function labelIndexToName(data) {
    if (Array.isArray(data.steps)) {
        var labels = {
            professor: checkLabels(parseLabels(fs.readFileSync(path + 'audio/professor.txt', 'utf-8')), 'p'),
            digobin: checkLabels(parseLabels(fs.readFileSync(path + 'audio/digobin.txt', 'utf-8')), 'd')
        };

        data.steps.forEach(item => {
            var person = item.active;
            var sound_labels = item.sound_labels;
            if (sound_labels) {
                var result = sound_labels.map(n => labels[person][n].name);
                item.sound_labels = result;
            }
        });

        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
    }
}

labelIndexToName(data);