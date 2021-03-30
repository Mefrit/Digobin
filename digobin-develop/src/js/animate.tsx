// https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
// 1. Сделать перенос обьектов группировку и сохранение в файл
// 1.1 Дерево проекта
// 1.1 Свойства обьекта положение, размер, видимость
// 1.2 Свойства обьекта
// 2. Сделать покадровую анимацию
// 3. Сделать создание скелета

//import * as React from 'react';
//import * as ReactDOM from 'react-dom';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const animate = 'speak';

function updateElement(scene, target, cc) {
    var id = target.getAttribute('data-id');
    var el = scene.find((e) => e.id == id);
    if (el) {
        cc(el, target);
        return true;
    }
    return false;
}

function removeElement(scene, target) {
    var id = target.getAttribute('data-id');
    var el = scene.findIndex((e) => e.id == id);
    if (el >= 0) {
        scene.splice(el, 1);
        return true;
    }
    return false;
}

function range(a, b) {
    var result = [];
    for (var i = a; i < b; i++) {
        result.push(i);
    }
    return result;
}

class Resource {
    name = '';
    path = '';
    id = 0;
    left = 0;
    top = 0;
    width = 0;
    height = 0
    hidden = false;
}

class MovieClip {
    frames = [];
    id = 0;
    top = 0;
    left = 0;
    type = 'movieclip';
    current = 0;
}

class Document extends React.Component<any, any> {
    renderTree(data) {
        // console.log('Document 67', data);
        return data.map(e => {
            if (e.path) {
                return <img src={'/assets/library/' + animate + '/' + e.path} data-id={e.id} style={{ top: e.top, left: e.left, zIndex: e.zIndex, position: 'absolute', display: e.hidden ? 'none' : 'block' }} />;
            }
            if (e.children) {
                return <div style={{ position: 'absolute' }}>{this.renderTree(e.children)}</div>;
            }
        });
    }
    render() {
        return (<div>{this.renderTree(this.props.data)}</div>);
    }
}

let menu = [];
function menuitem(name) {
    return (target, propertyKey, descriptor) => {
        menu.push({ name, fn: target[propertyKey] });
    };
}

class App extends React.Component<any, any> {
    selected = null;
    workarea = null;
    id = 0;

    constructor(props) {
        super(props);
        this.state = { library: [], clip: { name: 'sample', frames: [] }, scene: [] };
    }

