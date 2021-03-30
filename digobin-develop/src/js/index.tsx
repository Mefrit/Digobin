import { StoryPlayer } from "./lib/story";
import { ResourceManager } from "./lib/loader";
import { SceneBuilder } from "./lib/scene";
import { MenuBuilder } from "./lib/menu";
import { getUrlParams } from "./lib/url";
import { resize } from "./lib/resize";

var params = getUrlParams(window.location.search);

export function convertToHash(data) {
    var result = [];
    data.steps.forEach((item) => {
        result[item.name] = item;
    });
    return result;
}
var lesson = params["l"] || "menu";

var config = {
    story: `assets/projects/${lesson}/index.json`,
    scene: `assets/projects/${lesson}/scene.json`,
};

var loading = document.getElementById("loading");
var scene = document.getElementById("scene");
scene.style.visibility = "hidden";
window.onresize = () => {
    resize(scene);
};
resize(scene);

var rs = new ResourceManager();
var sb = new SceneBuilder(scene, rs);
var story = new StoryPlayer(scene);

startHome(config, lesson);

export function startHome(config, lesson) {
    console.log("config", config);
    rs.load(config.story)
        .then((result) => {
            sb.createScene(result.data.img, "", story);

            loading.style.display = "none";
            scene.style.visibility = "visible";
            return result;
        })
        .then((result) => {
            let hash = convertToHash(result.data);
            document.getElementsByClassName("menu")[0].style.display = "none";
            let lessonContainer = document.getElementsByClassName("lessonContainer")[0],
                textblock = document.getElementsByClassName("textblock")[0];
            textblock.style.display = "none";
            let mb = new MenuBuilder(lessonContainer, rs);
            mb.createMenuElements(hash.intro.list);
        });
}
