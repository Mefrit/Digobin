
export function resize(scene2) {

    var w = document.documentElement.offsetWidth,
        h = document.documentElement.offsetHeight;

    let marginLeft, scale;
    scale = ((h / 720) < (w / 1280) ? (h / 720) : (w / 1280));

    scene2.style.transform = "   scale( " + scale + " )";

    marginLeft = ((w - scene2.getBoundingClientRect().width) / 2);

    if (marginLeft >= 0) {
        if (scale <= 0 || w < scene2.getBoundingClientRect().width) {
            marginLeft = 0;
        }
        scene2.style.marginLeft = marginLeft + "px";
    }
}