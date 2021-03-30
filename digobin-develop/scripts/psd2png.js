var glob = require('glob');
var PSD = require('psd');

var filenames = `../assets/library/interactive/slides_lesson6/*.psd`;

glob(filenames, {}, function(err, files) {
    let arr, name_image = "";

    files.forEach(element => {
        arr = element.split('/');
        let name = arr[arr.length - 1].split('.psd')[0]
        name_image = "slide" + name.split('Слайд ')[1] + ".png";
        console.log("\n  name_image->" + name_image);
        exportFile(element, name_image)
    });

});

function exportFile(filename, path_img) {
    PSD.open(filename).then(function(psd) {
        let arrRes = [];
        psd.tree().descendants().forEach(function(node) {
            if (node.isGroup()) return true;

            if (node.name == "♦" || node.name.length == 1) {
                console.log("♦\n\n");
                node.name = path_img + "123";
            }

            if (node.name != "Фон") {
                arrRes.push(node)
                    // console.log("\n  node.name-> " + node.name + "node.name.length " + node.name.length + "\n");
                node.saveAsPng("../assets/library/interactive/slides_lesson6/" + path_img).catch(function(err) {
                    console.log("error->", err.stack);
                });
            }

        });
        // return arrRes.saveAsPng("./psd_image/" + path_img);
    }).then(function() {
        console.log('Finished!');
    });

}


// PSD.open(file).then(function (psd) {
//     psd.tree().descendants().forEach(function (node) {
//         if (node.isGroup()) return true;
//         node.saveAsPng("./output/" + node.name + ".png").catch(function (err) {
//             console.log(err.stack);
//         });
//     });
// }).then(function () {
//     console.log("Finished in " + ((new Date()) - start) + "ms");
// }).catch(function (err) {
//     console.log(err.stack);
// });