export class ImageManager {
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
        } else {
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
                } else {
                    setTimeout(checkLoad, 70);
                }
            };
            checkLoad();
        });
    }

    isReady() {
        var ready = true;

        for (var k = 0; k < this.indexCache.length; k++) {
            if (
                !this.resourceCache.hasOwnProperty(this.indexCache[k]) ||
                Object.keys(this.resourceCache).length != this.indexCache.length
            ) {
                ready = false;
            }
        }
        return ready;
    }
}
