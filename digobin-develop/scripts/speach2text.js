const { execSync } = require("child_process");
var glob = require("glob");
var path = require("path");

//var sphinx_path = 'D:\\Apps\\sphinx\\';
var sphinx_path = "D:\\Mihail\\projects\\cartoon\\bin\\sphinx\\";
var sphinx = sphinx_path + "bin\\pocketsphinx_continuous";
var hmm = sphinx_path + "zero_ru_cont_8k_v3/zero_ru.cd_cont_4000";
//var hmm = sphinx_path + 'zero_ru_cont_8k_v3/zero_ru.cd_ptm_4000';
//var hmm = sphinx_path + 'zero_ru_cont_8k_v3/zero_ru.cd_semi_4000';
var dict = sphinx_path + "zero_ru_cont_8k_v3/ru.dic";
var lm = sphinx_path + "zero_ru_cont_8k_v3/ru.lm";

function decodeSound(role, files = "*.wav") {
    var filenames = `../temp/${role}/${files}`;

    glob(filenames, {}, function(err, files) {
        files.forEach((filename) => {
            var pathname = path.dirname(filename);
            var file = path.basename(filename, ".wav");

            var output = path.join(pathname, "w" + file + ".dat");

            var cmdline = `${sphinx} -infile ${filename} -hmm ${hmm} -dict ${dict} -lm ${lm} -remove_noise no -time yes -logfn log.txt > ${output}`;
            console.log(cmdline);
            execSync(cmdline);
        });
    });
}

// decodeSound("digobin");
decodeSound('lesson6/professor');