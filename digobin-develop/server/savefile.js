const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../assets/');
const animate = 'speak';

exports.callback = function (request, response) {
    var requestUrl = url.parse(request.url);
    if (requestUrl.pathname === '/__savestate') {
        var body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            var text = Buffer.concat(body).toString();
            var project = JSON.parse(text);
            fs.writeFileSync(path.join(basePath, 'library/'+ animate, 'index.json'), JSON.stringify(project, null, 4));
            response.writeHead(200, 'OK');
            response.end();
        });
        return true;
    }

    if (requestUrl.pathname === '/__images') {
        var files = fs.readdirSync(path.join(basePath, 'library/'+ animate+'/images'));
        files.sort();
        response.writeHead(200, 'OK');
        response.write(JSON.stringify(files, null, 2));
        response.end();
        return true;
    }

    if (requestUrl.pathname === '/__state') {
        var file = fs.readFileSync(path.join(basePath, 'library/'+animate+'/index.json'), 'utf-8');
        response.writeHead(200, 'OK');
        response.write(file);
        response.end();
        return true;
    }

    if (requestUrl.pathname === '/__projects') {
        var files = fs.readdirSync(path.join(basePath, 'projects'));
        response.writeHead(200, 'OK');
        response.write(JSON.stringify(files, null, 2));
        response.end();
        return true;
    }

    if (requestUrl.pathname === '/__save') {
        var body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            var text = Buffer.concat(body).toString();
            var project = JSON.parse(text);
            fs.writeFileSync(path.join(basePath, 'projects', project.name, 'index.json'), JSON.stringify(project.data, null, 4));
            response.writeHead(200, 'OK');
            response.end();
        });

        return true;
    }
    return false;
}

