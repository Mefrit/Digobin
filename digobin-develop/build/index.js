define("lib/resize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function resize(scene2) {
        var w = document.documentElement.offsetWidth, h = document.documentElement.offsetHeight;
        let marginLeft, scale;
        scale = ((h / 720) < (w / 1280) ? (h / 720) : (w / 1280));
        scene2.style.transform = "   scale( " + scale + " )";
        marginLeft = ((w - scene2.getBoundingClientRect().width) / 2);
        if (marginLeft >= 0) {
            if (scale <= 0 || w < scene2.getBoundingClientRect().width) {
                marginLeft = 0;
            }
            scene2.style.marginLeft = marginLeft + "px";
        }
    }
    exports.resize = resize;
});
define("lib/path", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function before(name, ch, offset = 0) {
        var n = name.lastIndexOf(ch);
        if (n >= 0) {
            return name.substr(0, n + offset);
        }
        return name;
    }
    function after(name, ch, offset = 0) {
        var n = name.lastIndexOf(ch);
        if (n >= 0) {
            return name.substr(n + offset);
        }
        return name;
    }
    function dirname(path) {
        return before(path, '/');
    }
    exports.dirname = dirname;
    function filename(file) {
        return after(before(file, '.'), '/');
    }
    exports.filename = filename;
    function extension(file) {
        var p = file.lastIndexOf('.');
        if (p >= 0) {
            return file.substr(p + 1);
        }
        return '';
    }
    exports.extension = extension;
    function projectName(path) {
        return before(path, '_');
    }
    exports.projectName = projectName;
});
define("lib/imageManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ImageManager {
        constructor() {
            this.resourceCache = [];
            this.indexCache = [];
        }
        pushImage(img, index) {
            let obj = this;
            if (!this.resourceCache[index]) {
                obj.resourceCache[index] = img;
            }
        }
        pushIndexImage(index) {
            if (!this.checkIndexImage(index)) {
                this.indexCache.push(index);
            }
            else {
                console.log("ERROR _> избражение уже есть");
            }
        }
        checkIndexImage(name) {
            return this.indexCache.indexOf(name) == -1 ? false : true;
        }
        get(name) {
            return this.resourceCache[name];
        }
        onReady(imageName) {
            let obj = this;
            return new Promise((resolve) => {
                let checkLoad = () => {
                    if (obj.isReady()) {
                        resolve(obj.get(imageName));
                    }
                    else {
                        setTimeout(checkLoad, 70);
                    }
                };
                checkLoad();
            });
        }
        isReady() {
            var ready = true;
            for (var k = 0; k < this.indexCache.length; k++) {
                if (!this.resourceCache.hasOwnProperty(this.indexCache[k]) ||
                    Object.keys(this.resourceCache).length != this.indexCache.length) {
                    ready = false;
                }
            }
            return ready;
        }
    }
    exports.ImageManager = ImageManager;
});
define("lib/loader", ["require", "exports", "lib/path"], function (require, exports, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResourceManager {
        constructor() {
            this.todo = {};
        }
        load(path, name = null) {
            var maps = {
                json: "json",
                png: "image",
                jpg: "image",
                mp3: "audio",
                txt: "text",
            };
            var type = maps[path_1.extension(path)];
            var item;
            if (!this.todo.hasOwnProperty(path)) {
                item = {
                    data: null,
                    loaded: false,
                    type: type,
                    path: path,
                };
                this.todo[path] = item;
                if (item.type == "text") {
                    return this.loadText(item.path);
                }
                else if (item.type == "json") {
                    return this.loadJSON(item.path);
                }
                else if (item.type == "image") {
                    return this.loadImage(item.path);
                }
                else if (item.type == "audio") {
                    return this.loadAudio(item.path);
                }
            }
            item = this.todo[path];
            return new Promise((resolve) => {
                let checkLoad = () => {
                    if (item.loaded) {
                        resolve(item);
                    }
                    else {
                        setTimeout(checkLoad, 60);
                    }
                };
                checkLoad();
            });
        }
        loadAudio(path) {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
        loadImage(path) {
            return new Promise((resolve, reject) => {
                var img = new Image();
                img.style.position = "absolute";
                img.onload = () => {
                    var resource = this.todo[path];
                    resource.data = img;
                    resource.loaded = true;
                    resolve(resource);
                };
                img.onerror = () => {
                    console.log("not found", path);
                    reject(path);
                };
                img.src = path;
            });
        }
        loadText(path) {
            return fetch(path)
                .then((r) => r.text())
                .then((data) => {
                var resource = this.todo[path];
                resource.data = data;
                resource.loaded = true;
                return resource;
            });
        }
        loadJSON(path) {
            return fetch(path)
                .then((r) => r.json())
                .then((data) => {
                var resource = this.todo[path];
                resource.data = data;
                resource.loaded = true;
                return resource;
            });
        }
    }
    exports.ResourceManager = ResourceManager;
});
define("lib/animation/speak", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function show(list, key) {
        for (var i in list) {
            if (list.hasOwnProperty(i)) {
                list[i].node.style.display = i == key ? "block" : "none";
            }
        }
    }
    class SpeakAnimation {
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
                }
                else {
                    show(this.list, "etc");
                }
                this.textIndex++;
            }
            else {
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
    exports.SpeakAnimation = SpeakAnimation;
});
define("lib/animation/dragon_update", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    class DragonAnimationUpdate {
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
                        var stateTime = this.interpolate(stateBegin, stateEnd, frames[index].duration * fps, (((time - timeBegin) / 1000) * fps - (sum - frames[index].duration)) * fps);
                        this.setTransform(boneObject, stateTime);
                    }
                    else {
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
            let arrCanvas = [], ctx, obj;
            slot.forEach((item, i) => {
                obj = item.display[0];
                if (!!this.images[obj.name].data && this.images[obj.name].data.optimize == "sprite_manager") {
                    arrCanvas.push({
                        img: this.images[obj.name].node,
                        config_elem: this.images[obj.name].data.config,
                        pos: this.getImagePosition(obj.name, obj.transform),
                        optimize: "sprite_manager",
                    });
                }
                else {
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
                arrCanvas.sort(function (elem1, elem2) {
                    if (elem1.pos.z > elem2.pos.z) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                });
                ctx.clearRect(0, 0, 2000, 1000);
                arrCanvas.forEach(function (elem) {
                    ctx.save();
                    ctx.translate(elem.pos.x + 400, elem.pos.y + 400);
                    ctx.rotate((elem.pos.skX * Math.PI) / 180);
                    if (elem.optimize == "sprite_manager") {
                        ctx.drawImage(elem.img, elem.config_elem.x, elem.config_elem.y, elem.config_elem.width, elem.config_elem.height, -elem.config_elem.width / 2, -elem.config_elem.height / 2, elem.config_elem.width, elem.config_elem.height);
                    }
                    else {
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
    exports.DragonAnimationUpdate = DragonAnimationUpdate;
});
define("lib/spriteManager", ["require", "exports", "lib/imageManager"], function (require, exports, imageManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SpriteManager extends imageManager_1.ImageManager {
        constructor() {
            super();
            this.canvas;
            this.resourceCache = [];
            this.config_cache = [];
            this.image_sprite_cache = [];
        }
        startSplit(image, name_sprite, config) {
            var canvas, ctx;
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            this.config_cache[name_sprite] = [];
            this.resourceCache[name_sprite] = image;
            config.forEach((elem) => {
                this.config_cache[name_sprite][elem.name] = elem;
            });
        }
        getConfig(name_sprite, name_elem) {
            return this.config_cache[name_sprite][name_elem];
        }
        getJson(name_sprite, name) {
            return this.configCache[name_sprite][name];
        }
        get(name_sprite, name) {
            return this.resourceCache[name_sprite][name];
        }
        pushImage(img, name_sprite, index) {
            if (!this.resourceCache[name_sprite][index]) {
                obj.resourceCache[name_sprite][index] = img;
            }
        }
        onReady(name_sprite, image_name) {
            let obj = this;
            return new Promise((resolve) => {
                let checkLoad = () => {
                    if (obj.isReadySprite(name_sprite)) {
                        resolve({
                            image: this.resourceCache[name_sprite],
                            config_elem: obj.getConfig(name_sprite, image_name),
                            optimize: "sprite_manager",
                        });
                    }
                    else {
                        setTimeout(checkLoad, 40);
                    }
                };
                checkLoad();
            });
        }
        isReadySprite(name_sprite) {
            var ready = false;
            if (!!this.resourceCache[name_sprite]) {
                ready = true;
            }
            return ready;
        }
    }
    exports.SpriteManager = SpriteManager;
});
define("lib/scene", ["require", "exports", "lib/animation/speak", "lib/animation/dragon_update", "lib/imageManager", "lib/spriteManager", "lib/path"], function (require, exports, speak_1, dragon_update_1, imageManager_2, spriteManager_1, path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SceneBuilder {
        constructor(root, loader) {
            this.toStart = (story) => {
                story.animation.forEach((a) => a.stop());
                story.showSlide({
                    data: document.createElement("div"),
                    contex: "interactive",
                });
                story.showState([
                    { name: "professor", state: "none" },
                    { name: "digobin", state: "none" },
                ]);
                story.play("intro");
            };
            this.toHome = (story) => {
                window.location.href = "/digobin/";
            };
            this.root = root;
            this.loader = loader;
            this.elements = { children: {}, name: null };
            this.menuCreated = false;
            this.imageManager = new imageManager_2.ImageManager();
            this.spriteManager = new spriteManager_1.SpriteManager();
        }
        createElement(obj) {
            let res = {
                name: obj.name,
                node: null,
                children: {},
                path: null,
                data: null,
                animation: [],
            };
            !!obj.optimizeLoad ? (res.optimizeLoad = obj.optimizeLoad) : "";
            !!obj.setBlink ? (res.setBlink = obj.setBlink) : "";
            !!obj.cacheImage ? (res.cacheImage = obj.cacheImage) : "";
            return res;
        }
        createTree(data, parentNode, path, parent, story) {
            return Promise.all(data.map((obj, order) => {
                var element = this.createElement(obj), el, res;
                if (!!obj.path2sprite) {
                    element.path2sprite = obj.path2sprite;
                }
                if (obj.hasOwnProperty("type")) {
                    if (obj.type == "dragon") {
                        el = document.createElement("canvas");
                        el.setAttribute("id", "canvas_" + obj.name);
                    }
                    else {
                        el = document.createElement(obj.type);
                        if (obj.type == "canvas") {
                            el.width = 800;
                            el.height = 800;
                            el.setAttribute("id", "canvas_" + obj.name);
                        }
                        element.type = obj.type;
                        element.x = obj.left;
                        element.zIndex = obj.zIndex;
                        element.y = obj.top;
                        if (obj.type == "input") {
                            el.type = obj.options.type;
                            el.addEventListener(obj.options.event, this[obj.options.func]);
                        }
                    }
                }
                else {
                    el = document.createElement("div");
                }
                if (obj.hasOwnProperty("hidden") && obj.hidden) {
                    el.style.display = "none";
                }
                if (obj.hasOwnProperty("children")) {
                    res = this.createTree(obj.children, el, path, element, story);
                }
                if (obj.hasOwnProperty("scale")) {
                    el.style.transform = "scale(" + obj.scale + ")";
                }
                if (obj.hasOwnProperty("file")) {
                    element.path = path + obj.file;
                    res = this.loader.load(element.path).then((result) => {
                        var res;
                        if (obj.hasOwnProperty("type") && obj.type == "dragon") {
                            res = this.createDragonUpdate(result.data, el, result.path, element, parent).then(() => {
                                var dragon = new dragon_update_1.DragonAnimationUpdate(result.data, element.children, obj.name);
                                dragon.show();
                                element.animation.push(dragon);
                            });
                        }
                        else if (obj.hasOwnProperty("file")) {
                            var relpath = path_2.dirname(obj.file) + "/";
                            res = this.createTree(result.data, el, relpath, element, story).then(() => {
                                if (obj.hasOwnProperty("animation")) {
                                    if (obj.animation.includes("speak")) {
                                        element.animation.push(new speak_1.SpeakAnimation(element.children));
                                    }
                                }
                            });
                        }
                        return res;
                    });
                }
                if (!this.menuCreated) {
                    this.menuCreated = true;
                    parentNode.appendChild(this.createMenu(story));
                }
                if (obj.hasOwnProperty("path")) {
                    element.path = path + obj.path;
                    var tmp = document.createElement("span");
                    parentNode.appendChild(tmp);
                    if (parent.optimizeLoad == "image_manager") {
                        if (!this.imageManager.checkIndexImage(element.name)) {
                            this.imageManager.pushIndexImage(element.name);
                            res = this.loader.load(element.path).then((image) => {
                                element.node = image.data.cloneNode();
                                this.imageManager.pushImage(image.data.cloneNode(), element.name);
                                this.setNodeProps(element.node, obj, parent);
                                parent.children[obj.name] = element;
                                parentNode.replaceChild(element.node, tmp);
                            });
                        }
                        else {
                            this.imageManager.onReady(element.name).then((result) => {
                                element.node = result;
                                this.setNodeProps(element.node, obj, parent);
                                parent.children[obj.name] = element;
                                parentNode.replaceChild(element.node, tmp);
                            });
                        }
                    }
                    else if (parent.optimizeLoad == "sprite_manager") {
                        if (!this.spriteManager.checkIndexImage(parent.name + "_sprite")) {
                            this.spriteManager.pushIndexImage(parent.name + "_sprite");
                            let res_json = this.loader.load(parent.path2sprite + parent.name + "_sprite_config.json");
                            res = this.loader.load(parent.path2sprite + parent.name + "_sprite.png");
                            res.then((result) => {
                                res_json.then((json) => {
                                    this.spriteManager.startSplit(result.data.cloneNode(), parent.name + "_sprite", json.data);
                                });
                            });
                        }
                        this.spriteManager.onReady(parent.name + "_sprite", element.name).then((res) => {
                            element.node = res.image;
                            element.x = obj.left;
                            element.y = obj.top;
                            element.data = { sprite: res.sprite, config: res.config_elem, optimize: "sprite_manager" };
                            parent.children[obj.name] = element;
                        });
                    }
                    else {
                        res = this.loader.load(element.path).then((image) => {
                            element.node = image.data.cloneNode();
                            this.setNodeProps(element.node, obj, parent);
                            parent.children[obj.name] = element;
                            parentNode.replaceChild(element.node, tmp);
                        });
                    }
                }
                else {
                    this.setNodeProps(el, obj, parent);
                    element.node = el;
                    parent.children[obj.name] = element;
                    parentNode.appendChild(element.node);
                }
                return res && res;
            }));
        }
        createMenu(story) {
            let menu = document.createElement("div"), inputs = [
                { name: "home", func: "toHome" },
                { name: "settings", func: "" },
                { name: "retry", func: "toStart" },
            ];
            menu.className = "menu";
            inputs.forEach((elem) => {
                let btn = document.createElement("input");
                btn.type = "button";
                if (elem.func != "") {
                    btn.addEventListener("click", () => this[elem.func](story));
                }
                btn.className = "menu_" + elem.name;
                menu.appendChild(btn);
            });
            return menu;
        }
        createDragonUpdate(data, parentNode, path, parent, person) {
            var images = data.armature[0].skin[0].slot, obj = this;
            var projectPath = path_2.projectName(path) + "_texture/", res, res_json, imageFromManager;
            return Promise.all(images.map((image) => {
                var element = this.createElement(image.name);
                if (person.optimizeLoad == "image_manager") {
                    imageFromManager = this.imageManager.checkIndexImage(image.name);
                    if (!imageFromManager) {
                        this.imageManager.pushIndexImage(image.name);
                        res = this.loader.load(person.cacheImage + image.name + ".png");
                        return res.then((result) => {
                            this.imageManager.pushImage(result.data.cloneNode(), image.name);
                            element.node = result.data.cloneNode();
                            parent.children[image.name] = element;
                            parentNode.appendChild(element.node);
                        });
                    }
                    else {
                        return this.imageManager.onReady(image.name, "image_manager").then((result) => {
                            element.node = result;
                            parent.children[image.name] = element;
                            parentNode.appendChild(element.node);
                        });
                    }
                }
                if (person.optimizeLoad == "sprite_manager") {
                    if (!this.spriteManager.checkIndexImage(parent.name + "_sprite")) {
                        this.spriteManager.pushIndexImage(parent.name + "_sprite");
                        res_json = this.loader.load(projectPath + parent.name + "_sprite_config.json");
                        res = this.loader.load(projectPath + parent.name + "_sprite.png");
                        res.then((result) => {
                            res_json.then((json) => {
                                this.spriteManager.startSplit(result.data.cloneNode(), parent.name + "_sprite", json.data);
                            });
                        });
                    }
                    return this.spriteManager.onReady(parent.name + "_sprite", image.name).then((res) => {
                        element.node = res.image;
                        element.data = { sprite: res.sprite, config: res.config_elem, optimize: "sprite_manager" };
                        parent.children[image.name] = element;
                        parentNode.appendChild(element.node);
                    });
                }
                res = this.loader.load(projectPath + image.name + ".png");
                return res.then((result) => {
                    element.node = result.data.cloneNode();
                    parent.children[image.name] = element;
                    parentNode.appendChild(element.node);
                });
            }));
        }
        setNodeProps(el, obj, parent) {
            el.className = parent.name ? parent.name + "_" + obj.name : obj.name;
            if (typeof obj.class != "undefined") {
                el.classList.add(obj.class);
            }
            el.style.position = "absolute";
            el.style.left = obj.left + "px";
            el.style.top = obj.top + "px";
            if (obj.zIndex) {
                el.style.zIndex = obj.zIndex;
            }
            if (obj.hasOwnProperty("hidden") && obj.hidden) {
                el.style.display = "none";
            }
            if (obj.width) {
                el.style.width = obj.width + "px";
            }
            if (obj.height) {
                el.style.height = obj.height + "px";
            }
        }
        createScene(data, relpath = "/", story = {}) {
            return this.createTree(data, this.root, relpath, this.elements, story);
        }
    }
    exports.SceneBuilder = SceneBuilder;
});
define("lib/url", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getUrlParams(search) {
        let hashes = search.slice(search.indexOf('?') + 1).split('&');
        let params = {};
        hashes.map(hash => {
            let [key, val] = hash.split('=');
            params[key] = decodeURIComponent(val);
        });
        return params;
    }
    exports.getUrlParams = getUrlParams;
});
define("lib/animation/animation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HeadSprites {
        constructor(canvas) {
            this.imgMap = {};
            this.names = ["AI", "E", "etc", "FV", "L", "MBP", "O", "rest", "U", "WQ"];
            this.phoneMap = {
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
            this.timeStep = () => {
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
        play(list) {
            this.list = list;
            this.startTime = Date.now();
            this.timeStep();
        }
    }
    exports.HeadSprites = HeadSprites;
});
define("lib/event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EventListener {
        constructor() {
            this.list = [];
        }
        add(x) {
            this.list.push(x);
        }
        remove(x) {
            const pos = this.list.indexOf(x);
            if (pos >= 0) {
                this.list.splice(pos, 1);
            }
        }
        fire(...args) {
            this.list.forEach(x => x.apply(null, args));
        }
    }
    exports.EventListener = EventListener;
});
define("lib/audio", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findName(time, data) {
        for (var i = 1; i < data.length; i++) {
            if (data[i].start > time) {
                return data[i - 1].name;
            }
        }
        return "rest";
    }
    class AudioFragment {
        constructor(name, startOffset, endOffset) {
            this.startOffset = 0;
            this.endOffset = 0;
            this.name = name;
            this.startOffset = startOffset;
            this.endOffset = endOffset;
        }
    }
    exports.AudioFragment = AudioFragment;
    class AudioSprites {
        constructor(audio, fragments) {
            this.onTimeUpdate = () => {
                if (this.current && this.audio.currentTime >= this.current.endOffset) {
                    console.log("end", this.audio.currentTime);
                    this.audio.pause();
                }
            };
            this.audio = audio;
            this.fragments = fragments;
            this.current = null;
            this.audio.ontimeupdate = this.onTimeUpdate;
        }
        playName(name) {
            var num = this.fragments.findIndex((f) => f.name == name);
            this.current = this.fragments[num];
            this.current.play(this.audio);
        }
        play(num) {
            let those = this;
            this.current = this.fragments[num];
            this.audio.currentTime = this.current.startOffset;
            this.audio.play();
        }
        stop() {
            this.audio.pause();
        }
    }
    exports.AudioSprites = AudioSprites;
    function loadAudio(path, name) {
        var audio = new Audio(path + name + ".ogg");
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
    exports.loadAudio = loadAudio;
    function loadTiming(path) {
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
    exports.loadTiming = loadTiming;
    function loadSpriteTiming(path) {
        return fetch(path)
            .then((x) => x.json())
            .then((list) => {
            return list.map((row) => row.map(([name, time_begin, time_end]) => ({ name, time_begin, time_end })));
        });
    }
    exports.loadSpriteTiming = loadSpriteTiming;
});
define("lib/order", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getItem(name, list) {
        return list.find(item => item.name == name);
    }
    function saveItem(item, list) {
        if (list.indexOf(item) < 0) {
            list.push(item);
            return true;
        }
        return false;
    }
    function setLinksOrder(name, list, result) {
        let item = getItem(name, list);
        if (saveItem(item, result)) {
            if (item.next) {
                setLinksOrder(item.next, list, result);
            }
            if (item.actions) {
                for (var i in actions) {
                    if (actions.hasOwnProperty(i)) {
                        setLinksOrder(actions[i], list, result);
                    }
                }
            }
        }
    }
    function orderList(list) {
        var acc = [];
        list.forEach(item => setLinksOrder(item.name, list, acc));
        return acc;
    }
    exports.orderList = orderList;
});
define("story", ["require", "exports", "react", "react-dom", "lib/loader", "lib/animation/animation", "lib/audio", "lib/order"], function (require, exports, React, ReactDOM, loader_1, animation_1, audio_1, order_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Range {
        constructor(from, to) {
            this.from = Math.min(from, to);
            this.to = Math.max(from, to);
            this.offset = 1;
        }
        overlap(r) {
            return this.offset == r.offset && !(this.from > r.to || r.from > this.to);
        }
    }
    function orderRanges(ranges) {
        for (var i = 1; i < ranges.length; i++) {
            var r = ranges[i];
            for (var j = 0; j < ranges.length; j++) {
                if (i != j && r.overlap(ranges[j])) {
                    r.offset++;
                    j = 0;
                }
            }
        }
    }
    function createRanges(list) {
        var result = [];
        list.forEach((value, i) => {
            if (value.hasOwnProperty('next') && value.next) {
                result.push(new Range(i, list.findIndex(item => item.name == value.next)));
            }
            if (value.hasOwnProperty('actions')) {
                for (var j in value.actions) {
                    if (value.actions.hasOwnProperty(j)) {
                        result.push(new Range(i, list.findIndex(item => item.name == value.actions[j])));
                    }
                }
            }
        });
        return result;
    }
    class Role {
        constructor() {
            this.audio = null;
            this.head = null;
            this.timing = null;
        }
    }
    class App extends React.Component {
        constructor(props) {
            super(props);
            this.onSelect = (name) => {
                this.setState({ project: name, page: 'project' });
            };
            this.onChangePage = (name) => {
                this.setState({ page: 'project-list' });
            };
            this.state = { projects: [], page: 'project-list' };
        }
        componentDidMount() {
            fetch('/src/__projects', {}).then(r => r.json()).then(r => {
                this.setState({ projects: r });
            });
        }
        render() {
            if (this.state.page == 'project-list') {
                return React.createElement(ProjectList, { projects: this.state.projects, onSelect: this.onSelect });
            }
            if (this.state.page == 'project') {
                return React.createElement(Project, { project: this.state.project, onRoute: this.onChangePage });
            }
        }
    }
    class ProjectList extends React.Component {
        render() {
            return (React.createElement("div", { className: "project" },
                React.createElement("ul", null, this.props.projects.map(name => React.createElement("li", null,
                    React.createElement("a", { onClick: this.props.onSelect.bind(null, name), className: "project__name" }, name))))));
        }
    }
    class Project extends React.Component {
        constructor(props) {
            super(props);
            this.onSelectStep = (name, event) => {
                var data = this.state.data.find(item => item.name == name);
                this.setState({ step: name, value: data, labels: this.roles[data.active].audio.fragments, playAudio: false });
            };
            this.onChange = (key, n, event) => {
                var value = this.state.value;
                if (key == 'text') {
                    value[key][n] = event.target.value;
                }
                if (key == 'label') {
                    if (!value.hasOwnProperty('sound_labels')) {
                        value.sound_labels = [];
                    }
                    value.sound_labels[n] = this.state.labels[parseInt(event.target.value, 10)].name;
                }
                this.setState({ edit: true, value: value });
            };
            this.onAdd = (event) => {
                var value = this.state.value;
                value.text.push("");
                this.setState({ value: value, edit: true });
            };
            this.onStepAdd = (event) => {
                var data = this.state.data;
                data.push({
                    active: 'professor', text: [], next: 'step' + (data.length + 1), name: 'step' + data.length, show: [{
                            name: "professor",
                            state: "default"
                        },
                        {
                            name: "digobin",
                            state: "default"
                        }],
                    lesson: this.props.project,
                    instantTransitionStep: "",
                    timeTransition: "10",
                    order: data.length
                });
                this.setState({ data: data });
            };
            this.onOrder = (event) => {
                var data = order_1.orderList(this.state.data);
                this.setState({ data: data });
            };
            this.onChangeActive = (event) => {
                var value = this.state.value, data = this.state.data;
                value.active = event.target.value;
                if (event.target.value == 'digobin') {
                    value.show[1].state = 'speak';
                }
                else {
                    value.show[1].state = 'default';
                }
                this.setState({ edit: true, value: value, data: data });
            };
            this.onChangeNext = (event) => {
                var value = this.state.value;
                value.next = event.target.value;
                this.setState({ edit: true, value: value });
            };
            this.onChangeSlide = (event) => {
                var value = this.state.value;
                value.slide = event.target.value;
                this.setState({ edit: true, value: value });
            };
            this.onAddImage = (event) => {
                var value = this.state.value;
                value.interactive = "createImg";
                value.slide = "slides_" + this.props.project + "/" + value.slide;
                this.setState({ edit: true, value: value });
            };
            this.onSave = (event) => {
                var index = this.state.data.findIndex(item => item.name == this.state.step);
                var value = this.state.data[index];
                var data = Object.assign(value, this.state.value);
                this.state.data[index] = data;
                this.state.data.sort();
                let arr = this.state.data;
                arr = arr.map((elem, i, arr) => {
                    elem.instantTransitionStep = elem.next;
                    elem.order = i;
                    return elem;
                });
                arr = arr.sort((a, b) => {
                    if (a.order < b.order) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                });
                var options = {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({ name: this.props.project, data: { status: "development", steps: arr } })
                };
                fetch('/__save', options).then(r => {
                    this.setState({ data: this.state.data });
                });
                this.setState({ edit: false, playAudio: false });
            };
            this.onSplit = (event) => {
                var data = this.state.value, step, val = this.state.value, arrStep = this.state.data;
                var arrRes = [], textArr = data.text;
                var index = this.state.data.findIndex(item => item.name == data.name), next = data.next;
                textArr.forEach((elem, i, arr) => {
                    step = { active: data.active, text: [elem] };
                    if (i != textArr.length - 1) {
                        step.next = data.name + "." + (i + 1);
                    }
                    else {
                        step.next = next;
                    }
                    if (i != 0) {
                        step.name = data.name + "." + i;
                    }
                    else {
                        step.name = data.name;
                    }
                    step.show = data.show;
                    step.lesson = data.lesson;
                    step.slide = data.slide;
                    step.instantTransitionStep = data.instantTransitionStep;
                    step.timeTransition = data.timeTransition;
                    step.interactive = data.interactive;
                    step.sound_labels = [data.sound_labels[i]];
                    arrRes.push(step);
                });
                arrStep.splice(index, 1);
                arrStep = arrStep.concat(arrRes);
                this.setState({
                    data: arrStep,
                    edit: true,
                    value: arrStep[arrStep.length]
                });
            };
            this.onChangeTimeTransition = (event) => {
                var step = this.state.value;
                step.timeTransition = event.target.value;
                this.setState({
                    edit: true,
                    playAudio: false
                });
            };
            this.roles = {
                digobin: new Role(),
                professor: new Role()
            };
            this.secInterval = 0;
            this.fragmentId = -1;
            this.state = { data: [], step: 'intro', value: null, labels: [], edit: false, playAudio: false };
        }
        getIndex(name, list) {
            return list.findIndex(item => item.name == name);
        }
        playAudio(n) {
            var data = this.state.value;
            var name = data.active;
            var k = this.getIndex(data.sound_labels[n], this.state.labels);
            var role = this.roles[name];
            if (this.fragmentId >= 0) {
                role.audio.stop();
            }
            if (k !== false) {
                this.fragmentId = k;
                role.head.play(role.timing[this.fragmentId]);
                role.audio.play(this.fragmentId);
            }
            this.setState({
                playAudio: true
            });
        }
        componentDidMount() {
            var rs = new loader_1.ResourceManager();
            var professor = this.roles.professor;
            var digobin = this.roles.digobin;
            var projectPath = './assets/projects/' + this.props.project;
            rs.load(projectPath + '/index.json').then((r) => {
                this.setState({ data: r.data.steps });
            });
            audio_1.loadAudio(projectPath + '/audio/', 'professor').then(list => {
                professor.audio = list;
            });
            audio_1.loadAudio(projectPath + '/audio/', 'digobin').then(list => {
                digobin.audio = list;
            });
            audio_1.loadSpriteTiming(projectPath + '/speak/digobin.json').then(list => {
                digobin.timing = list;
            });
            audio_1.loadSpriteTiming(projectPath + '/speak/professor.json').then(list => {
                professor.timing = list;
            });
            var canvas = document.getElementById('image');
            professor.head = new animation_1.HeadSprites(canvas);
            professor.head.load('./assets/library/head/professor');
            digobin.head = new animation_1.HeadSprites(canvas);
            digobin.head.load('./assets/library/head/digobin');
        }
        render() {
            return (React.createElement("div", { className: "app" },
                React.createElement("div", { className: "menu" },
                    React.createElement("button", { onClick: this.props.onRoute }, "\u043F\u0440\u043E\u0435\u043A\u0442\u044B"),
                    React.createElement("button", { onClick: this.onOrder }, "\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"),
                    React.createElement("button", { className: "step__add", onClick: this.onStepAdd }, "\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u043B\u0430\u0439\u0434")),
                React.createElement("div", { className: "workarea" },
                    React.createElement(Story, { data: this.state.data, onSelectStep: this.onSelectStep, onStepAdd: this.onStepAdd }),
                    this.state.value ?
                        React.createElement(Step, { edit: this.state.edit, playAudio: this.state.playAudio, data: this.state.value, name: this.state.step, labels: this.state.labels, steps: this.state.data.map(item => item.name), onChangeActive: this.onChangeActive, onChangeNext: this.onChangeNext, onChangeTimeTransition: this.onChangeTimeTransition, onChangeSlide: this.onChangeSlide, onAddImage: this.onAddImage, onAdd: this.onAdd, onSave: this.onSave, onChange: this.onChange, onSplit: this.onSplit, onPlay: this.playAudio.bind(this) })
                        : [])));
        }
    }
    class Select extends React.Component {
        render() {
            return (React.createElement("select", { onChange: this.props.onChange }, this.props.data.map(v => React.createElement("option", { value: v, selected: v == this.props.selected }, v))));
        }
    }
    function cx(...arr) {
        return arr.filter(x => x).join(' ');
    }
    function getWords(text) {
        return text.toLowerCase().split(/[\s.\-\"\'\?]/g).filter(x => x.length);
    }
    function matchLabel(label, w) {
        var s = 0, last = 0;
        for (var j = 0; j < label.length; j++) {
            for (var i = last; i < w.length; i++) {
                if (label[j] == w[i]) {
                    s++;
                    last = i;
                    break;
                }
            }
        }
        return s;
    }
    class VoiceLabel extends React.Component {
        constructor(props) {
            super(props);
            this.onClick = (event) => {
                event.stopPropagation();
                this.props.onChange(event);
                this.setState({ show: false });
            };
            this.onShow = (event) => {
                event.stopPropagation();
                this.setState({ show: true });
            };
            this.setWrapperRef = (node) => {
                this.wrapperRef = node;
            };
            this.hide = (event) => {
                if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
                    this.setState({ show: false });
                }
            };
            this.wrapperRef = null;
            this.state = { show: false };
        }
        componentDidMount() {
            document.addEventListener('mousedown', this.hide);
        }
        componentWillUnmount() {
            document.removeEventListener('mousedown', this.hide);
        }
        render() {
            var text = getWords(this.props.text);
            var matches = this.props.labels.map((label, n) => {
                return matchLabel(getWords(label.name || ''), text);
            });
            var maxm = Math.max.apply(null, matches);
            return (React.createElement("div", { className: "ui-select" },
                React.createElement("div", { className: "selected", onClick: this.onShow }, ((this.props.selected !== false && this.props.selected >= 0) && this.props.labels[this.props.selected].name) || '--'),
                React.createElement("div", { className: "select", style: { display: this.state.show ? 'block' : 'none' }, ref: this.setWrapperRef },
                    React.createElement("div", { className: "option", value: false, onClick: this.onClick }, "--"),
                    this.props.labels.map((label, n) => {
                        return React.createElement("option", { className: cx("option", n === this.props.selected && '  ', matches[n] == maxm && 'option--match'), value: n, onClick: this.onClick },
                            n,
                            ")  ",
                            label.name);
                    })),
                " ",
                React.createElement("button", { onClick: this.props.onPlay.bind(null, this.props.selected) }, "play"),
                "   "));
        }
    }
    class Step extends React.Component {
        constructor(props) {
            super(props);
            this.setTimer = () => {
                let secFuture = 0;
                clearInterval(this.interval);
                if (this.props.playAudio) {
                    this.interval = setInterval(() => {
                        secFuture = this.state.sec;
                        secFuture += 1;
                        if (!this.props.playAudio) {
                            clearInterval(this.interval);
                            secFuture = 0;
                        }
                        this.setState({ sec: secFuture });
                    }, 1000);
                }
            };
            this.interval;
            this.state = {
                sec: 0
            };
        }
        getIndex(name, list) {
            return list.findIndex(item => item.name == name);
        }
        render() {
            var data = this.props.data;
            return (React.createElement("div", { className: "step" },
                React.createElement("div", { style: { marginBottom: 10 } },
                    React.createElement("button", { className: "step__save", onClick: this.props.onSave }, "\u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"),
                    this.props.edit ? React.createElement("span", { className: "step__edit" }, "*") : null),
                React.createElement("div", null,
                    React.createElement("div", { className: "step__active" },
                        this.props.name,
                        " - ",
                        React.createElement(Select, { data: ['professor', 'digobin'], selected: data.active, onChange: this.props.onChangeActive })),
                    data.text.map((text, n) => {
                        return React.createElement("div", { className: "step__item" },
                            React.createElement("textarea", { className: "step__text", value: text, onChange: this.props.onChange.bind(this, 'text', n) }),
                            React.createElement(VoiceLabel, { labels: this.props.labels, selected: data.hasOwnProperty('sound_labels') && this.getIndex(data.sound_labels[n], this.props.labels), text: text, onChange: this.props.onChange.bind(this, 'label', n), onPlay: this.props.onPlay.bind(this, n) }));
                    }),
                    this.props.playAudio ? React.createElement("div", null,
                        this.setTimer(),
                        " ",
                        React.createElement("input", { type: "button", onClick: this.props.onChangeTimeTransition, value: this.state.sec }),
                        " \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u043D\u0430 \u0441\u043B\u0435\u0434 \u043A\u0430\u0434\u0440 ") : "",
                    React.createElement("br", null),
                    React.createElement("br", null),
                    React.createElement("hr", null),
                    React.createElement("textarea", { className: "step__text", placeholder: '>\u041F\u043E\u043B\u0435 "slide"  ->  \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u0442\u0435\u043A\u0441\u0442', value: data.slide, onChange: this.props.onChangeSlide }),
                    " ",
                    React.createElement("br", null),
                    React.createElement("button", { className: "step__add-text", onClick: this.props.onAddImage }, "\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u0430\u043A  \u0438\u0437\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"),
                    "   ",
                    React.createElement("button", { className: "step__add-text", onClick: this.props.onSplit }, "\u0440\u0430\u0437\u0431\u0438\u0442\u044C step"),
                    "    ",
                    React.createElement("br", null),
                    " ",
                    React.createElement("br", null),
                    React.createElement("button", { className: "step__add-text", onClick: this.props.onAdd }, "\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C"),
                    React.createElement("div", { style: { marginTop: 10 }, className: "step__next" },
                        React.createElement(Select, { data: this.props.steps, selected: data.next, onChange: this.props.onChangeNext })))));
        }
    }
    class Story extends React.Component {
        render() {
            var rlist = createRanges(this.props.data);
            orderRanges(rlist);
            return (React.createElement("div", { className: "story" },
                React.createElement("div", null, this.props.data.map((item) => {
                    return React.createElement("div", { className: "story__item story__item--" + item.active, onClick: this.props.onSelectStep.bind(this, item.name) }, item.name);
                })),
                React.createElement("div", null, rlist.map((r) => {
                    return React.createElement("div", { className: 'story__bar', style: { height: 56 * (r.to - r.from) + 6, top: 56 * r.from + 27, left: 232, width: 10 * r.offset } });
                }))));
        }
    }
    ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
});
define("lib/animation/teletype", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Teletype {
        constructor(node) {
            this.node = node;
            this.text = '';
            this.textIndex = 0;
            this.id = 0;
            this.speed = 40;
            this.updateChar = this._updateChar.bind(this);
        }
        setText(text) {
            this.text = text;
            if (this.id) {
                clearTimeout(this.id);
            }
            this.animate();
        }
        finish() {
            clearTimeout(this.id);
            this.node.textContent = this.text;
        }
        getTegIndex(text, index) {
            let countEnd = 0;
            while (true) {
                if (text[index] == ">") {
                    countEnd++;
                }
                if (countEnd == 2 || index > text.length - 1) {
                    break;
                }
                index++;
            }
            index++;
            return index;
        }
        _updateChar() {
            if (this.textIndex <= this.text.length) {
                let span = document.createElement("span");
                if (this.text[this.textIndex] == "&" && this.text[this.textIndex + 1] == "<") {
                    this.text = this.text.substr(0, this.textIndex) + this.text.substr(this.textIndex + 1, this.text.length);
                    span.innerHTML = this.text.substr(0, this.textIndex - 1);
                    this.node.append(span);
                    this.textIndex = this.getTegIndex(this.text, this.textIndex);
                    span.innerHTML = this.text.substr(0, this.textIndex);
                    this.node.innerHTML = "";
                    this.node.append(span);
                }
                else {
                    this.node.innerHTML = "";
                    span.innerHTML = this.text.substr(0, this.textIndex);
                    this.node.append(span);
                }
                this.textIndex++;
                this.node.classList.add('textblock__content');
                if (this.textIndex > 100) {
                    this.node.scrollBy(0, 3.3);
                }
            }
            else {
                clearTimeout(this.id);
            }
            this.id = setTimeout(this.updateChar, this.speed);
        }
        animate() {
            this.node.textContent = '';
            this.textIndex = 0;
            this.updateChar();
        }
    }
    exports.Teletype = Teletype;
});
define("lib/animation/person_animation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PersonAnimation {
        constructor() {
            this.names = ["AI", "E", "etc", "FV", "L", "MBP", "O", "rest", "U", "WQ"];
            this.interval = null;
            this.phoneMap = {
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
            this.timeStep = () => {
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
                ctx.drawImage(elem.node, elem.data.config.x, elem.data.config.y, elem.data.config.width, elem.data.config.height, -elem.data.config.width / 2, -elem.data.config.height / 2, elem.data.config.width, elem.data.config.height);
            }
            else {
                ctx.drawImage(elem.node, -parseInt(elem.node.style.width.split("px")[0]) / 2, -parseInt(elem.node.style.height.split("px")[0]) / 2);
            }
            ctx.restore();
        }
        setSprite(list = [], res) {
            let ctx = res.node.getContext("2d"), mount = false, eyes = false;
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
                }
                else {
                    if (list[i].type == "mount") {
                        if (!mount && list[i].name == "MBP") {
                            mount = true;
                            this.draw(list[i], ctx);
                        }
                    }
                    else {
                        this.draw(list[i], ctx);
                    }
                }
            }
            if (eyes)
                this.showElemSprite(list, ctx);
        }
        showElemSprite(list, ctx) {
            clearTimeout(this.spriteInterval);
            let mount = false, sortable = [];
            for (var key in list) {
                sortable.push(list[key]);
            }
            sortable.sort((a, b) => {
                return (a.zIndex - b.zIndex);
            });
            list = sortable;
            this.spriteInterval = setTimeout(() => {
                this.spriteEyesOpen = !this.spriteEyesOpen;
                ctx.clearRect(0, 0, 2000, 1000);
                for (var i in list) {
                    if (list[i].type == "eyes") {
                        if (this.spriteEyesOpen) {
                            if (list[i].name == "Open") {
                                this.showElemSprite(list, ctx);
                                this.draw(list[i], ctx);
                            }
                        }
                        else {
                            if (list[i].name == "Close") {
                                this.showElemSprite(list, ctx);
                                this.draw(list[i], ctx);
                            }
                        }
                    }
                    else {
                        if (list[i].type == "mount") {
                            if (!mount && list[i].name == "MBP") {
                                mount = true;
                                this.draw(list[i], ctx);
                            }
                        }
                        else {
                            this.draw(list[i], ctx);
                        }
                    }
                }
            }, this.spriteEyesOpen ? 3100 : 190);
        }
        setEye(list, timeInt, endSpeak, ctx) {
            clearTimeout(this.interval);
            this.interval = setTimeout(() => {
                this.eyesOpen = !this.eyesOpen;
                if (this.eyesOpen) {
                    this.setEye(list, 2900, endSpeak, ctx);
                }
                else {
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
                }
                else {
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
                        }
                        else {
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
    exports.PersonAnimation = PersonAnimation;
});
define("lib/interactive/defaultInteractive", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefaultInteractive {
        constructor(obj) {
            this.createImg = (slide, area, step, textIndex) => {
                if (area == "play" && slide.context != "interactive") {
                    let img = document.createElement("img"), objShell = document.createElement("div");
                    img.setAttribute("src", "../assets/library/interactive/" + slide);
                    img.classList.add("image");
                    objShell.setAttribute("id", "block");
                    objShell.appendChild(img);
                    return { data: objShell, context: "interactive" };
                }
                else {
                    return slide;
                }
            };
            this.createImgIntro = (slide, area, step, textIndex) => {
                let obj = this.createImg(slide, area, step, textIndex);
                let hideBlock = document.getElementsByClassName("textblock")[0];
                hideBlock.style.display = "none";
                hideBlock = document.getElementsByClassName("end_speach_icon")[0];
                hideBlock.style.display = "none";
                this.backgroundDefault(slide, area, step, textIndex);
                if (typeof obj.data != "undefined") {
                    if (typeof obj.data.firstElementChild != "undefined") {
                        obj.data.style.marginLeft = "0px";
                        obj.data.firstElementChild.classList.add("image-entry");
                        return obj;
                    }
                }
            };
            this.falseAnswerAnimation = (animation = "") => {
                clearTimeout(this.animation);
                if (animation == "") {
                    animation = this.answerFalseAnimation[Math.floor(Math.random() * this.answerFalseAnimation.length)];
                }
                this.getAnimation(animation);
            };
            this.trueAnswerAnimation = (animation = "", timeOut = 0) => {
                if (animation == "") {
                    animation = this.answerAgreeAnimation[Math.floor(Math.random() * this.answerAgreeAnimation.length)];
                }
                this.getAnimation(animation);
                if (timeOut != 0) {
                    clearTimeout(this.animation);
                    this.animation = setTimeout(() => {
                        this.obj.showState([{ name: "professor", state: "default" }]);
                    }, timeOut * 1000);
                }
            };
            this.clearSlide = (slide = {}, area = {}, step = {}, textIndex = {}) => {
                return { data: document.createElement("div"), contex: "interactive" };
            };
            this.intro = (slide, area, step, textIndex) => {
                this.backgroundDefault();
            };
            this.showAfterTime = (slide, area, step, textIndex) => {
                setTimeout(() => {
                    let arrElem = document.getElementsByClassName("hideContent");
                    for (let i = 0; i < arrElem.length; i++) {
                        arrElem[i].classList.add("prominentNumber");
                    }
                }, step.timeout * 1000);
                return this.defaultSlide(slide);
            };
            this.obj = obj;
            this.answerFalseAnimation = ["false_answer_animation", "false_answer_animation_cris_cros"];
            this.answerAgreeAnimation = ["agree_face_SG", "agree_palm_SG"];
        }
        getAnimation(animation) {
            for (var i in this.obj.groups.professor.children) {
                if (this.obj.groups.professor.children.hasOwnProperty(i)) {
                    this.obj.groups.professor.children[i].node.style.display = i == animation ? "block" : "none";
                    this.obj.showState([{ name: "professor", state: animation }]);
                }
            }
        }
        showTextBlock(slide, area, step, textIndex) {
            let hideBlock = document.getElementsByClassName("textblock")[0];
            hideBlock.style.display = "block";
            hideBlock = document.getElementsByClassName("end_speach_icon")[0];
            hideBlock.style.display = "block";
            return slide;
        }
        defaultSlide(content) {
            if (content.context != "interactive" && content.fontSize === undefined && content != "") {
                var objHtml = document.createElement("div");
                if (content.type != "html") {
                    if (content.length > 80) {
                        objHtml.classList.add("defaultSlide__mini-font");
                    }
                    objHtml.innerHTML = content;
                }
                else {
                    objHtml.innerHTML = content.text;
                }
                objHtml.classList.add("defaultSlide");
                return { data: objHtml, context: "interactive" };
            }
            else {
                return content;
            }
        }
        backgroundDefault(slide = {}, area = {}, step = {}, textIndex = {}) {
            document.getElementsByClassName("background")[0].style.display = "block";
            let textBlock = document.getElementsByClassName("textblock")[0];
            textBlock.style.bottom = "60px";
            textBlock.style.width = "600px";
            textBlock.style.left = "50%";
        }
        showElem(timeOut, arrElem, i) {
            setTimeout(() => {
                arrElem[i].classList.add("prominentNumber");
                if (i < arrElem.length - 1) {
                    i++;
                    this.showElem(timeOut, arrElem, i);
                }
            }, timeOut.interval * 3000);
        }
        showAfterTimeConsistently(slide, area, step, textIndex) {
            setTimeout(() => {
                let arrElem = document.getElementsByClassName("hideContent"), i = 0;
                this.showElem(step.timeout, arrElem, i);
            }, step.timeout.total * 1000);
            return this.defaultSlide(slide);
        }
        showModernDigobin(slide, area, step, textIndex) {
            clearTimeout(this.animation);
            this.animation = setTimeout(() => {
                this.obj.showState([
                    {
                        name: "digobin",
                        state: "modern",
                        additionalStates: ["village_left"],
                    },
                ]);
            }, 2000);
        }
        backgroundEntry(slide, area, step, textIndex) {
            document.getElementsByClassName("background")[0].style.display = "none";
            let textBlock = document.getElementsByClassName("textblock")[0];
            textBlock.style.bottom = "10px";
            textBlock.style.width = "800px";
            textBlock.style.left = "41%";
        }
        showSGentry(slide, area, step, textIndex) {
            clearTimeout(this.animation);
            this.animation = setTimeout(() => {
                this.obj.showState([{ name: "professor", state: "default" }]);
            }, 2000);
        }
        getRandom() {
            return Math.floor(Math.random() * (9 - 1)) + 1;
        }
        createBtnChose(elements, mainDiv, onActive) {
            let objHtml;
            elements.forEach((element) => {
                objHtml = document.createElement("div");
                objHtml.addEventListener("click", onActive, false);
                objHtml.classList.add("number");
                objHtml.classList.add("number-whiteRound");
                objHtml.innerHTML = element;
                objHtml.setAttribute("data-value", element);
                mainDiv.appendChild(objHtml);
            });
            return mainDiv;
        }
    }
    exports.DefaultInteractive = DefaultInteractive;
});
define("lib/interactive/InteractiveLesson2", ["require", "exports", "lib/interactive/defaultInteractive"], function (require, exports, defaultInteractive_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InteractiveLesson2 extends defaultInteractive_1.DefaultInteractive {
        constructor(obj) {
            super(obj);
            this.getLesson = () => {
                return "lesson2";
            };
            this.getAnswer = (event) => {
                if (event.target.getAttribute("data-value") == this.correctValue) {
                    this.obj.createButtons({ Молодец: "step37" });
                    this.trueAnswerAnimation("agree_palm_SG", 3.5);
                }
                else {
                    this.falseAnswerAnimation("false_answer_animation");
                    document.getElementById("choiseNumber").classList.add("hideContent");
                    this.obj.createButtons({ "Подумай еще раз": "step36" });
                }
            };
            this.obj = obj;
            this.correctValue = -1;
            this.fail = false;
        }
        showDominoAnswers(slide, area, step, textIndex) {
            let objHtml, obj = this, objShell = document.createElement("div"), textElem = [0, 1, 2, 3, 4, 5, 6], arrRes = [];
            this.correctValue = 5;
            objShell.setAttribute("id", "choiseNumber");
            textElem.forEach(function (element) {
                objHtml = document.createElement("div");
                objHtml.classList.add("number");
                objHtml.classList.add("number-whiteRound");
                objHtml.addEventListener("click", obj.getAnswer, false);
                objHtml.setAttribute("data-value", element);
                objHtml.innerHTML = element;
                objShell.appendChild(objHtml);
            });
            return { data: objShell, context: "interactive" };
        }
    }
    exports.InteractiveLesson2 = InteractiveLesson2;
});
define("lib/interactive/InteractiveLesson1", ["require", "exports", "lib/interactive/defaultInteractive"], function (require, exports, defaultInteractive_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InteractiveLesson1 extends defaultInteractive_2.DefaultInteractive {
        constructor(obj) {
            super(obj);
            this.getLesson = () => {
                return "lesson1";
            };
            this.getAnswer = (event) => {
                let number = parseInt(event.target.getAttribute('data-value'));
                if (number % 2 == 0) {
                    event.target.classList.add("number-succsess");
                    this.trueAnswerAnimation("agree_palm_SG", 3.5);
                    this.colEvenNumbers -= 1;
                    event.target.removeEventListener('click', this.getAnswer, false);
                }
                else {
                    this.falseAnswerAnimation("false_answer_animation");
                    let obj = document.getElementById('block');
                    obj.classList.add('hideContent');
                    this.colEvenNumbers = -1;
                    this.obj.createButtons({ "Еще одна попытка": "step6" });
                }
                if (this.colEvenNumbers == 0) {
                    this.obj.createButtons({ "Молодец": "step7" });
                }
            };
            this.obj = obj;
            this.colEvenNumbers = 0;
            this.fail = false;
        }
        getEvenRandom() {
            let arr = [2, 4, 6, 8];
            return arr[Math.floor(Math.random() * (3 - 0)) + 0];
        }
        choseEven(slide, area, step, textIndex) {
            if (slide.context != 'interactive' && area != 'play') {
                this.colEvenNumbers = 1;
                let objHtml, mainDiv = document.createElement('div'), numbers = [], random_numver;
                numbers.push(this.getEvenRandom());
                for (let i = 0; i < 6; i++) {
                    random_numver = this.getRandom();
                    if (parseInt(random_numver) % 2 == 0) {
                        this.colEvenNumbers += 1;
                    }
                    numbers.push(random_numver);
                }
                mainDiv.setAttribute("id", "block");
                mainDiv = this.createBtnChose(numbers, mainDiv, this.getAnswer);
                return ({ data: mainDiv, context: 'interactive' });
            }
            else {
                return slide;
            }
        }
        showNumber() {
            let obj = document.getElementById('hiddenNumber');
            if (obj != null)
                obj.classList.add('prominentNumber');
        }
        showEvenNumber() {
            let arrEven = document.getElementsByClassName('even');
            for (let i = 0; i < arrEven.length; i++) {
                arrEven[i].classList.add('number-even');
            }
        }
        showNumbColorizeEven(slide, area, step, textIndex) {
            if (area == 'play') {
                let arrRes = [], objHtml, container, obj = this, mainDiv, time = step.parameters.split(';');
                container = document.createElement('div');
                mainDiv = document.createElement('div');
                mainDiv.classList.add('defaultSlide__center');
                container.setAttribute("id", "hiddenNumber");
                container.classList.add('defaultSlide');
                container.classList.add('hideContent');
                setTimeout(this.showNumber, time[0]);
                setTimeout(this.showEvenNumber, time[1]);
                if (typeof slide == 'string') {
                    arrRes = slide.split(' ');
                }
                arrRes = arrRes.map(element => {
                    objHtml = document.createElement('div');
                    objHtml.classList.add('number');
                    objHtml.style = '';
                    objHtml.innerHTML = element;
                    if (parseInt(element) % 2 == 0) {
                        objHtml.classList.add('even');
                    }
                    mainDiv.appendChild(objHtml);
                });
                container.appendChild(mainDiv);
                return ({ data: container, context: 'interactive' });
            }
            else {
                this.showNumbNow(slide, area, step, textIndex);
            }
        }
        showNumbNow(slide, area, step, textIndex) {
            if (step.text.length - 1 == textIndex) {
                setTimeout(this.showEvenNumber, 700);
                this.showNumber();
            }
        }
    }
    exports.InteractiveLesson1 = InteractiveLesson1;
});
define("lib/interactive/InteractiveLesson3", ["require", "exports", "lib/interactive/defaultInteractive"], function (require, exports, defaultInteractive_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InteractiveLesson3 extends defaultInteractive_3.DefaultInteractive {
        constructor(obj) {
            super(obj);
            this.getLesson = () => {
                return "lesson3";
            };
            this.obj = obj;
        }
    }
    exports.InteractiveLesson3 = InteractiveLesson3;
});
define("lib/interactive/InteractiveLesson4", ["require", "exports", "lib/interactive/defaultInteractive"], function (require, exports, defaultInteractive_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InteractiveLesson4 extends defaultInteractive_4.DefaultInteractive {
        constructor(obj) {
            super(obj);
            this.getLesson = () => {
                return "lesson4";
            };
            this.obj = obj;
            this.correctValue = -1;
            this.fail = false;
        }
    }
    exports.InteractiveLesson4 = InteractiveLesson4;
});
define("lib/interactive/InteractiveLesson5", ["require", "exports", "lib/interactive/defaultInteractive"], function (require, exports, defaultInteractive_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InteractiveLesson5 extends defaultInteractive_5.DefaultInteractive {
        constructor(obj) {
            super(obj);
            this.getLesson = () => {
                return "lesson5";
            };
            this.getAnswer = (event) => {
                let number = parseInt(event.target.getAttribute("data-value"));
                if (this.isPrime(number)) {
                    event.target.classList.add("number-succsess");
                    this.trueAnswerAnimation("agree_palm_SG", 3.5);
                    this.colPrimeNumbers -= 1;
                    event.target.removeEventListener("click", this.getAnswer, false);
                }
                else {
                    this.falseAnswerAnimation("false_answer_animation");
                    let obj = document.getElementById("block");
                    obj.classList.add("hideContent");
                    this.colPrimeNumbers = -1;
                    this.obj.createButtons({ "Еще одна попытка": "step7" });
                }
                if (this.colPrimeNumbers == 0) {
                    this.obj.createButtons({ Молодец: "step8" });
                }
            };
            this.obj = obj;
            this.correctValue = -1;
            this.fail = false;
            this.colPrimeNumbers = 0;
            this.primeNumbers = [1, 2, 3, 5, 7];
        }
        getPrimeRandom() {
            return this.primeNumbers[Math.floor(Math.random() * (4 - 0)) + 0];
        }
        isPrime(number) {
            if (this.primeNumbers.indexOf(number) != -1) {
                return true;
            }
            return false;
        }
        chosePrimeNumber(slide, area, step, textIndex) {
            if (slide.context != "interactive" && area != "play") {
                let objHtml, mainDiv = document.createElement("div"), numbers = [], random_numver;
                this.colPrimeNumbers = 1;
                numbers.push(this.getPrimeRandom());
                for (let i = 0; i < 6; i++) {
                    random_numver = this.getRandom();
                    if (this.isPrime(random_numver)) {
                        this.colPrimeNumbers += 1;
                    }
                    numbers.push(random_numver);
                }
                mainDiv.setAttribute("id", "block");
                mainDiv = this.createBtnChose(numbers, mainDiv, this.getAnswer);
                return { data: mainDiv, context: "interactive" };
            }
            else {
                return slide;
            }
        }
    }
    exports.InteractiveLesson5 = InteractiveLesson5;
});
define("lib/interactive/configInteractive", ["require", "exports", "lib/interactive/InteractiveLesson2", "lib/interactive/InteractiveLesson1", "lib/interactive/InteractiveLesson3", "lib/interactive/InteractiveLesson4", "lib/interactive/InteractiveLesson5"], function (require, exports, InteractiveLesson2_1, InteractiveLesson1_1, InteractiveLesson3_1, InteractiveLesson4_1, InteractiveLesson5_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let arrInteractiveLesson = [InteractiveLesson1_1.InteractiveLesson1, InteractiveLesson2_1.InteractiveLesson2, InteractiveLesson3_1.InteractiveLesson3, InteractiveLesson4_1.InteractiveLesson4, InteractiveLesson5_1.InteractiveLesson5];
    exports.arrInteractiveLesson = arrInteractiveLesson;
});
define("lib/dom", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function toggle(node, f) {
        node.style.display = f ? 'none' : 'block';
    }
    exports.toggle = toggle;
    function el(id) {
        return document.getElementById(id);
    }
    exports.el = el;
    function hide(node) {
        node.style.display = 'none';
    }
    exports.hide = hide;
    function show(node) {
        node.style.display = 'block';
    }
    exports.show = show;
    function clear(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    exports.clear = clear;
});
define("lib/story", ["require", "exports", "lib/animation/teletype", "lib/animation/person_animation", "lib/event", "lib/interactive/configInteractive", "lib/dom"], function (require, exports, teletype_1, person_animation_1, event_1, configInteractive_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StoryPlayer {
        constructor(scene) {
            this.changeStep = () => {
                var step = this.steps[this.state];
                if (this.textIndex < step.text.length) {
                    this.showText();
                    this.textIndex++;
                }
                else if (step.hasOwnProperty("next")) {
                    this.play(step.next);
                    this.startYawn = false;
                }
            };
            this.steps = null;
            this.groups = null;
            this.nameSpeaker = "";
            this.state = null;
            this.buttons = [];
            this.animation = [];
            this.textIndex = 0;
            this.roles = { professor: {}, digobin: {} };
            this.lastFragment = null;
            this.slide = document.createElement("div");
            this.slide.className = "slide";
            this.buttons = document.createElement("div");
            this.buttons.className = "buttons";
            this.name = document.createElement("div");
            this.name.className = "textblock_name";
            this.text = document.createElement("div");
            this.textblock = document.createElement("div");
            this.ckipStepInterval;
            this.textblock.className = "textblock";
            this.iconEndSpeach = document.createElement("div");
            this.iconEndSpeach.className = "end_speach_icon";
            this.startYawn = false;
            this.textblock.addEventListener("click", this.changeStep);
            this.iconEndSpeach.addEventListener("click", this.changeStep);
            this.type = new teletype_1.Teletype(this.text);
            this.textblock.appendChild(this.name);
            this.textblock.appendChild(this.text);
            scene.appendChild(this.textblock);
            scene.appendChild(this.buttons);
            scene.appendChild(this.slide);
            scene.appendChild(this.iconEndSpeach);
            this.onplay = new event_1.EventListener();
            this.personAnimation = new person_animation_1.PersonAnimation();
            this.objInteractive = undefined;
            this.yawnTimer;
            this.nextStepTimer;
            this.currentStep = "begin";
        }
        set(steps) {
            this.steps = steps;
        }
        createButtons(list) {
            for (let i in list) {
                if (list.hasOwnProperty(i)) {
                    var btn = document.createElement("button");
                    btn.textContent = i;
                    btn.addEventListener("click", () => {
                        if (list[i].hasOwnProperty("animationSG")) {
                            this.showState([{ name: "professor", state: list[i].animationSG }]);
                            setTimeout(() => {
                                this.play(list[i].nextStep);
                            }, parseInt(list[i].timeAnimation) * 1000);
                        }
                        else {
                            this.play(list[i]);
                        }
                    });
                    this.buttons.appendChild(btn);
                }
            }
        }
        showSlide(content) {
            if (typeof content == "string") {
                this.slide.style.fontSize = "40px";
                this.slide.textContent = content;
            }
            else if (content.hasOwnProperty("type") && content.type == "html") {
                this.slide.innerHTML = content.text;
            }
            else if (content.context == "interactive") {
                this.slide.innerHTML = "";
                let obj = this;
                obj.slide.append(content.data);
            }
            else {
                this.slide.style.fontSize = content.fontSize + "px";
                this.slide.textContent = content.text;
            }
        }
        showState(states) {
            this.animation.forEach((a) => a.stop());
            this.animation = [];
            states.forEach((state) => {
                var group = this.groups[state.name];
                var element = state.state;
                for (var i in group.children) {
                    if (group.children.hasOwnProperty(i)) {
                        var res = group.children[i];
                        if (i == element) {
                            res.node.style.display = "block";
                            this.animation = this.animation.concat(res.animation);
                            if (res.optimizeLoad == "sprite_manager") {
                                this.personAnimation.setSprite(group.children[element].children, res);
                            }
                            else if (res.setBlink) {
                                this.personAnimation.playStateWithBlink(element, group.children[element].children, res.node);
                            }
                        }
                        else {
                            if ("additionalStates" in state) {
                                if (state.additionalStates.indexOf(i) >= 0) {
                                    res.node.style.display = "block";
                                    this.animation = this.animation.concat(group.children[i].animation);
                                }
                                else {
                                    res.node.style.display = "none";
                                }
                            }
                            else {
                                res.node.style.display = "none";
                            }
                        }
                    }
                }
            });
            this.animation.forEach((a) => a.play());
        }
        testOnInteractive(step, slide, area) {
            if (this.objInteractive[step.interactive] === undefined) {
                slide = this.objInteractive.defaultSlide(slide);
            }
            else {
                if (!(slide === undefined)) {
                    slide = this.objInteractive[step.interactive](slide, area, step, this.textIndex, this.groups);
                }
            }
            return slide;
        }
        getAnimationSG(animate = "") {
            let animation;
            if (animate != "") {
                if (animation == "yawn") {
                    this.startYawn = true;
                }
                this.showState([{ name: "professor", state: animate }]);
            }
        }
        showText() {
            var step = this.steps[this.state];
            if (typeof this.yawnTimer != "undefined") {
                clearTimeout(this.yawnTimer);
            }
            var text = step.text[this.textIndex];
            this.nameSpeaker = step.active;
            let slide;
            this.name.innerHTML = this.nameSpeaker == "professor" ? "Профессор" : "Цифровенок";
            if (this.lastFragment) {
                this.lastFragment.audio.stop();
            }
            if (step.hasOwnProperty("sound_labels")) {
                this.lastFragment = this.roles[this.nameSpeaker];
                var fragName = step.sound_labels[this.textIndex];
                var fragmentId = this.lastFragment.audio.fragments.findIndex((item) => item.name == fragName);
                this.lastFragment.audio.play(fragmentId);
                var timing = this.lastFragment.timing[fragmentId];
                if (this.nameSpeaker == "professor") {
                    var list = this.groups[this.nameSpeaker].children.default.children;
                    this.personAnimation.play(timing, list, "default");
                    this.personAnimation.stopSpeak();
                }
                if (this.nameSpeaker == "digobin") {
                    var list = this.groups[this.nameSpeaker].children.speak.children;
                    this.personAnimation.play(timing, list, "speak");
                    this.personAnimation.stopSpeak();
                }
            }
            if (typeof this.objInteractive != "undefined" && typeof step.interactive != "undefined") {
                slide = this.testOnInteractive(step, "", "showText");
                if (typeof slide != "undefined" && slide.context == "interactive") {
                    this.showSlide(slide);
                }
            }
            this.type.setText(text);
            this.animation.forEach((a) => a.playText(text));
            if (step.name != "intro" && typeof step.show != "undefined") {
                if (step.show[0].name == "professor") {
                    this.yawnTimer = setTimeout(() => {
                        if (!this.startYawn) {
                            this.getAnimationSG("yawn");
                        }
                    }, 120000);
                }
            }
        }
        play(state) {
            if (typeof this.yawnTimer != "undefined") {
                clearTimeout(this.yawnTimer);
            }
            if (typeof this.nextStepTimer != "undefined") {
                clearTimeout(this.nextStepTimer);
            }
            if (typeof this.ckipStepInterval != "undefined") {
                clearInterval(this.ckipStepInterval);
                this.iconEndSpeach.style.opacity = 0;
            }
            this.textIndex = 0;
            var step, obj = this, classAnimation;
            if (!this.steps.hasOwnProperty(state)) {
                return;
            }
            this.onplay.fire(state);
            if (this.state) {
                step = this.steps[this.state];
                this.textblock.classList.remove("textblock--" + step.active);
            }
            this.state = state;
            step = this.steps[this.state];
            this.textblock.classList.add("textblock--" + step.active);
            dom_1.clear(this.buttons);
            if (typeof this.objInteractive == "undefined" && typeof step.lesson != "undefined") {
                configInteractive_1.arrInteractiveLesson.forEach(function (Elem) {
                    classAnimation = new Elem(obj);
                    if (classAnimation.getLesson() == step.lesson) {
                        obj.objInteractive = classAnimation;
                    }
                });
            }
            let boolTestOnInteractive = typeof this.objInteractive != "undefined" && typeof step.interactive != "undefined";
            if (step.hasOwnProperty("slide")) {
                if (boolTestOnInteractive) {
                    step.slide = this.testOnInteractive(step, step.slide, "play");
                }
                else {
                    if (!!step.slide) {
                        step.slide = this.testOnInteractive(step, step.slide, "textDefault");
                    }
                }
                this.showSlide(step.slide);
            }
            else {
                if (boolTestOnInteractive) {
                    this.testOnInteractive(step, "", "play");
                }
            }
            if (step.hasOwnProperty("show")) {
                this.showState(step.show);
            }
            if (step.hasOwnProperty("actions")) {
                this.createButtons(step.actions);
            }
            if (step.hasOwnProperty("instantTransitionStep")) {
                this.nextStepTimer = setTimeout(() => {
                    if (step.hasOwnProperty("next")) {
                        this.showIconEndingSpeach();
                    }
                    else {
                        this.play(step.instantTransitionStep);
                    }
                }, parseFloat(step.timeTransition) * 1000);
            }
            this.showText();
            this.textIndex++;
        }
        showIconEndingSpeach() {
            let big_size = false;
            this.iconEndSpeach.style.opacity = 1;
            this.ckipStepInterval = setInterval(() => {
                if (big_size) {
                    this.iconEndSpeach.style.transform = "scale(1.2)";
                }
                else {
                    this.iconEndSpeach.style.transform = "scale(1)";
                }
                big_size = !big_size;
            }, 450);
        }
    }
    exports.StoryPlayer = StoryPlayer;
});
define("lib/menu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MenuBuilder {
        constructor(root, loader) {
            this.goToLesson = (event) => {
                window.location.href = "src/lesson.html?l=" + event.target.getAttribute("data-lesson");
            };
            this.root = root;
            this.loader = loader;
            this.elements = { children: {}, name: null };
            this.menuCreated = false;
        }
        createMenuElements(list) {
            list.forEach((elem) => {
                let htmlObj = document.createElement("div"), img, header = document.createElement("h3");
                htmlObj.setAttribute("data-lesson", elem.lesson);
                htmlObj.addEventListener("click", this.goToLesson);
                this.loader.load(elem.path).then((result) => {
                    img = document.createElement("img");
                    img.className = "elemMenu__img";
                    img.src = elem.path;
                    img.setAttribute("data-lesson", elem.lesson);
                    header.setAttribute("data-lesson", elem.lesson);
                    header.innerHTML = elem.name;
                    header.className = "elemMenu__header";
                    htmlObj.className = "lessonContainer__elemMenu";
                    htmlObj.appendChild(img);
                    htmlObj.appendChild(header);
                });
                this.root.appendChild(htmlObj);
            });
        }
    }
    exports.MenuBuilder = MenuBuilder;
});
define("index", ["require", "exports", "lib/story", "lib/loader", "lib/scene", "lib/menu", "lib/url", "lib/resize"], function (require, exports, story_1, loader_2, scene_1, menu_1, url_1, resize_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var params = url_1.getUrlParams(window.location.search);
    function convertToHash(data) {
        var result = [];
        data.steps.forEach((item) => {
            result[item.name] = item;
        });
        return result;
    }
    exports.convertToHash = convertToHash;
    var lesson = params["l"] || "menu";
    var config = {
        story: `assets/projects/${lesson}/index.json`,
        scene: `assets/projects/${lesson}/scene.json`,
    };
    var loading = document.getElementById("loading");
    var scene = document.getElementById("scene");
    scene.style.visibility = "hidden";
    window.onresize = () => {
        resize_1.resize(scene);
    };
    resize_1.resize(scene);
    var rs = new loader_2.ResourceManager();
    var sb = new scene_1.SceneBuilder(scene, rs);
    var story = new story_1.StoryPlayer(scene);
    startHome(config, lesson);
    function startHome(config, lesson) {
        console.log("config", config);
        rs.load(config.story)
            .then((result) => {
            sb.createScene(result.data.img, "", story);
            loading.style.display = "none";
            scene.style.visibility = "visible";
            return result;
        })
            .then((result) => {
            let hash = convertToHash(result.data);
            document.getElementsByClassName("menu")[0].style.display = "none";
            let lessonContainer = document.getElementsByClassName("lessonContainer")[0], textblock = document.getElementsByClassName("textblock")[0];
            textblock.style.display = "none";
            let mb = new menu_1.MenuBuilder(lessonContainer, rs);
            mb.createMenuElements(hash.intro.list);
        });
    }
    exports.startHome = startHome;
});
