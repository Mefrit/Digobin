
function before(name, ch, offset = 0) {
    var n = name.lastIndexOf(ch);
    if (n >= 0) {
        return name.substr(0, n + offset);
    }
    return name;
}

function after(name, ch, offset = 0) {
    var n = name.lastIndexOf(ch);
    if (n >= 0) {
        return name.substr(n + offset);
    }
    return name;
}

export function dirname(path) {
    return before(path, '/');
}

export function filename(file) {
    return after(before(file, '.'), '/');
}

export function extension(file) {
    var p = file.lastIndexOf('.');
    if (p >= 0) {
        return file.substr(p + 1);
    }
    return '';
}

export function projectName(path) {

    return before(path, '_');
}
