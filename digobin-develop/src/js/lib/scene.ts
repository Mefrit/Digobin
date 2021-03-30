import { SpeakAnimation } from "./animation/speak";
import { DragonAnimationUpdate } from "./animation/dragon_update";
import { ImageManager } from "./imageManager";
import { SpriteManager } from "./spriteManager";
import { dirname, projectName } from "./path";

export class SceneBuilder {
    constructor(root, loader) {
        this.root = root;
        this.loader = loader;
        this.elements = { children: {}, name: null };
        this.menuCreated = false;
        this.imageManager = new ImageManager();
        this.spriteManager = new SpriteManager();
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
        return Promise.all(
            data.map((obj, order) => {
                var element = this.createElement(obj),
                    el,
                    res;
                if (!!obj.path2sprite) {
                    element.path2sprite = obj.path2sprite;
                }
                if (obj.hasOwnProperty("type")) {
                    if (obj.type == "dragon") {
                        el = document.createElement("canvas");
                        el.setAttribute("id", "canvas_" + obj.name);
                    } else {
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
                } else {
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
                                var dragon = new DragonAnimationUpdate(result.data, element.children, obj.name);
                                dragon.show();
                                element.animation.push(dragon);
                            });
                        } else if (obj.hasOwnProperty("file")) {

                            var relpath = dirname(obj.file) + "/";

                            res = this.createTree(result.data, el, relpath, element, story).then(() => {
                                if (obj.hasOwnProperty("animation")) {
                                    if (obj.animation.includes("speak")) {
                                        element.animation.push(new SpeakAnimation(element.children));
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
                                // добавление в кэш изображения
                                this.imageManager.pushImage(image.data.cloneNode(), element.name);
                                this.setNodeProps(element.node, obj, parent);
                                parent.children[obj.name] = element;
                                parentNode.replaceChild(element.node, tmp);
                            });
                        } else {
                            // добавление в кэш изображения
                            this.imageManager.onReady(element.name).then((result) => {
                                element.node = result;
                                this.setNodeProps(element.node, obj, parent);
                                parent.children[obj.name] = element;
                                parentNode.replaceChild(element.node, tmp);
                            });
                        }
                    } else if (parent.optimizeLoad == "sprite_manager") {
                        if (!this.spriteManager.checkIndexImage(parent.name + "_sprite")) {
                            this.spriteManager.pushIndexImage(parent.name + "_sprite");
                            let res_json = this.loader.load(parent.path2sprite + parent.name + "_sprite_config.json");

                            res = this.loader.load(parent.path2sprite + parent.name + "_sprite.png");

                            res.then((result) => {
                                res_json.then((json) => {
                                    this.spriteManager.startSplit(
                                        result.data.cloneNode(),
                                        parent.name + "_sprite",
                                        json.data
                                    );
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
                    } else {
                        res = this.loader.load(element.path).then((image) => {
                            element.node = image.data.cloneNode();
                            this.setNodeProps(element.node, obj, parent);
                            parent.children[obj.name] = element;
                            parentNode.replaceChild(element.node, tmp);
                        });
                    }
                } else {
                    // если нет свойства path - это какой то контейнер
                    this.setNodeProps(el, obj, parent);
                    element.node = el;
                    parent.children[obj.name] = element;
                    parentNode.appendChild(element.node);
                }
                return res && res;
            })
        );
    }

    createMenu(story) {
        let menu = document.createElement("div"),
            inputs = [
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
    toStart = (story) => {
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
    toHome = (story) => {
        window.location.href = "/digobin/";
    };

    createDragonUpdate(data, parentNode, path, parent, person) {
        var images = data.armature[0].skin[0].slot,
            obj = this;
        var projectPath = projectName(path) + "_texture/",
            res,
            res_json,
            imageFromManager;
        return Promise.all(
            images.map((image) => {
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
                    } else {
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
                                this.spriteManager.startSplit(
                                    result.data.cloneNode(),
                                    parent.name + "_sprite",
                                    json.data
                                );
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
            })
        );
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
