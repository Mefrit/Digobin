
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ResourceManager } from './lib/loader';
import { HeadSprites } from './lib/animation/animation';
import { loadAudio, loadSpriteTiming } from './lib/audio';

import { orderList } from './lib/order';

/*
function bem(block, element, theme) {
    return block + '__' + element + '--' + theme;  
}
*/

class Range {
    constructor(from, to) {
        this.from = Math.min(from, to);
        this.to = Math.max(from, to);
        this.offset = 1;
    }

    overlap(r) {
        return this.offset == r.offset && !(this.from > r.to || r.from > this.to)
    }
}

function orderRanges(ranges) {
    for (var i = 1; i < ranges.length; i++) {
        var r = ranges[i];
        for (var j = 0; j < ranges.length; j++) {
            if (i != j && r.overlap(ranges[j])) {
                r.offset++; j = 0;
            }
        }
    }
}

function createRanges(list) {
    var result = [];
    list.forEach((value, i) => {
        if (value.hasOwnProperty('next') && value.next) {
            result.push(new Range(i, list.findIndex(item => item.name == value.next)));
        }
        if (value.hasOwnProperty('actions')) {
            for (var j in value.actions) {
                if (value.actions.hasOwnProperty(j)) {
                    result.push(new Range(i, list.findIndex(item => item.name == value.actions[j])));
                }
            }
        }
    })
    return result;
}

class Role {
    constructor() {
        this.audio = null;
        this.head = null;
        this.timing = null;
    }
}

class App extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { projects: [], page: 'project-list' };
    }

    componentDidMount() {
        fetch('/src/__projects', {}).then(r => r.json()).then(r => {

            this.setState({ projects: r });
        })
    }

    onSelect = (name) => {
        this.setState({ project: name, page: 'project' });
    }

    onChangePage = (name) => {
        this.setState({ page: 'project-list' });
    }

    render() {
        if (this.state.page == 'project-list') {
            return <ProjectList projects={this.state.projects} onSelect={this.onSelect} />
        }
        if (this.state.page == 'project') {
            return <Project project={this.state.project} onRoute={this.onChangePage} />
        }
    }
}

class ProjectList extends React.Component<any, any> {
    render() {
        return (
            <div className="project">
                <ul>{this.props.projects.map(name => <li><a onClick={this.props.onSelect.bind(null, name)} className="project__name" >{name}</a></li>)}</ul>
            </div>
        );
    }
}

