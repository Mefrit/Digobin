import { DefaultInteractive } from "./defaultInteractive";
export class InteractiveLesson5 extends DefaultInteractive {
    obj: any;
    correctValue: number;
    fail: boolean;
    colPrimeNumbers: number;
    primeNumbers: number[];
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this.correctValue = -1;
        this.fail = false;
        this.colPrimeNumbers = 0;
        this.primeNumbers = [1, 2, 3, 5, 7];
    }
    getLesson = () => {
        return "lesson5";
    };
    getPrimeRandom() {
        return this.primeNumbers[Math.floor(Math.random() * (4 - 0)) + 0];
    }
    isPrime(number) {
        if (this.primeNumbers.indexOf(number) != -1) {
            return true;
        }
        return false;
    }
    getAnswer = (event) => {
        let number = parseInt(event.target.getAttribute("data-value"));
        if (this.isPrime(number)) {
            event.target.classList.add("number-succsess");
            this.trueAnswerAnimation("agree_palm_SG", 3.5);
            this.colPrimeNumbers -= 1;
            event.target.removeEventListener("click", this.getAnswer, false);
        } else {
            this.falseAnswerAnimation("false_answer_animation");
            let obj = document.getElementById("block");
            obj.classList.add("hideContent");
            this.colPrimeNumbers = -1;
            this.obj.createButtons({ "Еще одна попытка": "step7" });
        }
        if (this.colPrimeNumbers == 0) {
            this.obj.createButtons({ Молодец: "step8" });
        }
    };

    chosePrimeNumber(slide, area, step, textIndex) {
        if (slide.context != "interactive" && area != "play") {
            let objHtml,
                mainDiv = document.createElement("div"),
                numbers = [],
                random_numver;
            this.colPrimeNumbers = 1;
            numbers.push(this.getPrimeRandom());
            for (let i = 0; i < 6; i++) {
                random_numver = this.getRandom();
                if (this.isPrime(random_numver)) {
                    this.colPrimeNumbers += 1;
                }
                numbers.push(random_numver);
            }

            mainDiv.setAttribute("id", "block");
            mainDiv = this.createBtnChose(numbers, mainDiv, this.getAnswer);
            // .forEach(element => {
            //     objHtml = document.createElement('div')
            //     objHtml.addEventListener('click', this.getAnswer, false);

            //     objHtml.classList.add("number");
            //     objHtml.classList.add('number-whiteRound');
            //     objHtml.innerHTML = element;
            //     objHtml.setAttribute('data-value', element);

            //     if (parseInt(element) % 2 == 0) {
            //         this.colEvenNumbers += 1;
            //     }

            //     mainDiv.appendChild(objHtml);
            //     return (objHtml);

            // });
            return { data: mainDiv, context: "interactive" };
        } else {
            return slide;
        }
    }
}
