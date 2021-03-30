var numbers = ["1", "2", "3", "4", "5", "6", "7"];
var negative = ["-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5", "6", "7"];

function show_red_numbers(scene) {
    var nums = scene.createGroup("numbers");
    var animation = new m_animation.Animation();

    numbers.forEach((n) => {
        var tn = new Text(n);
        nums.addObject(tn);
    });

    nums.children.forEach((n) => {
        animation.hide(tn, 0, 0);
        animation.show(tn, n * 1000, 5);

        if (n % 2 == 0) {
            animation.changeColor(tn, n * 1000, "block", "red");
        }
    });

    animation.start();

    return nums;
}

function show_blue_numbers(scene) {
    var nums = scene.getGroup("numbers");
    nums.children.forEach((n) => {
        if (n % 2 == 0) {
            animation.changeColor(tn, n * 1000, "red", "blue");
        }
    });
    return nums;
}

function select_numbers(scene) {
    var nums = scene.createGroup("selection");
    for (let i = 0; i < 10; i++) {
        var tn = new Text();
        tn.addEventListener("click", () => {
            if (n % 2 == 0) {
                tn.setColor("green");
            } else {
                tn.setColor("red");
            }
        });
        nums.add(tn);
    }

    return nums;
}

function show_negative(scene) {
    var nums = scene.createGroup("negative");
    numbers.forEach((n) => {
        var tn = new Text(n);
        nums.addObject(tn);
    });

    return nums;
}

// exports.show_red_numbers = show_red_numbers;
// exports.show_blue_numbers = show_blue_numbers;
