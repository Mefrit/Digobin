import { DefaultInteractive } from './defaultInteractive'
export class InteractiveLesson1 extends DefaultInteractive {
    obj: any;
    colEvenNumbers: number;
    fail: boolean;
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this.colEvenNumbers = 0;
        this.fail = false;
    }


    getEvenRandom() {
        let arr = [2, 4, 6, 8];
        return arr[Math.floor(Math.random() * (3 - 0)) + 0];
    }
    choseEven(slide, area, step, textIndex) {


        if (slide.context != 'interactive' && area != 'play') {
            this.colEvenNumbers = 1;
            let objHtml, mainDiv = document.createElement('div'), numbers = [], random_numver;

            numbers.push(this.getEvenRandom());
            for (let i = 0; i < 6; i++) {
                random_numver = this.getRandom()
                if (parseInt(random_numver) % 2 == 0) {
                    this.colEvenNumbers += 1;
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
            return ({ data: mainDiv, context: 'interactive' });
        } else {
            return slide;
        }

    }
    getLesson = () => {
        return "lesson1";
    }
    getAnswer = (event) => {
        let number = parseInt(event.target.getAttribute('data-value'));
        if (number % 2 == 0) {
            event.target.classList.add("number-succsess");
            this.trueAnswerAnimation("agree_palm_SG", 3.5);

            this.colEvenNumbers -= 1;

            event.target.removeEventListener('click', this.getAnswer, false);
        } else {

            this.falseAnswerAnimation("false_answer_animation");
            let obj = document.getElementById('block');
            obj.classList.add('hideContent');
            this.colEvenNumbers = -1;
            this.obj.createButtons({ "Еще одна попытка": "step6" });
        }
        if (this.colEvenNumbers == 0) {

            this.obj.createButtons({ "Молодец": "step7" });
        }
    }

    //showNumbColorizeEven - через промежуток времени показать числа и раскрасить их в красный
    showNumber() {
        let obj = document.getElementById('hiddenNumber');

        if (obj != null)
            obj.classList.add('prominentNumber');

    }
    showEvenNumber() {
        let arrEven = document.getElementsByClassName('even');
        for (let i = 0; i < arrEven.length; i++) {
            arrEven[i].classList.add('number-even');
        }
    }
    showNumbColorizeEven(slide, area, step, textIndex) {

        if (area == 'play') {
            let arrRes = [], objHtml, container, obj = this, mainDiv, time = step.parameters.split(';');
            container = document.createElement('div');
            mainDiv = document.createElement('div');
            mainDiv.classList.add('defaultSlide__center');
            container.setAttribute("id", "hiddenNumber");
            container.classList.add('defaultSlide');
            container.classList.add('hideContent');


            setTimeout(this.showNumber, time[0]);
            setTimeout(this.showEvenNumber, time[1]);

            if (typeof slide == 'string') {
                arrRes = slide.split(' ')
            }
            arrRes = arrRes.map(element => {

                objHtml = document.createElement('div')
                objHtml.classList.add('number');
                objHtml.style = '';
                objHtml.innerHTML = element;

                if (parseInt(element) % 2 == 0) {
                    objHtml.classList.add('even');
                }
                mainDiv.appendChild(objHtml);
            });
            container.appendChild(mainDiv);

            return ({ data: container, context: 'interactive' });

        } else {

            this.showNumbNow(slide, area, step, textIndex)
        }
    }
    showNumbNow(slide, area, step, textIndex) {

        if (step.text.length - 1 == textIndex) {
            setTimeout(this.showEvenNumber, 700);
            this.showNumber();
        }

    }
}

