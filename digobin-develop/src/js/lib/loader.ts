﻿import { extension, filename } from "./path";
import { ImageManager } from "./imageManager";
export class ResourceManager {
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
        var type = maps[extension(path)];
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
            } else if (item.type == "json") {
                return this.loadJSON(item.path);
            } else if (item.type == "image") {
                return this.loadImage(item.path);
            } else if (item.type == "audio") {
                return this.loadAudio(item.path);
            }
        }

        item = this.todo[path];
        return new Promise((resolve) => {
            let checkLoad = () => {
                if (item.loaded) {
                    resolve(item);
                } else {
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
