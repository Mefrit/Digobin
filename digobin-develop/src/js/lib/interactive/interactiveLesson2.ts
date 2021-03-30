import { DefaultInteractive } from "./defaultInteractive";
export class InteractiveLesson2 extends DefaultInteractive {
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
        return "lesson2";
    };
    //вынести в дэфолтный класс и переименовать

    showDominoAnswers(slide, area, step, textIndex) {
        let objHtml,
            obj = this,
            objShell = document.createElement("div"),
            textElem = [0, 1, 2, 3, 4, 5, 6],
            arrRes = [];
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
    getAnswer = (event) => {
        if (event.target.getAttribute("data-value") == this.correctValue) {
            this.obj.createButtons({ Молодец: "step37" });
            this.trueAnswerAnimation("agree_palm_SG", 3.5);
        } else {
            this.falseAnswerAnimation("false_answer_animation");
            document.getElementById("choiseNumber").classList.add("hideContent");
            this.obj.createButtons({ "Подумай еще раз": "step36" });
        }
    };
}
