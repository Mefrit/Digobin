import { DefaultInteractive } from "./defaultInteractive";
export class InteractiveEntry extends DefaultInteractive {
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
        return "entry";
    };
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
        if (document.getElementsByClassName("background").length > 0) {
            let back = document.getElementsByClassName("background")[0];
            back.classList.remove("background");
            back.classList.add("background_entry");
        }
    }

    showSGentry(slide, area, step, textIndex) {
        clearTimeout(this.animation);
        this.animation = setTimeout(() => {
            // this.obj.showState([{ name: "professor", state: 'default' }]);
        }, 2000);
    }
}