class Project extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.roles = {
            digobin: new Role(),
            professor: new Role()
        };
        this.secInterval = 0;

        this.fragmentId = -1;

        this.state = { data: [], step: 'intro', value: null, labels: [], edit: false, playAudio: false };
    }

    onSelectStep = (name, event) => {

        var data = this.state.data.find(item => item.name == name);
        this.setState({ step: name, value: data, labels: this.roles[data.active].audio.fragments, playAudio: false });
    }

    onChange = (key, n, event) => {
        var value = this.state.value;

        if (key == 'text') {
            value[key][n] = event.target.value;
        }
        if (key == 'label') {
            if (!value.hasOwnProperty('sound_labels')) {
                value.sound_labels = [];
            }
            value.sound_labels[n] = this.state.labels[parseInt(event.target.value, 10)].name;
        }
        this.setState({ edit: true, value: value })
    }

    getIndex(name, list) {
        return list.findIndex(item => item.name == name);
    }

    playAudio(n) {

        var data = this.state.value;
        var name = data.active;
        var k = this.getIndex(data.sound_labels[n], this.state.labels);

        var role = this.roles[name];

        if (this.fragmentId >= 0) {
            role.audio.stop();
        }
        if (k !== false) {
            this.fragmentId = k;
            role.head.play(role.timing[this.fragmentId]);
            role.audio.play(this.fragmentId);

        }
        this.setState({
            playAudio: true
        });
    }

    onAdd = (event) => {
        var value = this.state.value;
        value.text.push("");
        this.setState({ value: value, edit: true });
    }


    // добавляет слайды
    onStepAdd = (event) => {
        var data = this.state.data;
        data.push({
            active: 'professor', text: [], next: 'step' + (data.length + 1), name: 'step' + data.length, show: [{
                name: "professor",
                state: "default"
            },
            {
                name: "digobin",
                state: "default"
            }],

            lesson: this.props.project,
            instantTransitionStep: "",
            timeTransition: "10",
            order: data.length
        });

        this.setState({ data: data });
    }

    onOrder = (event) => {

        var data = orderList(this.state.data);
        this.setState({ data: data });
    }

    onChangeActive = (event) => {

        var value = this.state.value, data = this.state.data;
        value.active = event.target.value;

        if (event.target.value == 'digobin') {

            value.show[1].state = 'speak';
        } else {
            value.show[1].state = 'default';
        }
        this.setState({ edit: true, value: value, data: data });
    }

    onChangeNext = (event) => {

        var value = this.state.value;
        value.next = event.target.value;
        this.setState({ edit: true, value: value });
    }
    onChangeSlide = (event) => {
        var value = this.state.value;
        value.slide = event.target.value;

        this.setState({ edit: true, value: value });
    }

    onAddImage = (event) => {

        var value = this.state.value;
        value.interactive = "createImg";
        value.slide = "slides_" + this.props.project + "/" + value.slide;

        this.setState({ edit: true, value: value });
    }

    onSave = (event) => {

        var index = this.state.data.findIndex(item => item.name == this.state.step);
        var value = this.state.data[index];

        var data = Object.assign(value, this.state.value);
        this.state.data[index] = data;
        this.state.data.sort()
        let arr = this.state.data
        arr = arr.map((elem, i, arr) => {
            elem.instantTransitionStep = elem.next;
            elem.order = i;
            return elem;
        });
        arr = arr.sort((a, b) => {
            // if (parseInt(a.name.split('step')[1]) < parseInt(b.name.split('step')[1])) {
            if (a.order < b.order) {
                return -1;
            } else {
                return 1;
            }
        });

        var options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ name: this.props.project, data: { status: "development", steps: arr } })
        };
        fetch('/__save', options).then(r => {
            this.setState({ data: this.state.data });
        })
        this.setState({ edit: false, playAudio: false });
    }
    onSplit = (event) => {
        var data = this.state.value, step, val = this.state.value, arrStep = this.state.data;
        var arrRes = [], textArr = data.text;
        var index = this.state.data.findIndex(item => item.name == data.name), next = data.next;

        textArr.forEach((elem, i, arr) => {

            step = { active: data.active, text: [elem] };


            if (i != textArr.length - 1) {
                step.next = data.name + "." + (i + 1);
            } else {
                step.next = next;
            }
            if (i != 0) {
                step.name = data.name + "." + i;
            } else {
                step.name = data.name;
            }

            step.show = data.show;
            step.lesson = data.lesson;
            step.slide = data.slide;
            step.instantTransitionStep = data.instantTransitionStep;
            step.timeTransition = data.timeTransition;

            step.interactive = data.interactive;

            step.sound_labels = [data.sound_labels[i]];

            arrRes.push(step);


        });

        arrStep.splice(index, 1);
        arrStep = arrStep.concat(arrRes)

        this.setState({
            data: arrStep,
            edit: true,
            value: arrStep[arrStep.length]
        });
    }
    onChangeTimeTransition = (event) => {
        var step = this.state.value;
        step.timeTransition = event.target.value;

        this.setState({
            edit: true,
            playAudio: false
        });
    }
    componentDidMount() {
        var rs = new ResourceManager();
        var professor = this.roles.professor;
        var digobin = this.roles.digobin;

        var projectPath = './assets/projects/' + this.props.project;

        rs.load(projectPath + '/index.json').then((r) => {
            this.setState({ data: r.data.steps });
        });

        loadAudio(projectPath + '/audio/', 'professor').then(list => {
            professor.audio = list;
        });

        loadAudio(projectPath + '/audio/', 'digobin').then(list => {
            digobin.audio = list;
        });

        loadSpriteTiming(projectPath + '/speak/digobin.json').then(list => {
            digobin.timing = list;
        })

        loadSpriteTiming(projectPath + '/speak/professor.json').then(list => {
            professor.timing = list;
        })

        var canvas = document.getElementById('image');
        professor.head = new HeadSprites(canvas);
        professor.head.load('./assets/library/head/professor');

        digobin.head = new HeadSprites(canvas);
        digobin.head.load('./assets/library/head/digobin');
    }

    render() {

        return (
            <div className="app">
                <div className="menu">
                    <button onClick={this.props.onRoute}>проекты</button>
                    <button onClick={this.onOrder}>сортировать</button>
                    <button className="step__add" onClick={this.onStepAdd}>добавить слайд</button>
                </div>
                <div className="workarea">
                    <Story data={this.state.data} onSelectStep={this.onSelectStep} onStepAdd={this.onStepAdd} />
                    {this.state.value ?
                        <Step edit={this.state.edit}
                            playAudio={this.state.playAudio}

                            data={this.state.value}
                            name={this.state.step}
                            labels={this.state.labels}
                            steps={this.state.data.map(item => item.name)}
                            onChangeActive={this.onChangeActive}
                            onChangeNext={this.onChangeNext}
                            onChangeTimeTransition={this.onChangeTimeTransition}
                            onChangeSlide={this.onChangeSlide}
                            onAddImage={this.onAddImage}
                            onAdd={this.onAdd}
                            onSave={this.onSave}
                            onChange={this.onChange}
                            onSplit={this.onSplit}
                            onPlay={this.playAudio.bind(this)} />

                        : []}
                </div>
            </div>
        );
    }
}

class Select extends React.Component<any, any> {
    render() {
        return (
            <select onChange={this.props.onChange}>{
                this.props.data.map(v => <option value={v} selected={v == this.props.selected}>{v}</option>)
            }</select>
        );
    }
}

function cx(...arr) {
    return arr.filter(x => x).join(' ');
}

