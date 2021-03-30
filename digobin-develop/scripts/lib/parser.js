function checkLabels(list) {
    var data = [];
    list.forEach((item, n) => {
        if (data.hasOwnProperty(item.name)) {
            throw new Error(`dublicate ${item.name} at ${n} previous ${data[item.name]}`);
        }
        data[item.name] = n;
    });
}

function parseTiming(s) {
    var phonem = s.trim().split('\n').map(x => x.trim());
    phonem.shift();    
    
    var list = phonem.map(item => {
        var [name, time_begin, time_end] = item.split(/\s+/);
        return [name, parseFloat(time_begin), parseFloat(time_end)];
//        return {name, time_begin: parseFloat(time_begin), time_end: parseFloat(time_end)};
    });
    return list;
}

exports.parseTiming = parseTiming;


function parseLabels(s) {
    var timing = s.trim().split('\n');

    var list = timing.map(t => {
        let [s, e, name] = t.trim().split('\t')
        return {time_begin: parseFloat(s), time_end: parseFloat(e), name: name};
    });    

    checkLabels(list);
    return list;
}

exports.parseLabels = parseLabels;