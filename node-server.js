const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

let cache = {};
const send404 = (response) => {
    response.writeHead(404, {
        "Content-Type": "text/plain",
    });
    response.write("Error 404: resource not found.");
    response.end();
};

const sendFile = (response, filePath, fileContents) => {
    response.writeHead(200, {
        "Content-Type": mime.getType(path.basename(filePath)),
    });
    response.end(fileContents);
};
const serveStatic = (response, cache, absPath) => {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {

        fs.stat(absPath, (err) => {
            if (err) {
                send404(response);
            } else {
                fs.readFile(absPath, (err, data) => {
                    if (err) {
                        send404(response);
                    } else {
                        sendFile(response, absPath, data);
                        cache[absPath] = data;
                    }
                });
            }
        });
    }
};
const server = http.createServer();
server
    .on("request", (request, response) => {
        let filePath = false;
        console.log(" request.url", request.url);
        request.url === "/" ? (filePath = "/src/index.html") : (filePath = request.url);


        if (request.url.indexOf("lesson.html") != -1) {
            filePath = "/src/lesson.html"
            console.log("start\n", request.url)
            console.log("absPath", filePath, "\n");
        }
        console.log("filePath=> ", filePath);
        let absPath = "./digobin-develop" + filePath;
        serveStatic(response, cache, absPath);

    })
    .listen(8002, () => console.log("Server is running with localhost:8002"));