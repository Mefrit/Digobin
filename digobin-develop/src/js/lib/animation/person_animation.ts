export class PersonAnimation {
    names = ["AI", "E", "etc", "FV", "L", "MBP", "O", "rest", "U", "WQ"];
    interval = null;
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

    constructor() {

        this.interval = null;
        this.spriteInterval = null;
        this.spriteEyesOpen = true;
        this.eyesOpen = true;
        this.ctx = null;
        this.startTime = 0;
        this.list = null;
        this.set = null;
    }

    findPhonem(dt, list) {
        for (var i = 0; i < list.length; i++) {
            if (dt > list[i].time_begin && dt < list[i].time_end) {
                return list[i];
            }
        }
        return null;
    }
    draw(elem, ctx) {

        ctx.save();
        ctx.translate(elem.x, elem.y);

        if (!!elem.data && !!elem.data.config) {
            ctx.drawImage(
                elem.node,
                elem.data.config.x,
                elem.data.config.y,
                elem.data.config.width,
                elem.data.config.height,
                -elem.data.config.width / 2,
                -elem.data.config.height / 2,
                elem.data.config.width,
                elem.data.config.height
            );
        } else {
            ctx.drawImage(
                elem.node,
                -parseInt(elem.node.style.width.split("px")[0]) / 2,
                -parseInt(elem.node.style.height.split("px")[0]) / 2
            );
        }

        ctx.restore();
    }
    setSprite(list = [], res) {
        let ctx = res.node.getContext("2d"),
            mount = false,
            eyes = false;
        Object.keys(list).sort(function (a, b) {
            return list[b].zIndex - list[a].zIndex;
        });
        ctx.clearRect(0, 0, res.node.width, res.node.height);
        for (var i in list) {
            if (list[i].type == "eyes") {
                eyes = true;
                if (list[i].name != "Close") {
                    this.draw(list[i], ctx);
                }
            } else {
                if (list[i].type == "mount") {
                    if (!mount && list[i].name == "MBP") {
                        mount = true;
                        this.draw(list[i], ctx);
                    }
                } else {
                    this.draw(list[i], ctx);
                }
            }
        }
        if (eyes) this.showElemSprite(list, ctx);
    }
    showElemSprite(list, ctx) {
        clearTimeout(this.spriteInterval);
        let mount = false, sortable = [];

        for (var key in list) {
            sortable.push(list[key]);
        }
        sortable.sort((a, b) => {
            return (a.zIndex - b.zIndex)

        });
        list = sortable;
        this.spriteInterval = setTimeout(
            () => {
                this.spriteEyesOpen = !this.spriteEyesOpen;

                ctx.clearRect(0, 0, 2000, 1000);
                for (var i in list) {

                    if (list[i].type == "eyes") {
                        if (this.spriteEyesOpen) {
                            if (list[i].name == "Open") {
                                this.showElemSprite(list, ctx);
                                this.draw(list[i], ctx);
                            }
                        } else {
                            if (list[i].name == "Close") {
                                this.showElemSprite(list, ctx);
                                this.draw(list[i], ctx);
                            }
                        }
                    } else {
                        if (list[i].type == "mount") {
                            if (!mount && list[i].name == "MBP") {
                                mount = true;
                                this.draw(list[i], ctx);
                            }
                        } else {
                            this.draw(list[i], ctx);
                        }
                    }
                }
            },
            this.spriteEyesOpen ? 3100 : 190
        );
    }
    setEye(list, timeInt, endSpeak, ctx) {
        clearTimeout(this.interval);

        this.interval = setTimeout(() => {
            this.eyesOpen = !this.eyesOpen;
            if (this.eyesOpen) {
                this.setEye(list, 2900, endSpeak, ctx);
            } else {
                this.setEye(list, 130, endSpeak, ctx);
            }
            if (endSpeak || !!endSpeak) {
                if (!!list["MBP"]) {
                    this.show(list, "MBP", ctx);
                }
            }
        }, timeInt);
    }
    show(list, key, ctx) {
        var f = false;
        ctx.clearRect(0, 0, 2000, 1000);
        let arrRess = [];
        for (var i in list) {
            list[i].nameImg = i;
            arrRess.push(list[i]);
        }

        arrRess.sort((a, b) => {
            if (a.zIndex < b.zIndex) {
                return -1;
            } else {
                return 1;
            }
        });

        arrRess.forEach((elem) => {
            if (list.hasOwnProperty(i)) {
                if (elem.nameImg == key) {
                    f = true;
                }
                if (elem.type == "eyes") {
                    if (this.eyesOpen) {
                        if (elem.name == "Open") {
                            this.draw(elem, ctx);
                        }
                    } else {
                        if (elem.name == "Close") {
                            this.draw(elem, ctx);
                        }
                    }
                }
                if (elem.nameImg == key || elem.type == "visible") {
                    this.draw(elem, ctx);
                }
            }
        });

        if (f == false) {
            console.log("no", key);
        }
    }
    drawFrame(name) {
        this.show(this.set, name, this.ctx);
    }
    stopSpeak() {
        console.log("stop speak!!!!!!!!!!", this.name);
        clearTimeout(this.interval);
        if (this.name == "default") {
            this.setEye(this.set, 50, true, this.ctx);
        }
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
            this.drawFrame(name);
        }
        requestAnimationFrame(this.timeStep);
    };
    playStateWithBlink(name, list = [], canvas) {

        let ctx;
        ctx = canvas.getContext("2d");
        this.setEye(list, 300, true, ctx);
    }
    play(list, set, name) {
        let canvas = document.getElementById("canvas_" + name);
        this.name = name;
        this.ctx = canvas.getContext("2d");
        this.set = set;
        this.list = list;
        this.startTime = Date.now();
        this.timeStep();
    }
}
