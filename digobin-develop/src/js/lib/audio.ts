import { EventListener } from "./event";

function findName(time, data) {
    for (var i = 1; i < data.length; i++) {
        if (data[i].start > time) {
            return data[i - 1].name;
        }
    }
    return "rest";
}

export class AudioFragment {
    startOffset = 0;
    endOffset = 0;

    constructor(name, startOffset, endOffset) {
        this.name = name;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }
}

export class AudioSprites {
    constructor(audio, fragments) {
        this.audio = audio;
        this.fragments = fragments;
        this.current = null;
        this.audio.ontimeupdate = this.onTimeUpdate;
    }

    onTimeUpdate = () => {
        if (this.current && this.audio.currentTime >= this.current.endOffset) {
            console.log("end", this.audio.currentTime);
            this.audio.pause();
        }
    };

    playName(name) {
        var num = this.fragments.findIndex((f) => f.name == name);
        this.current = this.fragments[num];

        this.current.play(this.audio);
    }

    play(num) {

        console.log("num", num);
        this.current = this.fragments[num];
        this.audio.currentTime = this.current.startOffset;
        this.audio.play();
    }

    stop() {
        this.audio.pause();
    }
}
export function loadAudio(path, name) {
    var audio = new Audio(path + name + ".ogg");
    // var audio = new Audio(path + name + ".ogg?" + Date.now());
    return fetch(path + name + ".txt")
        .then((x) => x.text())
        .then((data) => {
            var fragments = data
                .trim()
                .split("\n")
                .map((label) => {
                    var [t_start, t_end, name] = label.trim().split("\t");
                    var fragment = new AudioFragment(name, parseFloat(t_start), parseFloat(t_end));
                    return fragment;
                });
            return new AudioSprites(audio, fragments);
        });
}

export function loadTiming(path) {
    return fetch(path)
        .then((x) => x.text())
        .then((s) => {
            var phonem = s
                .trim()
                .split("\n")
                .map((x) => x.trim());
            phonem.shift();

            var list = phonem.map((item) => {
                var [name, time_begin, time_end] = item.split(/\s+/);
                return { name, time_begin: parseFloat(time_begin), time_end: parseFloat(time_end) };
            });
            return list;
        });
}

export function loadSpriteTiming(path) {
    return fetch(path)
        .then((x) => x.json())
        .then((list) => {
            return list.map((row) => row.map(([name, time_begin, time_end]) => ({ name, time_begin, time_end })));
        });
}
