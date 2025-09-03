import {translate} from './translate.js';
import {fmt} from './utils.js';
import * as params from './numDisplay-param.js';

export class display {
    static defaults = {
        params: [
            'Ppeak',
            'Vt',
            'Fratio'
        ],
        activeParams: [
            'Vt',
            'Ppeak',
        ],
        target: document.body,
        graphLoopInt: 1000,
        debug: [],
        cells: []
    }

	constructor(conf=null){
        conf = {...display.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.container = document.createElement('div');
        this.container.className = 'numDisplayContainer';
        this.target.append(this.container);

        for (let d of this.params) {
            let conf = {
                ...{containerTable: this.container},
                ...params[d],
                active: this.activeParams.includes(d) ? true : false
            };
            this.cells.push(new cell(conf));
        }
        //this.start();
    }

    update(data){
        for(let cell of this.cells.filter(d=>d.active)) {
            if (cell.updateCodition(data)) {

                let tStart = new Date();
                cell.update(data);
                let tEnd = new Date();

                if(this.debug.includes('cellUpdateTime')) {
                    console.log(`Cell ${cell.id} updated in ${tEnd - tStart} ms`);
                }
        }
    }
    }

	start() {

        if(!this.graphInt){
            this.graphInt = setInterval(()=>{
                this.update(this.data);
            }, this.graphLoopInt);
        }
	}

	stop(){
		clearInterval(this.graphInt);
	}

    numSelect () {

        let list = document.createElement('ol');
        list.id = 'nSelect';

        for (let p of this.cells){
            let li = document.createElement('li');
            li.innerHTML = `<input
            type='checkbox'
            id='npCheckbox${p.id}'
            value='${p.id}'
            ${p.active?'checked':''}
            />
                <label for='np${p.id}'>${translate(p.id)}</label>`;
            li.onchange = (e)=>{
                let tgt = e.target;
                let param = tgt.value;
                let checked = tgt.checked;
                let elm = document.querySelector(`#np${param}`);

                switch (checked) {
                    case false:
                        p.active = false;
                        elm.style.display = 'none';
                        break;
                    case true:
                        p.active = true;
                        elm.style.display = 'unset';
                        break;
                }
            };
            list.appendChild(li);
        }

        list.onchange = ()=>{
            let checked = list.querySelectorAll("input:checked");
            checked = [...checked].map(i=>i.value);

            this.datasets = checked;
        }

        return list;
    }
}

export class cell {
    static defaults = {
        containerTable: document.createElement('table'),
        id: undefined,
        active: true,
        unit: 'l',
        updateCodition: (data)=>true,
        value: data=>data[data.length].Vte,
        dec: 0
    }

    constructor (conf) {
        conf = {...cell.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.div = document.createElement('div');
        this.div.id = 'np' + this.id;
        if (!this.active) this.div.style.display = 'none';
        this.div.innerHTML = `<div>
            ${translate(this.id)}
            ${this.unit? `<small>(${this.unit})</small>`:''}
            </div> <div class='value'> </div>`
        this.containerTable.append(this.div);

        this.valueDisp = this.div.querySelector('.value');
    }

    update (data) {
        this.valueDisp.innerHTML = fmt(this.value(data), this.dec);
    }
}
