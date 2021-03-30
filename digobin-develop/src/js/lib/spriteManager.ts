import { ImageManager } from "./imageManager";
export class SpriteManager extends ImageManager {
    resourceCache: any;
    image_sprite_cache: any;
    canvas: any;
    config_cache: any;
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
                } else {
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
