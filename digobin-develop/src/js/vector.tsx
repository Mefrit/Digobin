
// Точка. Привязка к координатам
class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getPos() {
        return this;
    }
}

// Привязка обьекта к сегменту
class Link {
    segment;
    offset;

    constructor(s, o) {
        this.segment = s;
        this.offset = o;
    }

    getPos() {
        var A = this.segment.getBegin();
        var B = this.segment.getEnd();

        return new Point(A.x + (B.x - A.x) * this.offset, A.y + (B.y - A.y) * this.offset);
    }
}

// Отрезок
class Segment {
    _begin: Point | Link = null;
    _end: Point | Link = null;    

    constructor(b, e) {
        this._begin = b;
        this._end = e;
    }

    getBegin() {
        return this._begin.getPos();
    }

    getEnd() {
        return this._end.getPos();
    }
}


let A = new Segment(new Point(0, 0), new Point(0, 100));
let B = new Segment(new Point(100, 0), new Point(100, 100));
let C = new Segment(new Link(A, 0.5), new Link(B, 0.5));

console.log(C.getBegin(), C.getEnd());
