import { DefaultInteractive } from './defaultInteractive'
export class InteractiveLesson3 extends DefaultInteractive {
    obj: any;

    constructor(obj) {
        super(obj);
        this.obj = obj;
    }
    getLesson = () => {
        return "lesson3";
    }
}