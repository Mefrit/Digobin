//
const readline = require('readline');
const fs = require('fs');

var dicfile = 'D:\\Apps\\sphinx\\zero_ru_cont_8k_v3\\ru.dic';

var dic = [];

function findWord(w, dic) {
    var lower = 0, upper = dic.length -1;

    while(upper - lower > 1) {
        var middle = Math.round((upper + lower)/2);
        var mw = dic[middle][0];
//        console.log(lower, upper, mw);

        var cmp = w.localeCompare(mw);
        if (cmp == 0) {
            return middle;
        }
        if (cmp < 0) {
            upper = middle;
        }
        if (cmp > 0) {
            lower = middle;
        }    
    }
    return -1;
}

const readInterface = readline.createInterface({
    input: fs.createReadStream(dicfile),
    crlfDelay: Infinity
});

readInterface.on('line', function(line) {
    var pos = line.indexOf(' ');
    dic.push([line.substr(0, pos), line.substr(pos + 1)]);
}).on('close', () => {
    var r = findWord('дом', dic);
//    console.log(r);
///*    
    var words = fs.readFileSync('words.txt', 'utf-8').split('\n');   
    words.forEach(w => {
//        console.log(w);
        var pos = findWord(w, dic);
        if (pos >= 0) {
            console.log('SIL ' + dic[pos][1] + ' SIL');
        }
    })
//*/
});