    modifyObject(key, selected) {
        if (key == 'ArrowUp') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.top -= 1;
            });
        }
        if (key == 'ArrowDown') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.top += 1;
            });
        }
        if (key == 'ArrowRight') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.left += 1;
            });
        }
        if (key == 'ArrowLeft') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.left -= 1;
            });
        }

        if (key == 'Delete') {
            return removeElement(this.state.scene, selected);
        }

        if (key == 'PageUp') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.zIndex = el.zIndex ? el.zIndex + 1 : 1;
            })
        }
        if (key == 'PageDown') {
            return updateElement(this.state.scene, selected, (el, target) => {
                el.zIndex = el.zIndex ? el.zIndex - 1 : 1;
            });
        }
    }

    componentDidMount() {
        var selected = null;
        var target = null, offset = { x: 0, y: 0 };

        this.workarea.addEventListener('mousedown', (event) => {
            event.preventDefault();
            var w = this.workarea;
            var x = event.clientX - w.offsetLeft;
            var y = event.clientY - w.offsetTop;

            if (event.target.getAttribute('data-id')) {
                target = event.target;

                if (selected) {
                    selected.style.outline = 'none';
                }
                this.selected = selected = target;
                selected.style.outline = '1px solid #fff';

                offset.x = x - target.offsetLeft;
                offset.y = y - target.offsetTop;
            } else if (selected) {
                selected.style.outline = 'none';
                this.selected = selected = null;
            }
        });

        window.addEventListener('keydown', (event) => {
            if (!selected) return;
            if (this.modifyObject(event.key, selected)) {
                this.setState({ scene: this.state.scene });
            }
        });

        this.workarea.addEventListener('mousemove', (event) => {
            event.preventDefault();
            var w = this.workarea;
            var x = event.clientX - w.offsetLeft;
            var y = event.clientY - w.offsetTop;

            if (target) {
                target.style.left = (x - offset.x) + 'px';
                target.style.top = (y - offset.y) + 'px';
            }
        });

        this.workarea.addEventListener('mouseup', (event) => {
            if (target) {
                updateElement(this.state.scene, target, (el, target) => {
                    el.left = target.offsetLeft;
                    el.top = target.offsetTop;
                })
                this.setState({ scene: this.state.scene });
                target = null;
            }
        });

        fetch('__images').then(r => r.json()).then((data) => {
            this.setState({ library: data });
        });

        fetch('__state').then(r => r.json()).then((data) => {
            this.setState({ scene: data });
        });
    }

    @menuitem('сохранить');
    onSave = () => {
        var options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(this.state.scene)
        };
        fetch('__savestate', options).then((data) => {
            console.log('saved');
        });
    }

    onAdd = (name) => {
        var img = new Image();
        img.src = '/assets/library/' + animate + '/images/' + name;
        this.id = Date.now();

        img.onload = () => {
            this.state.scene.push({ name: name, path: 'images/' + name, id: this.id, left: 0, top: 0, width: img.width, height: img.height, hidden: false });
            this.setState({ scene: this.state.scene });
        }
    }

    @menuitem('клип');
    onClip = () => {
        if (this.selected) {
            var target = this.selected;
            var id = target.getAttribute('data-id');

            var pos = this.state.scene.findIndex((e) => e.id == id);
            if (pos >= 0) {
                var tmp = this.state[pos];
                var clip = { type: 'movieclip', left: tmp.left, top: tmp.top, frames: [], current: 0 };
                tmp.top = 0;
                tmp.left = 0;
                clip.frames[0] = [tmp];

                this.state.scene[pos] = clip;
            }
        }
    }

    findInTree(data, id) {
        for (var i = 0; i < data.length; i++) {
            var el = data[i];
            if (el.id == id) {
                return el;
            }
            if (el.children) {
                var val = this.findInTree(el.children, id);
                if (val) {
                    return val;
                }
            }
        }
        return false;
    }

    onChange(id) {
        // Поиск в дереве
        var el = this.findInTree(this.state.scene, id);
        if (el) {
            el.hidden = !el.hidden;
        }
        this.setState({ scene: this.state.scene });
    }

    sceneTree(data, sid) {
        return data.map(e => {
            if (e.path) {
                return <div className={e.id == sid ? 'element--selected' : ''}><input type="checkbox" checked={!e.hidden} onClick={this.onChange.bind(this, e.id)} />{e.name}</div>
            }
            if (e.children) {
                return <div className={'element__group'} style={{ marginLeft: 21 }}><div className="group-name">{e.name}</div>{this.sceneTree(e.children, sid)}</div>
            }
        });
    }

    render() {
        var clip = this.state.clip;
        if (this.selected) {
            var sid = this.selected.getAttribute('data-id');
        }
        return (
            <div className="app">
                <div className="menu">
                    {menu.map(item => <button onClick={item.fn}>{item.name}</button>)}
                    {/*<button onClick={this.onSave}>сохранить</button><button onClick={this.onClip}>клип</button>*/}
                </div>
                <div className="workarea" ref={(node) => this.workarea = node}>
                    <div className="vline"></div>
                    <div className="hline"></div>
                    <Document data={this.state.scene} />
                </div>
                <div className="timeline"><span>{clip.name}</span>{range(0, clip.frames.length).map(n => <span>{n}</span>)}</div>
                <div className="controls">
                    <div className="library">
                        <ul>{this.state.library.map(name => <li onClick={this.onAdd.bind(this, name)}>{name}</li>)}</ul>
                    </div>
                    <div className="scene">{

                        this.sceneTree(this.state.scene, sid)
                    }</div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
