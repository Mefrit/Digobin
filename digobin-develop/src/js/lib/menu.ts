import { dirname, projectName } from "./path";
export class MenuBuilder {
    constructor(root, loader) {
        this.root = root;
        this.loader = loader;
        this.elements = { children: {}, name: null };
        this.menuCreated = false;
    }
    goToLesson = (event) => {
        window.location.href = "src/lesson.html?l=" + event.target.getAttribute("data-lesson");
    };
    createMenuElements(list) {
        list.forEach((elem) => {
            let htmlObj = document.createElement("div"),
                img,
                header = document.createElement("h3");
            htmlObj.setAttribute("data-lesson", elem.lesson);
            htmlObj.addEventListener("click", this.goToLesson);
            this.loader.load(elem.path).then((result) => {
                img = document.createElement("img");
                img.className = "elemMenu__img";
                img.src = elem.path;
                img.setAttribute("data-lesson", elem.lesson);
                header.setAttribute("data-lesson", elem.lesson);
                header.innerHTML = elem.name;
                header.className = "elemMenu__header";
                htmlObj.className = "lessonContainer__elemMenu";
                htmlObj.appendChild(img);
                htmlObj.appendChild(header);
            });

            this.root.appendChild(htmlObj);
        });
    }
}
