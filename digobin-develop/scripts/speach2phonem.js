const {
    execSync
} = require('child_process');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

// require('./initializeCanvas'); // only needed for reading image data and thumbnails
const stringify = require("json-stringify-pretty-compact");
const {
    parseTiming
} = require('./lib/parser');

//@echo off
//set pocketsphinx_continuous=D:\Apps\sphinx\bin\pocketsphinx_continuous.exe
//set ngram_count=D:\Apps\srilm\bin\cygwin64\ngram-count.exe
//rem %ngram_count% -text la-phonetic-strings.txt -lm la-phone.lm
//%pocketsphinx_continuous% -infile D:\Server\www\projects\animation\data\audio\parts\1.wav -hmm  D:\Apps\sphinx\zero_ru_cont_8k_v3\zero_ru.cd_cont_4000 -allphone D:\Server\www\projects\animation\scripts\la-phone.lm  -backtrace yes -beam 1e-20 -pbeam 1e-20 -lw 2.0 -time yes
// D:\Mihail\projects\cartoon\bin\sphinx
var sphinx_path = 'D:\\Mihail\\projects\\cartoon\\bin\\sphinx\\';
var sphinx = sphinx_path + 'bin\\pocketsphinx_continuous';
var hmm = sphinx_path + 'zero_ru_cont_8k_v3/zero_ru.cd_cont_4000';
//var hmm = sphinx_path + 'zero_ru_cont_8k_v3/zero_ru.cd_ptm_4000';
//var hmm = sphinx_path + 'zero_ru_cont_8k_v3/zero_ru.cd_semi_4000';
var lm = __dirname + '/sphinx/la-phone.lm';

function mergeLabels(labels, dest) {
    var output = labels.map(f => {
        return parseTiming(fs.readFileSync(f, 'utf-8'));
    });
    fs.writeFileSync(dest, stringify(output, null, 2));
}

function sortFiles(files) {
    files.sort((a, b) => {
        var an = parseInt(path.basename(a, '.txt'), 10);
        var bn = parseInt(path.basename(b, '.txt'), 10);
        return an - bn;
    });
}

function joinLabels(role, lesson) {
    glob(`../temp/${lesson}/${role}/*.txt`, {}, (err, files) => {
        sortFiles(files);
        mergeLabels(files, `../assets/projects/${lesson}/speak/${role}.json`);
    });
}

function decodeFile(role, filename) {
    var pathname = path.dirname(filename);
    var file = path.basename(filename, '.wav');

    var output = path.join(pathname, file + '.txt');
    console.log('\noutput', output, "\n");
    var cmdline = `${sphinx} -infile ${filename} -hmm ${hmm} -allphone ${lm} -backtrace yes -beam 1e-20 -pbeam 1e-20 -lw 2.0 -time yes -logfn log.txt > ${output}`;
    console.log('cmdline', cmdline);
    execSync(cmdline);
    return output;
}


function decodeSound(role, lesson) {
    var filenames = `../temp/${lesson}/${role}/*.wav`;

    glob(filenames, {}, function(err, files) {
        sortFiles(files);
        var labels = files.map(filename => 
        (role, filename));
        mergeLabels(labels, `../assets/projects/${lesson}/speak/${role}.json`);
    });
}

var lesson = 'lesson5';
var role = 'digobin';
// decodeFile('digobin', '../assets/lesson4/digobin/0.wav');
// decodeSound(role, lesson);
// decodeFile(role, `../temp/${role}/72.wav`)
joinLabels(role, lesson);

// decodeSound(role, lesson);
// joinLabels(role, lesson);
// joinLabels(role, lesson);