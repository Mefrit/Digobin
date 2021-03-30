function rotate(pos, angle) {
    var a = (angle / 180) * Math.PI;
    var ca = Math.cos(a);
    var sa = Math.sin(a);

    var x = pos.x * ca - pos.y * sa;
    var y = pos.x * sa + pos.y * ca;

    pos.x = x;
    pos.y = y;
}

function lerp(y1, y2, total, t) {
    return ((y2 - y1) / total) * t + y1;
}

export class DragonAnimationUpdate {
    data: any;
    constructor(data, images, name_elem) {
        this.images = images;
        this.playing = false;
        this.data = data;
        this.name_elem = name_elem;
        this.canvas = null;
    }

    getObject(name, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == name) {
                return list[i];
            }
        }
        return false;
    }

    getBoneState(bone) {
        var st = { x: 0, y: 0, skX: 0 };
        if (bone.transform) {
            st.x += bone.transform.x || 0;
            st.y += bone.transform.y || 0;
            st.skX += bone.transform.skX || 0;
            st.skY += bone.transform.skY || 0;
        }
        if (bone._transform) {
            st.x += bone._transform.x || 0;
            st.y += bone._transform.y || 0;
            st.skX += bone._transform.skX || 0;
            st.skY += bone._transform.skY || 0;
        }
        return st;
    }

    getGlobalPos(bone) {
        var bones = this.data.armature[0].bone;
        if (bone.parent) {
            var parentBone = this.getObject(bone.parent, bones);
            var parentPos = this.getGlobalPos(parentBone);
            var pos = this.getBoneState(bone);
            rotate(pos, parentPos.skX);

            pos.skX += parentPos.skX;
            pos.x += parentPos.x;
            pos.y += parentPos.y;

            return pos;
        }

        return this.getBoneState(bone);
    }

    getImagePosition(name, pos) {
        var slots = this.data.armature[0].slot;
        var bones = this.data.armature[0].bone;

        var obj = this.getObject(name, slots);

        var parentBone = this.getObject(obj.parent, bones);
        var parentPos = this.getGlobalPos(parentBone);

        var _pos = { x: pos.x, y: pos.y, skX: (pos.skX || 0) + parentPos.skX, z: obj.z };

        rotate(_pos, parentPos.skX);

        _pos.x += parentPos.x;
        _pos.y += parentPos.y;

        return _pos;
    }

    getFrameIndex(frames, frame) {
        var sum = 0;
        for (var i = 0; i < frames.length; i++) {
            sum += frames[i].duration;
            if (sum > frame) {
                return [i, sum];
            }
        }
        return 0;
    }

    interpolate(a, b, total, time) {
        var result = { skX: 0, skY: 0, x: 0, y: 0 };
        for (var i in result) {
            if (result.hasOwnProperty(i)) {
                result[i] = lerp(a[i] || 0, b[i] || 0, total, time);
            }
        }

        return result;
    }

    setTransform(target, values) {
        if (!target._transform) {
            target._transform = {};
        }
        for (var i in values) {
            if (values.hasOwnProperty(i)) {
                target._transform[i] = values[i];
            }
        }
    }

    play() {
        this.playing = true;

        var animation = this.data.armature[0].animation[0];
        var boneList = this.data.armature[0].bone;

        var duration = animation.duration;
        var bones = animation.bone;

        var fps = this.data.frameRate;
        var frame = 0;

        var timeBegin = Date.now();
        this.canvas = document.getElementById("canvas_" + this.name_elem);

        var playFrames = () => {
            if (!this.playing) {
                return;
            }
            var time = Date.now();
            var frame = Math.floor(((time - timeBegin) / 1000) * fps);
            if (frame >= duration) {
                timeBegin = time;
                frame = 0;
            }

            bones.forEach((bone) => {
                var name = bone.name;
                var boneObject = this.getObject(name, boneList);
                var frames = bone.frame;

                var [index, sum] = this.getFrameIndex(frames, frame);

                var stateBegin = frames[index].transform;
                if (index + 1 < frames.length) {
                    var stateEnd = frames[index + 1].transform;
                    var stateTime = this.interpolate(
                        stateBegin,
                        stateEnd,
                        frames[index].duration * fps,
                        (((time - timeBegin) / 1000) * fps - (sum - frames[index].duration)) * fps
                    );
                    this.setTransform(boneObject, stateTime);
                } else {
                    this.setTransform(boneObject, stateBegin);
                }
            });

            var slot = this.data.armature[0].skin[0].slot;

            this.showSkin(slot);
            requestAnimationFrame(playFrames);
        };
        requestAnimationFrame(playFrames);
    }
    showSkin(slot) {
        slot = slot.reverse();
        let arrCanvas = [],
            ctx,
            obj;
        slot.forEach((item, i) => {
            obj = item.display[0];
            if (!!this.images[obj.name].data && this.images[obj.name].data.optimize == "sprite_manager") {
                arrCanvas.push({
                    img: this.images[obj.name].node,
                    config_elem: this.images[obj.name].data.config,
                    pos: this.getImagePosition(obj.name, obj.transform),
                    optimize: "sprite_manager",
                });
            } else {
                arrCanvas.push({
                    img: this.images[obj.name].node,
                    pos: this.getImagePosition(obj.name, obj.transform),
                });
            }
        });

        if (this.canvas != null) {
            this.canvas.width = 1200;
            this.canvas.height = 800;
            ctx = this.canvas.getContext("2d");
            arrCanvas.sort(function (elem1, elem2): any {
                if (elem1.pos.z > elem2.pos.z) {
                    return 1;
                } else {
                    return -1;
                }
            });
            ctx.clearRect(0, 0, 2000, 1000);

            arrCanvas.forEach(function (elem) {
                ctx.save();

                ctx.translate(elem.pos.x + 400, elem.pos.y + 400);
                ctx.rotate((elem.pos.skX * Math.PI) / 180);

                if (elem.optimize == "sprite_manager") {
                    ctx.drawImage(
                        elem.img,
                        elem.config_elem.x,
                        elem.config_elem.y,
                        elem.config_elem.width,
                        elem.config_elem.height,
                        -elem.config_elem.width / 2,
                        -elem.config_elem.height / 2,
                        elem.config_elem.width,
                        elem.config_elem.height
                    );
                } else {
                    ctx.drawImage(elem.img, -elem.img.width / 2, -elem.img.height / 2);
                }

                ctx.restore();
            });
        }
    }
    show() {
        var slot = this.data.armature[0].skin[0].slot;
        this.showSkin(slot);
    }
    playText() { }

    stop() {
        this.playing = false;
    }
}
