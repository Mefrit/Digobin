export class DefaultInteractive {
    obj: any;
    colEvenNumbers: number;
    fail: boolean;
    answerFalseAnimation: string[];
    answerAgreeAnimation: string[];
    animation: any;
    constructor(obj) {
        this.obj = obj;

        this.answerFalseAnimation = ["false_answer_animation", "false_answer_animation_cris_cros"];
        this.answerAgreeAnimation = ["agree_face_SG", "agree_palm_SG"];
    }
    getAnimation(animation) {
        for (var i in this.obj.groups.professor.children) {
            if (this.obj.groups.professor.children.hasOwnProperty(i)) {
                this.obj.groups.professor.children[i].node.style.display = i == animation ? "block" : "none";
                this.obj.showState([{ name: "professor", state: animation }]);
            }
        }
    }
    createImg = (slide, area, step, textIndex) => {
        if (area == "play" && slide.context != "interactive") {
            let img = document.createElement("img"),
                objShell = document.createElement("div");
            img.setAttribute("src", "../assets/library/interactive/" + slide);
            img.classList.add("image");
            objShell.setAttribute("id", "block");
            objShell.appendChild(img);

            return { data: objShell, context: "interactive" };
        } else {
            return slide;
        }
    };
    showTextBlock(slide, area, step, textIndex) {
        let hideBlock = document.getElementsByClassName("textblock")[0];
        hideBlock.style.display = "block";
        hideBlock = document.getElementsByClassName("end_speach_icon")[0];
        hideBlock.style.display = "block";
        return slide;
    }
    createImgIntro = (slide, area, step, textIndex) => {
        let obj = this.createImg(slide, area, step, textIndex);

        let hideBlock = document.getElementsByClassName("textblock")[0];
        hideBlock.style.display = "none";
        hideBlock = document.getElementsByClassName("end_speach_icon")[0];
        hideBlock.style.display = "none";
        this.backgroundDefault(slide, area, step, textIndex);
        if (typeof obj.data != "undefined") {
            if (typeof obj.data.firstElementChild != "undefined") {
                obj.data.style.marginLeft = "0px";
                obj.data.firstElementChild.classList.add("image-entry");
                return obj;
            }
        }
    };
    defaultSlide(content) {
        if (content.context != "interactive" && content.fontSize === undefined && content != "") {
            var objHtml = document.createElement("div");
            if (content.type != "html") {
                if (content.length > 80) {
                    objHtml.classList.add("defaultSlide__mini-font");
                }
                objHtml.innerHTML = content;
            } else {
                objHtml.innerHTML = content.text;
            }
            objHtml.classList.add("defaultSlide");
            return { data: objHtml, context: "interactive" };
        } else {
            return content;
        }
    }
    backgroundDefault(slide = {}, area = {}, step = {}, textIndex = {}) {
        document.getElementsByClassName("background")[0].style.display = "block";
        let textBlock = document.getElementsByClassName("textblock")[0];
        textBlock.style.bottom = "60px";
        textBlock.style.width = "600px";
        textBlock.style.left = "50%";
    }
    falseAnswerAnimation = (animation = "") => {
        clearTimeout(this.animation);
        if (animation == "") {
            animation = this.answerFalseAnimation[Math.floor(Math.random() * this.answerFalseAnimation.length)];
        }
        this.getAnimation(animation);
    };
    trueAnswerAnimation = (animation = "", timeOut = 0) => {
        if (animation == "") {
            animation = this.answerAgreeAnimation[Math.floor(Math.random() * this.answerAgreeAnimation.length)];
        }
        this.getAnimation(animation);
        if (timeOut != 0) {
            clearTimeout(this.animation);
            this.animation = setTimeout(() => {
                this.obj.showState([{ name: "professor", state: "default" }]);
            }, timeOut * 1000);
        }
    };
    clearSlide = (slide = {}, area = {}, step = {}, textIndex = {}) => {
        return { data: document.createElement("div"), contex: "interactive" };
    };
    intro = (slide, area, step, textIndex) => {
        this.backgroundDefault();
        // this.obj.showState([]);
    };
    //скрывает контент на доске до определенного времени
    showAfterTime = (slide, area, step, textIndex) => {
        setTimeout(() => {
            let arrElem = document.getElementsByClassName("hideContent");
            for (let i = 0; i < arrElem.length; i++) {
                arrElem[i].classList.add("prominentNumber");
            }
        }, step.timeout * 1000);
        return this.defaultSlide(slide);
    };
    showElem(timeOut, arrElem, i) {
        setTimeout(() => {
            arrElem[i].classList.add("prominentNumber");

            if (i < arrElem.length - 1) {
                i++;

                this.showElem(timeOut, arrElem, i);
            }
        }, timeOut.interval * 3000);
    }

    showAfterTimeConsistently(slide, area, step, textIndex) {
        setTimeout(() => {
            let arrElem = document.getElementsByClassName("hideContent"),
                i = 0;
            this.showElem(step.timeout, arrElem, i);
        }, step.timeout.total * 1000);

        return this.defaultSlide(slide);
    }

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
        document.getElementsByClassName("background")[0].style.display = "none";
        // document.getElementsByClassName('textblock')[0].classList.add('textblock_entry');
        let textBlock = document.getElementsByClassName("textblock")[0];
        textBlock.style.bottom = "10px";
        textBlock.style.width = "800px";
        textBlock.style.left = "41%";
        // document.getElementsByClassName('textblock')[0].style.minHeight = '110px';
        // if (document.getElementsByClassName('background').length > 0) {
        //     let back = document.getElementsByClassName('background')[0];
        //     back.classList.remove('background');
        //     back.classList.add('background_entry');
        // }
    }
    showSGentry(slide, area, step, textIndex) {
        clearTimeout(this.animation);
        this.animation = setTimeout(() => {
            this.obj.showState([{ name: "professor", state: "default" }]);
        }, 2000);
    }
    getRandom() {
        return Math.floor(Math.random() * (9 - 1)) + 1;
    }
    createBtnChose(elements, mainDiv, onActive) {
        let objHtml;
        elements.forEach((element) => {
            objHtml = document.createElement("div");
            objHtml.addEventListener("click", onActive, false);
            objHtml.classList.add("number");
            objHtml.classList.add("number-whiteRound");
            objHtml.innerHTML = element;
            objHtml.setAttribute("data-value", element);

            mainDiv.appendChild(objHtml);
            // return (objHtml);
        });
        return mainDiv;
    }
}
