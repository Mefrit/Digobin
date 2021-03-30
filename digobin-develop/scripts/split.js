// Разделение mp3/wav по меткам на файлы
const fs = require('fs');
const path = require('path');
const {
    execSync
} = require('child_process');
const {
    parseLabels
} = require('./lib/parser');

var ffmpeg = 'D:\\Mihail\\projects\\cartoon\\bin\\ffmpeg\\bin\\ffmpeg.exe';
// D:\Mihail\projects\cartoon\bin

function formatTime(time) {
    var t0 = time % 60
    var t1 = Math.trunc(t0);
    var t2 = Math.trunc(time / 60);
    var t3 = 0;
    return [0, t2, t1].map(t => t.toString().padStart(2, '0')).join(':') + '.' + Math.trunc((t0 - t1) * 1000);
}

function clearDir(directory) {
    console.log("directory!!!!!!!!! ", directory);
    let files = fs.readdirSync(directory);
    for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
    }
}

function cutFile(time_start, time_end, name, output) {
    var stime = formatTime(time_start);
    var etime = formatTime(time_end);
    var cmdline = `${ffmpeg} -y -i ${name} -ar 16000 -ss ${stime} -to ${etime} ${output}`;
    console.log(cmdline);
    execSync(cmdline);
}

function splitFile(input, prefix, output) {
    clearDir(output);

    var file = input + prefix + '.ogg';
    var list = parseLabels(fs.readFileSync(input + prefix + '.txt', 'utf-8'));
    console.log("GOOOD", file);
    list.forEach((line, k) => {
        cutFile(line.time_begin, line.time_end, file, path.join(output, k + '.wav'));
    });
}

//splitFile('../assets/audio/lesson1/', 'lesson1', '../assets/speak/professor');

splitFile('../assets/projects/lesson5/audio/', 'digobin', '../temp/lesson5/digobin');

//splitFile('../assets/projects/lesson3/audio/', 'digobin', '../temp/output/digobin');
//splitFile('../assets/projects/lesson2/audio/', 'professor', '../temp/output/professor');
// splitFile('../assets/projects/lesson1/audio/', 'professor', '../temp/professor');
// splitFile('../assets/projects/entry/audio/', 'digobin', '../temp/entry');