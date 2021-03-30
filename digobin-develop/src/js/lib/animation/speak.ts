function show(list, key) {
    for (var i in list) {
        if (list.hasOwnProperty(i)) {
            list[i].node.style.display = i == key ? "block" : "none";
        }
    }
}

export class SpeakAnimation {
    constructor(list) {
        this.list = list.Mouth.children;
        this.text = "";
        this.textIndex = 0;
        this.id = null;
        this.speed = 60;
        this.canvas = document.getElementById("canvas_" + this.name_elem);
        this.updateChar = this._updateChar.bind(this);
    }

    playText(text) {
        this.text = text;
        if (this.id) {
            clearTimeout(this.id);
        }
        this.animate();
    }

    _updateChar() {
        var smap = {
            о: "O",
            " ": "rest",
            е: "E",
            м: "MBP",
            б: "MBP",
            п: "MBP",
            ф: "FV",
            в: "FV",
            а: "AI",
            и: "AI",
            л: "L",
            у: "U",
        };

        if (this.textIndex <= this.text.length) {
            var ch = this.text.charAt(this.textIndex).toLowerCase();
            if (smap.hasOwnProperty(ch)) {
                show(this.list, smap[ch]);
            } else {
                show(this.list, "etc");
            }
            this.textIndex++;
        } else {
            clearTimeout(this.id);
        }
        this.id = setTimeout(this.updateChar, this.speed);
    }

    animate() {
        this.textIndex = 0;
        this.updateChar();
    }

    stop() {
        clearInterval(this.id);
    }
}
