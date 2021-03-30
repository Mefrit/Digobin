
export class EventListener {
    list: Function[] = [];

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
