import * as React from "react";
import * as ReactDOM from "react-dom";

import { StoryPlayer } from "./lib/story";
import { ResourceManager } from "./lib/loader";
import { SceneBuilder } from "./lib/scene";
import { loadAudio, loadSpriteTiming } from "./lib/audio";
import { getUrlParams } from "./lib/url";
import { resize } from "./lib/resize";
class StepList extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { active: "intro" };
    }

    onSelect(name) {
        story.play(name);
    }

    componentDidMount() {
        story.onplay.add((name) => {
            this.setState({ active: name });
        });
    }

    render() {
        return (
            <ul className="step-list">
                {this.props.list.map((name) => (
                    <li
                        className={this.state.active == name ? "step__item--active" : ""}
                        onClick={this.onSelect.bind(null, name)}
                    >
                        {name}
                    </li>
                ))}
            </ul>
        );
    }
}

var params = getUrlParams(window.location.search);

export function convertToHash(data) {
    var result = [];
    data.steps.forEach((item) => {
        result[item.name] = item;
    });
    return result;
}
var lesson = params["l"] || "lesson1";

var config = {
    story: `../assets/projects/${lesson}/index.json`,
    scene: `../assets/projects/${lesson}/scene.json`,
};

var loading = document.getElementById("loading");
var scene = document.getElementById("scene");
scene.style.visibility = "hidden";

window.onresize = () => {
    resize(scene);
};

var rs = new ResourceManager();
var sb = new SceneBuilder(scene, rs);
var story = new StoryPlayer(scene);

resize(scene);
changeLesson(config, lesson);

function changeLesson(config, lesson) {
    rs.load(config.scene)
        .then((result) => {
            return sb.createScene(result.data, "", story);
        })
        .then((data) => loadAudio("../assets/projects/" + lesson + "/audio/", "digobin"))
        .then((result) => {
            story.roles.digobin.audio = result;
        })
        .then(() => loadAudio("../assets/projects/" + lesson + "/audio/", "professor"))
        .then((result) => {
            story.roles.professor.audio = result;
        })
        .then(() => loadSpriteTiming("../assets/projects/" + lesson + "/speak/digobin.json"))
        .then((list) => {
            story.roles.digobin.timing = list;
        })
        .then(() => loadSpriteTiming("../assets/projects/" + lesson + "/speak/professor.json"))
        .then((list) => {
            story.roles.professor.timing = list;
        })
        .then(() => rs.load(config.story))
        .then((result: any) => {
            loading.style.display = "none";
            scene.style.visibility = "visible";

            story.groups = sb.elements.children;

            let hash = convertToHash(result.data),
                params: any = getUrlParams(window.location.search);

            story.set(hash);
            story.play("intro");

            if (params.mode == "development") {
                ReactDOM.render(<StepList list={Object.keys(hash)} />, document.getElementById("step-group"));
                document.getElementById("controls").classList.add("showDevTools");
                document.getElementsByClassName("menu")[0].style.display = "none";
            }
        });
}
