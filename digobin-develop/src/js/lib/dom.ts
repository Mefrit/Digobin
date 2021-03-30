
export function toggle(node, f) {
    node.style.display = f ? 'none': 'block';
}

export function el(id) {
    return document.getElementById(id);
}

export function hide(node) {
    node.style.display = 'none';
}

export function show(node) {
    node.style.display = 'block';
}

export function clear(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}