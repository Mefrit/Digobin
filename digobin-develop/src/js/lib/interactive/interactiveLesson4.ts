import { DefaultInteractive } from './defaultInteractive'
export class InteractiveLesson4 extends DefaultInteractive {
    obj: any;
    correctValue: number;
    fail: boolean;
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this.correctValue = -1;
        this.fail = false;
    }
    getLesson = () => {
        return "lesson4";
    }
}