function getWords(text) {
    return text.toLowerCase().split(/[\s.\-\"\'\?]/g).filter(x => x.length);
}

function matchLabel(label, w) {
    var s = 0, last = 0;
    for (var j = 0; j < label.length; j++) {
        for (var i = last; i < w.length; i++) {
            if (label[j] == w[i]) {
                s++;
                last = i;
                break;
            }
        }
    }
    return s;
}

class VoiceLabel extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.wrapperRef = null;
        this.state = { show: false };
    }

    onClick = (event) => {
        event.stopPropagation();
        this.props.onChange(event);

        this.setState({ show: false });
    }

    onShow = (event) => {
        event.stopPropagation();
        this.setState({ show: true });
    }


    setWrapperRef = (node) => {
        this.wrapperRef = node;
    }

    hide = (event) => {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({ show: false });
        }
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.hide);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.hide);
    }

    render() {
        var text = getWords(this.props.text);
        var matches = this.props.labels.map((label, n) => {
            return matchLabel(getWords(label.name || ''), text);
        });
        var maxm = Math.max.apply(null, matches);

        return (<div className="ui-select"><div className="selected" onClick={this.onShow}>{((this.props.selected !== false && this.props.selected >= 0) && this.props.labels[this.props.selected].name) || '--'}</div>
            <div className="select" style={{ display: this.state.show ? 'block' : 'none' }} ref={this.setWrapperRef}>
                <div className="option" value={false} onClick={this.onClick}>--</div>
                {
                    this.props.labels.map((label, n) => {

                        return <option className={cx("option", n === this.props.selected && '  ', matches[n] == maxm && 'option--match')} value={n} onClick={this.onClick}>{n})  {label.name}</option>
                    })
                }
            </div> <button onClick={this.props.onPlay.bind(null, this.props.selected)}>play</button>   </div>);
    }
}

/*
class VoiceLabel extends React.Component<any, any> {
    render() {
        return (<div><select name="label" onChange={this.props.onChange}>
                <option value={false}>--</option>
            {        
                this.props.labels.map((label, n) => {
                    return <option value={n} selected={n === this.props.selected}>{label.name}</option>
                })
            }
            </select> <button onClick={this.props.onPlay.bind(null, this.props.selected)}>play</button></div>);
    }
}
*/

class Step extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.interval;
        this.state = {
            sec: 0
        }
    }
    getIndex(name, list) {
        return list.findIndex(item => item.name == name);
    }
    setTimer = () => {
        let secFuture = 0;
        clearInterval(this.interval);
        if (this.props.playAudio) {

            this.interval = setInterval(() => {
                secFuture = this.state.sec;
                secFuture += 1;

                if (!this.props.playAudio) {
                    clearInterval(this.interval);
                    secFuture = 0;
                }
                this.setState({ sec: secFuture });
            }, 1000);
        }



    }
    render() {
        var data = this.props.data;

        return (
            <div className="step">
                <div style={{ marginBottom: 10 }}><button className="step__save" onClick={this.props.onSave}>сохранить</button>{this.props.edit ? <span className="step__edit">*</span> : null}</div>
                <div>
                    <div className="step__active">{this.props.name} - <Select data={['professor', 'digobin']} selected={data.active} onChange={this.props.onChangeActive} /></div>
                    {
                        data.text.map((text, n) => {
                            return <div className="step__item"><textarea className="step__text" value={text} onChange={this.props.onChange.bind(this, 'text', n)} />
                                <VoiceLabel labels={this.props.labels} selected={data.hasOwnProperty('sound_labels') && this.getIndex(data.sound_labels[n], this.props.labels)}
                                    text={text}
                                    onChange={this.props.onChange.bind(this, 'label', n)}
                                    onPlay={this.props.onPlay.bind(this, n)} /></div>;
                        })
                    }
                    {this.props.playAudio ? <div>{this.setTimer()} <input type="button" onClick={this.props.onChangeTimeTransition} value={this.state.sec} /> Нажмите для определения времени для перехода на след кадр </div> : ""}
                    <br />
                    <br />
                    <hr />


                    <textarea className="step__text" placeholder='>Поле "slide"  ->  название изображения или текст' value={data.slide} onChange={this.props.onChangeSlide} ></textarea> <br />
                    <button className="step__add-text" onClick={this.props.onAddImage}>добавить как  избражение</button>   <button className="step__add-text" onClick={this.props.onSplit}>разбить step</button>    <br /> <br />

                    <button className="step__add-text" onClick={this.props.onAdd}>добавить запись</button>
                    <div style={{ marginTop: 10 }} className="step__next"><Select data={this.props.steps} selected={data.next} onChange={this.props.onChangeNext} /></div>
                </div>
            </div>
        );
    }
}

class Story extends React.Component<any, any> {
    render() {
        var rlist = createRanges(this.props.data);
        orderRanges(rlist);
        return (
            <div className="story">
                <div>{
                    this.props.data.map((item) => {
                        return <div className={"story__item story__item--" + item.active} onClick={this.props.onSelectStep.bind(this, item.name)}>{item.name}</div>;
                    })
                }</div>
                <div>{
                    rlist.map((r) => {
                        return <div className='story__bar' style={
                            { height: 56 * (r.to - r.from) + 6, top: 56 * r.from + 27, left: 232, width: 10 * r.offset }
                        }></div>;
                    })
                }</div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
