// Тест мимики
import { getUrlParams } from "./lib/url";
import { HeadSprites } from "./lib/animation/animation";
import { AudioSprites, loadAudio, loadSpriteTiming } from "./lib/audio";

var params = getUrlParams(window.location.search);

var audioID = params.num || 0;
var role = params.role || "professor";

var list = [];
var sprites;

loadAudio("audio/lesson1/", "lesson1" + (role == "professor" ? "" : "-" + role))
    .then((data) => {
        sprites = data;
    })
    .then(() => loadSpriteTiming(`speak/${role}.json`))
    .then((data) => {
        list = data;
    });

var btn = document.getElementById("btn");
btn.onclick = function () {
    startSpeak();
};

function startSpeak() {
    sprites.play(audioID);
    head.play(list[audioID]);
}

var canvas = document.getElementById("image");
var head = new HeadSprites(canvas);
head.load(role);
