//
export class HeadSprites {
    imgMap = {};
    names = ["AI", "E", "etc", "FV", "L", "MBP", "O", "rest", "U", "WQ"];
    phoneMap = {
        SIL: "rest",
        tt: "rest",
        i: "E",
        ii: "E",
        ee: "E",
        a: "AI",
        t: "etc",
        aa: "AI",
        ay: "AI",
        k: "etc",
        h: "etc",
        oo: "O",
        u: "U",
        uu: "U",
        r: "etc",
        pp: "MBP",
        mm: "MBP",
        m: "MBP",
        je: "E",
        v: "FV",
        y: "WQ",
        yy: "WQ",
        sch: "etc",
        j: "etc",
    };

    constructor(canvas) {
        this.startTime = 0;
        this.list = null;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    findPhonem(dt, list) {
        for (var i = 0; i < list.length; i++) {
            if (dt > list[i].time_begin && dt < list[i].time_end) {
                return list[i];
            }
        }
        return null;
    }

    drawFrame(img) {
        var canvas = this.canvas;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
    }

    load(path) {
        this.names.map((n) => {
            var img = new Image();
            img.src = `${path}/${n}.png`;
            this.imgMap[n] = img;
        });
    }

    timeStep = () => {
        var t0 = Date.now();
        var dt = (t0 - this.startTime) / 1000;

        var n = this.findPhonem(dt, this.list);
        if (n) {
            var name = "etc";
            if (this.phoneMap.hasOwnProperty(n.name)) {
                name = this.phoneMap[n.name];
            }
            this.drawFrame(this.imgMap[name]);
        }
        requestAnimationFrame(this.timeStep);
    };

    play(list) {
        this.list = list;
        this.startTime = Date.now();
        this.timeStep();
    }
}
