import { Teletype } from "./animation/teletype";

import { PersonAnimation } from "./animation/person_animation";
import { EventListener } from "./event";
import { arrInteractiveLesson } from "./interactive/configInteractive";

import { clear } from "./dom";

export class StoryPlayer {
    steps: any;
    groups: any;
    state: any;
    buttons: any;
    animation: any;
    textIndex: any;
    roles: any;
    lastFragment: any;
    slide: any;
    name: any;
    textblock: any;
    text: any;
    type: any;
    onplay: any;
    personAnimation: any;
    obj_l1: any;
    obj_l2: any;
    objInteractive: any;
    animationSG: string[];
    startYawn: boolean;
    yawnTimer: any;
    nextStepTimer: any;
    currentStep: string;
    nameSpeaker: string;
    iconEndSpeach: any;
    ckipStepInterval: any;
    constructor(scene) {
        this.steps = null;
        this.groups = null;
        this.nameSpeaker = "";
        this.state = null;
        this.buttons = [];
        // Управление анимациями
        this.animation = [];
        this.textIndex = 0;

        this.roles = { professor: {}, digobin: {} };

        this.lastFragment = null;

        this.slide = document.createElement("div");
        this.slide.className = "slide";

        this.buttons = document.createElement("div");
        this.buttons.className = "buttons";

        this.name = document.createElement("div");
        this.name.className = "textblock_name";
        this.text = document.createElement("div");

        this.textblock = document.createElement("div");

        this.ckipStepInterval;

        this.textblock.className = "textblock";
        this.iconEndSpeach = document.createElement("div");
        this.iconEndSpeach.className = "end_speach_icon";
        this.startYawn = false;
        this.textblock.addEventListener("click", this.changeStep);
        this.iconEndSpeach.addEventListener("click", this.changeStep);
        this.type = new Teletype(this.text);
        this.textblock.appendChild(this.name);
        this.textblock.appendChild(this.text);
        scene.appendChild(this.textblock);
        scene.appendChild(this.buttons);
        scene.appendChild(this.slide);
        scene.appendChild(this.iconEndSpeach);
        this.onplay = new EventListener();

        this.personAnimation = new PersonAnimation();

        this.objInteractive = undefined;

        this.yawnTimer;

        this.nextStepTimer;

        this.currentStep = "begin";
    }
    changeStep = () => {
        var step = this.steps[this.state];

        if (this.textIndex < step.text.length) {
            this.showText();
            this.textIndex++;
        } else if (step.hasOwnProperty("next")) {
            this.play(step.next);
            this.startYawn = false;
        }
    };
    set(steps) {
        this.steps = steps;
    }

    /*playAudio(audio, data, list) {
            audio.play();
    
            var inteval = setInterval(function () {
                if (audio.currentTime >= audio.duration) {
                    clearInterval(inteval);
                }
                var n = audio.currentTime * 24;      
                var name = findName(n, data.words);
      
                if (prev != name) {
                    show(list, name);
                }
                prev = name;
            }, 20)
        }
    */

    createButtons(list) {
        for (let i in list) {
            if (list.hasOwnProperty(i)) {
                var btn = document.createElement("button");
                btn.textContent = i;

                btn.addEventListener("click", () => {
                    //
                    if (list[i].hasOwnProperty("animationSG")) {
                        this.showState([{ name: "professor", state: list[i].animationSG }]);
                        setTimeout(() => {
                            this.play(list[i].nextStep);
                        }, parseInt(list[i].timeAnimation) * 1000);
                    } else {
                        this.play(list[i]);
                    }
                });
                this.buttons.appendChild(btn);
            }
        }
    }

    showSlide(content) {
        if (typeof content == "string") {
            this.slide.style.fontSize = "40px";
            this.slide.textContent = content;
        } else if (content.hasOwnProperty("type") && content.type == "html") {
            this.slide.innerHTML = content.text;
        } else if (content.context == "interactive") {
            this.slide.innerHTML = "";
            let obj = this;
            obj.slide.append(content.data);
        } else {
            this.slide.style.fontSize = content.fontSize + "px";
            this.slide.textContent = content.text;
        }
    }

    showState(states) {
        // // Останавливаем анимации

        this.animation.forEach((a) => a.stop());
        this.animation = [];
        states.forEach((state) => {
            var group = this.groups[state.name];
            var element = state.state;

            for (var i in group.children) {
                if (group.children.hasOwnProperty(i)) {
                    var res = group.children[i];

                    if (i == element) {
                        res.node.style.display = "block";

                        this.animation = this.animation.concat(res.animation);
                        if (res.optimizeLoad == "sprite_manager") {
                            this.personAnimation.setSprite(group.children[element].children, res);
                        } else if (res.setBlink) {
                            this.personAnimation.playStateWithBlink(
                                element,
                                group.children[element].children,
                                res.node
                            );
                        }
                    } else {
                        // дополнительные персонажи ( указываются в классах интерактивах )
                        if ("additionalStates" in state) {
                            if (state.additionalStates.indexOf(i) >= 0) {
                                res.node.style.display = "block";
                                this.animation = this.animation.concat(group.children[i].animation);
                            } else {
                                res.node.style.display = "none";
                            }
                        } else {
                            res.node.style.display = "none";
                        }
                    }
                }
            }
        });

        // Запускаем новые animation
        this.animation.forEach((a) => a.play());
    }

