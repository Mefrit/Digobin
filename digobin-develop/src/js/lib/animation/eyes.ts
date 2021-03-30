function show(list, key) {
    for (var i in list) {
        if (list.hasOwnProperty(i)) {
            list[i].node.style.display = i == key ? "block" : "none";
        }
    }
}

export class EyesAnimation {
    constructor(list) {
        this.list = list.Eyes.children;
        this.id = null;
    }

    play() {
        show(this.list, "Open");

        this.id = setInterval(() => {
            show(this.list, "Close");

            setTimeout(() => {
                show(this.list, "Open");
            }, 100);
        }, 3000);
    }

    playText() {}

    stop() {
        clearInterval(this.id);
    }
}
