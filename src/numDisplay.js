import {translate} from './translate.js';
import {fmt} from './utils.js';
import {Vt, Ppeak} from './numDisplay-param.js';

export class display {
    static defaults = {
        numData: [
            Vt,
            Ppeak
        ],
        target: document.body,
        graphLoopInt: 1000,
        cells: []
    }

	constructor(conf=null){
        conf = {...display.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.container = document.createElement('div');
        this.container.className = 'numDisplayContainer';
        this.target.append(this.container);

        for (let d of this.numData) {
            let conf = {
                ...{containerTable: this.container},
                ...d
            };
            this.cells.push(new cell(conf));
        }
        //this.start();
    }

    update(data){
        for(let cell of this.cells) {
            if (cell.updateCodition(data)) cell.update(data);
        }
    }

	start(){

        if(!this.graphInt){
            this.graphInt = setInterval(()=>{
                this.update(this.data);
            }, this.graphLoopInt);
        }
	}

	stop(){
		clearInterval(this.graphInt);
	}
}

export class cell {
    static defaults = {
        containerTable: document.createElement('table'),
        label: 'Volume courant',
        unit: 'l',
        updateCodition: (data)=>true,
        value: data=>data[data.length].Vte,
        dec: 0
    }

    constructor (conf) {
        conf = {...cell.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.div = document.createElement('div');
        this.div.innerHTML = `<div>${translate(this.label)} <small>(${this.unit})</small></div> <div class='value'> </div>`
        this.containerTable.append(this.div);

        this.valueDisp = this.div.querySelector('.value');
    }

    update (data) {
        this.valueDisp.innerHTML = fmt(this.value(data), this.dec);
    }
}
