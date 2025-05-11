import translate from './translate.js';

export function button(params){
    var btn = document.createElement("button");
    btn.insertAdjacentElement('afterbegin', icon(params.icon));
    let label = params.label[0].toUpperCase() + params.label.slice(1);
    btn.id = `btn${label}`;
    btn.title = translate(params.title);
    if(params.key) {
        btn.title += ` (${translate(params.key)})`;
    }
    else if(params.keyLabel){
        btn.title += ` (${translate(params.keyLabel)})`;
    }
    btn.onclick = params.callback;
    if(params.key){
        addEventListener('keyup', e=>{
            let concerned = e.key == params.key || e.code == params.key;
            if (concerned) {
                let b = document.querySelector('#' + btn.id);
                if(b.disabled == false) {
                    b.click();
                }
            }
        });
    }
    return btn;
}

export function icon(icon) {
    let use = document.createElementNS("http://www.w3.org/2000/svg", 'use');
    use.setAttribute('href', `./Icones/Inhalothérapie.svg#${icon}`); 

    let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.setAttribute('viewBox', '0 0 180 180');
    svg.append(use);
    return svg;
}

export class dialog{ 
    static defaults = {
        toolbar: document.querySelector("body"),
        title: '',
        onopen: null,
        id: null
    }

    constructor (conf = null) {
        conf = {...dialog.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.dialog = document.createElement('dialog');
        if(this.id) this.dialog.id = this.id;
        document.body.prepend(this.dialog);

        let titlebar = document.createElement('div');
        titlebar.className = 'dialogTitleBar';
        titlebar.innerHTML = `<div></div>
        <div class='title'>${translate(this.title)}</div>
        <div class='toolbar'></div>`
        this.dialog.append(titlebar);

        let menu = titlebar.querySelector('.toolbar');

        this.content = document.createElement('div');
        this.content.className = 'dialogContent';
        this.dialog.append(this.content);

        var btnClose = document.createElement("button");
        btnClose.textContent = "X";
        btnClose.onclick = ()=>this.dialog.close();
        btnClose.title = `${translate('Close')} (${translate('ESC')})`;
        menu.prepend(btnClose);

        let btnOpen = button({
            icon: this.icon,
            title: this.title,
            callback: ()=>{
                if (this.onopen) this.onopen();
                this.dialog.showModal();
            },
            label: "showDialog",
            key: this.key
        });
        this.toolbar.append(btnOpen);
    }

    setContent (content) {
        this.content.innerHTML = null;
        switch (typeof content) {
            case 'string':
                this.content.innerHTML = content;
                break;
            case 'object':
                this.content.append(content);
                break;
        }

    }

    showModal () {
        this.dialog.showModal();
    }
}

export function improvedRange(params={}) {
    const cursParams = {
        step: 2,
        className: null,
        label: null,
        min: 0,
        max: 1,
        value: 0.5,
    }

    let p = {...cursParams, ...params};
    let div = document.createElement('div');
    div.className = p.className;

    if(p.label){
        let label = document.createElement('label');
        label.textContent = p.label;
        div.appendChild(label);
    }

    let input = document.createElement('input');
    input.type = 'range';
    input.className = 'cursorControl';
    input.max = p.max;
    input.min = 0;
    input.value = p.value;
    input.oninput = ()=>{
        div.value = e.value;
    }

    let plus = document.createElement('button');
    plus.textContent = '+';
    plus.tabIndex = -1
    plus.onclick = ()=>{
        input.value = parseInt(input.value) + p.step;
        const evt = new Event('input');
        input.dispatchEvent(evt);
    }

    let minus = document.createElement('button');
    minus.tabIndex = -1
    minus.onclick = ()=>{
        input.value -= p.step;
        const evt = new Event('input');
        input.dispatchEvent(evt);
    }
    minus.textContent = '-';


    div.append(input);
    div.append(minus);
    div.append(plus);

    div.value = input.value;
    return div;
}