    //проверка на какой нибудь интерактив
    testOnInteractive(step, slide, area) {
        if (this.objInteractive[step.interactive] === undefined) {
            slide = this.objInteractive.defaultSlide(slide);
        } else {
            if (!(slide === undefined)) {
                slide = this.objInteractive[step.interactive](slide, area, step, this.textIndex, this.groups);
            }
        }
        return slide;
    }
    getAnimationSG(animate = "") {
        let animation;
        if (animate != "") {
            if (animation == "yawn") {
                this.startYawn = true;
            }
            this.showState([{ name: "professor", state: animate }]);
        }
    }
    showText() {
        var step = this.steps[this.state];

        if (typeof this.yawnTimer != "undefined") {
            clearTimeout(this.yawnTimer);
        }
        var text = step.text[this.textIndex];

        this.nameSpeaker = step.active;
        let slide;

        this.name.innerHTML = this.nameSpeaker == "professor" ? "Профессор" : "Цифровенок";
        if (this.lastFragment) {
            this.lastFragment.audio.stop();
        }

        if (step.hasOwnProperty("sound_labels")) {
            this.lastFragment = this.roles[this.nameSpeaker];
            var fragName = step.sound_labels[this.textIndex];
            var fragmentId = this.lastFragment.audio.fragments.findIndex((item) => item.name == fragName);
            this.lastFragment.audio.play(fragmentId);

            var timing = this.lastFragment.timing[fragmentId];
            if (this.nameSpeaker == "professor") {
                var list = this.groups[this.nameSpeaker].children.default.children;
                this.personAnimation.play(timing, list, "default");
                this.personAnimation.stopSpeak();
            }
            if (this.nameSpeaker == "digobin") {
                // цифровенок болтает
                var list = this.groups[this.nameSpeaker].children.speak.children;

                this.personAnimation.play(timing, list, "speak");
                this.personAnimation.stopSpeak();
            }
        }

        if (typeof this.objInteractive != "undefined" && typeof step.interactive != "undefined") {
            slide = this.testOnInteractive(step, "", "showText");
            if (typeof slide != "undefined" && slide.context == "interactive") {
                this.showSlide(slide);
            }
        }
        this.type.setText(text);
        // Анимация текста
        this.animation.forEach((a) => a.playText(text));

        if (step.name != "intro" && typeof step.show != "undefined") {
            if (step.show[0].name == "professor") {
                this.yawnTimer = setTimeout(() => {
                    if (!this.startYawn) {
                        this.getAnimationSG("yawn");
                    }
                }, 120000);
            }
        }
    }
    play(state) {
        if (typeof this.yawnTimer != "undefined") {
            clearTimeout(this.yawnTimer);
        }
        if (typeof this.nextStepTimer != "undefined") {
            clearTimeout(this.nextStepTimer);
        }
        if (typeof this.ckipStepInterval != "undefined") {
            clearInterval(this.ckipStepInterval);
            this.iconEndSpeach.style.opacity = 0;
        }
        this.textIndex = 0;
        var step,
            obj = this,
            classAnimation;
        if (!this.steps.hasOwnProperty(state)) {
            return;
        }
        this.onplay.fire(state);

        if (this.state) {
            step = this.steps[this.state];
            this.textblock.classList.remove("textblock--" + step.active);
        }
        this.state = state;

        step = this.steps[this.state];
        this.textblock.classList.add("textblock--" + step.active);

        clear(this.buttons);

        if (typeof this.objInteractive == "undefined" && typeof step.lesson != "undefined") {
            arrInteractiveLesson.forEach(function (Elem: any) {
                classAnimation = new Elem(obj);

                if (classAnimation.getLesson() == step.lesson) {
                    obj.objInteractive = classAnimation;
                }
            });
        }
        let boolTestOnInteractive = typeof this.objInteractive != "undefined" && typeof step.interactive != "undefined";
        if (step.hasOwnProperty("slide")) {
            //мой код
            if (boolTestOnInteractive) {
                // возможно какое то событие и SG находится в состоянии анимации нужно вернуть его к заводским настройкам
                step.slide = this.testOnInteractive(step, step.slide, "play");
            } else {
                // значит какой то текст
                if (!!step.slide) {
                    step.slide = this.testOnInteractive(step, step.slide, "textDefault");
                }
            }

            this.showSlide(step.slide);
        } else {
            if (boolTestOnInteractive) {
                this.testOnInteractive(step, "", "play");
            }
        }
        if (step.hasOwnProperty("show")) {
            this.showState(step.show);
        }
        if (step.hasOwnProperty("actions")) {
            this.createButtons(step.actions);
        }
        if (step.hasOwnProperty("instantTransitionStep")) {
            this.nextStepTimer = setTimeout(() => {
                if (step.hasOwnProperty("next")) {
                    this.showIconEndingSpeach();
                } else {
                    this.play(step.instantTransitionStep);
                }
            }, parseFloat(step.timeTransition) * 1000);
        }
        this.showText();
        this.textIndex++;
    }
    showIconEndingSpeach() {
        let big_size = false;
        this.iconEndSpeach.style.opacity = 1;
        this.ckipStepInterval = setInterval(() => {
            if (big_size) {
                this.iconEndSpeach.style.transform = "scale(1.2)";
            } else {
                this.iconEndSpeach.style.transform = "scale(1)";
            }
            big_size = !big_size;
        }, 450);
    }
}
