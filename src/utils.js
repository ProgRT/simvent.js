export function button(params){
    var btn = document.createElement("button");
    btn.insertAdjacentElement('afterbegin', icon(params.icon));
    let label = params.label[0].toUpperCase() + params.label.slice(1);
    btn.id = `btn${label}`;
    btn.title = params.title;
    btn.onclick = params.callback;
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
        onopen: null
    }

    //constructor (toolbar, icon="Carnet") {
    constructor (conf = null) {
        conf = {...dialog.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.dialog = document.createElement('dialog');
        document.body.prepend(this.dialog);

        let titlebar = document.createElement('div');
        titlebar.className = 'dialogTitleBar';
        titlebar.innerHTML = `<div></div>
        <div class='title'>${this.title}</div>
        <div class='toolbar'></div>`
        this.dialog.append(titlebar);

        let menu = titlebar.querySelector('.toolbar');

        this.content = document.createElement('div');
        this.content.className = 'dialogContent';
        this.dialog.append(this.content);

        var btnClose = document.createElement("button");
        btnClose.textContent = "X";
        btnClose.onclick = ()=>this.dialog.close();
        menu.prepend(btnClose)

        let btnOpen = button({
            icon: this.icon,
            title: this.title,
            callback: ()=>{
                if (this.onopen) this.onopen();
                this.dialog.showModal();
            },
            label: "showDialog"
        });
        this.toolbar.prepend(btnOpen);
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
