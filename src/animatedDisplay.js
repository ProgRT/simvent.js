import {graph} from "./moovingGraph.js";
import {dialog, button, delta} from './utils.js';
import {Vc} from './numDisplay.js';
import {pannelDiv} from './pannel.js';

export class display {

    static defaults = {

		debugMode: false,
        logPltTm: false,
        displayRemaining: false,
		timePerScreen: 12,
		Tsampl: 20,
		graphLoopInt: 40,
		target: document.body,
        restartNpts: 0,
		toolbar: document.querySelector("#rightControls"),
		datasets: ['Pao', 'Flung', 'PCO2'],
        numData: [ Vc ]
    };
   
	constructor(conf=null){

        conf = {...display.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

		this.data = [];
		this.grData = [];
		this.graphStack = [];
        this.numDisplay = [];
        this.cursors = [];
		this.tStart = 0;

        this.cursCont = document.createElement('div');
        this.cursCont.className = 'cursCont';
        this.target.append(this.cursCont);

        this.modal = new dialog({
            toolbar: this.toolbar,
            icon: "CourbesDeVentilation",
            title: "Sélection des courbes"
        });

        this.modal.onopen = ()=>{
            this.modal.setContent(this.waveformSelect());
        };

        this.btnStop = button({
            icon: "Pause",
            label: "Interrompre",
            title: "Interrompre",
            callback: ()=>{
                if (this.graphInt)  this.stop()
            }
        });

        this.btnStart = button({
            icon: "Play",
            label: "Reprendre",
            title: "Reprendre",
            callback: ()=>{
                this.start()
            }
        })

        this.toolbar.append(this.btnStop);
        this.toolbar.append(this.btnStart);

        this.initGrStack();

        window.onresize = ()=>this.redraw();

        if (this.numData.length > 0) {
            this.dataTable = document.createElement('div');
            this.dataTable.className = 'numDisplayContainer';
            document.body.append(this.dataTable);

            for (let d of this.numData) {
                let conf = {...{containerTable: this.dataTable}, ...d};
                this.numDisplay.push(new numDisplay(conf));
            }
        }
	}

    initGrStack () {
        for(let gr of this.graphStack) gr.remove();
		for(var ds of this.datasets){
			let gr = new graph(ds, this.timePerScreen, this.target);
            gr.tStart = this.tStart;
			this.graphStack.push(gr);
		}
    }

    waveformSelect () {
        let cols = Object.keys(this.grData[0]);

        let colFilter = (k)=>{
            return k != "time" && this.grData[5][k] != undefined;
        }

        cols = cols.filter(colFilter)

        let list = document.createElement('ol');
        list.id = 'wSelect';

        for (let column of cols){
            let li = document.createElement('li');
            li.innerHTML = `<input
            type='checkbox'
            id='cb${column}'
            value='${column}'
            ${this.datasets.includes(column)?'checked':''}/>
                <label for='cb${column}'>${column}</label>`;
            list.appendChild(li);
        }

        list.onchange = ()=>{
            let checked = list.querySelectorAll("input:checked");
            checked = [...checked].map(i=>i.value);

            this.datasets = checked;
            this.initGrStack();
            this.setYscale();
            this.redraw();
        }

        return list;
    }

    animate (data) {
        let dur = d3.max(data, d=>d.time);
        let Tsampl = data[1].time - data[0].time;

        this.timePerScreen = dur;
		this.pstPerScr = this.timePerScreen / Tsampl;
		this.ptPerMs = .001 / Tsampl
        this.data = data;
        this.setYscale();
        this.tStart = data[0].time;
        this.grData = [];
        this.restartNpts = 0;

        for(const g of this.graphStack){
            g.timePerScreen = dur;
            g.setXscale();
            g.tStart = this.tStart;
            g.coord = '';
        }

        this.start();
    }

    clearGraphs () {
        for(const g of this.graphStack) {
            g.coord = '';
            g.path.attr('d', g.coord);
        }
    }

	setYscale(){
        let dat = [...this.data, ...this.grData];

        if(dat.length == 0){
            this.stop();
            throw new Error("setYscale: Plus de données disponible");
        }

		for(const g of this.graphStack){
			g.setYscale(dat);
			g.drawGradY();
			g.drawGradX();
			g.setNLf();
		}
	}

    push (data) {
        let Tsampl = data[1].time - data[0].time;
		this.pstPerScr = this.timePerScreen / Tsampl;

		this.ptPerMs = .001 / Tsampl
        this.data = [...this.data, ...data];

        this.setYscale();
        if (this.grData.length > 0) this.redraw();
        //if (!this.graphInt) this.start();
    }

    display (data) {
        this.grData = data;
        let duration = d3.max(this.grData, d=>d.time);
        for (let g of this.graphStack) g.timePerScreen = duration;
        this.redraw();
    }

	redraw(){
		let scalingData = [...this.data, ...this.grData];

		if(scalingData.length == 0){
            console.log("redraw() called without scalingData");
            return;
		}

		for(var g of this.graphStack){
			g.redraw(scalingData, this.grData);
		}
	}

    whipe(){
			this.grData = [];
            this.restartNpts = 0;
			this.loopStartTime = new Date().getTime();
			this.tStart = this.data[0].time;

			for(const g of this.graphStack){
				g.tStart = this.tStart;
				g.coord = '';
			}
    }

    logDuration () {
        this.loopEndTime = new Date().getTime();
        this.loopDuration = this.loopEndTime - this.loopStartTime;
        let loopTimeSec = this.loopDuration/1000;
        let msg = `${this.timePerScreen}s plotted in ${loopTimeSec}s`;
        console.log(msg);
    }

	graphLoop(){

		if(this.data.length == 0){
            console.log("graphLoop: Stopping; No more data");
            this.stop();
            return 0;
		}

        // At this point, we have filled the graph. It is
        // time to clear and restart at 0 seconds

		if(this.grData.length >= this.pstPerScr){
			if (this.logPltTm) this.logDuration();
            this.whipe();
		}

		while(this.grData.length < this.targNPts && this.data.length > 0){
            this.grData.push(this.data.shift());
            for(var g of this.graphStack) g.updateCoord(this.grData);
            for(let nd of this.numDisplay) {
                if (nd.updateCodition(this.grData)) nd.update(this.grData);
            }
		}

		for (let gr of this.graphStack) gr.path.attr('d', gr.coord);
	}

    cursorControl(pos) {
        let div = document.createElement('div');
        div.className = 'cursCtrl';

        let label = document.createElement('label');
        label.textContent = `Curseur ${this.cursors.length + 1} : `;
        div.appendChild(label);

        let input = document.createElement('input');
        input.type = 'range';
        input.className = 'cursorControl';
        input.max = this.grData.length - 1;
        input.min = 0;
        input.value = Math.ceil(this.grData.length * pos);
        input.oninput = ()=>{
            div.value = e.value;
        }

        let plus = document.createElement('button');
        plus.textContent = '+';
        plus.onclick = ()=>{
            input.value = parseInt(input.value) + 1;
            const evt = new Event('input');
            input.dispatchEvent(evt);
        }
        let minus = document.createElement('button');
        minus.onclick = ()=>{
            input.value -= 1;
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

    // Number of points thad should have been plotted at this time
    get targNPts() {
        return Math.floor(this.timeInLoop * this.ptPerMs) + this.restartNpts;
    };

    // Time since last time plot started from zero sec onthe screen
    get timeInLoop() {return new Date().getTime() - this.loopStartTime};

	start(){

        for (let g of this.graphStack) g.clearCursors();
        document.querySelectorAll('.cursCtrl').forEach(c=>c.remove())
        this.cursors = [];
        if(this.cursTbl) this.cursTbl.remove();

        if(!this.graphInt){
            console.log("Creating new interval");
            this.loopStartTime = new Date().getTime();
            this.graphInt = setInterval(()=>this.graphLoop(), this.graphLoopInt);
            this.btnStart.style.display = 'none';
            this.btnStop.style.display = 'inline';
        }
	}

	stop(){
		clearInterval(this.graphInt);
        this.graphInt = null;
        this.restartNpts = this.grData.length;
        this.btnStart.style.display = 'inline';
        this.btnStop.style.display = 'none';
        
        if(this.grData.length > 2){
            this.addCursor(0);
            this.addCursor(1);
            this.cursors[2] = delta(this.cursors[0], this.cursors[1])
            let pannel = document.querySelector("#fpPanel");
            this.cursTbl = this.cursTable();
            pannel.append(this.cursTbl);
        }
	}

    addCursor(pos) {
        let cursNum = this.cursors.length;
        let ctrl = this.cursorControl(pos);
        let input = ctrl.querySelector('input');
        this.cursors[cursNum] = this.grData[input.value];

        let time = this.grData[ctrl.value].time - this.tStart;
        for (let g of this.graphStack) {
            g.drawCursor(time);
        }


        input.oninput = ()=>{
            this.cursors[cursNum] = this.grData[input.value];
            this.cursors[2] = delta(this.cursors[0], this.cursors[1])
            this.fillCursTbl(cursNum);
            let time = this.grData[input.value].time - this.tStart;
            for (let g of this.graphStack) {
                g.cursors[cursNum].move(time);
            }
        }

        this.cursCont.append(ctrl);
    }

    cursTable() {
        let div = pannelDiv('Curseurs');
        let tbl = document.createElement('table');
        tbl.className = 'cursTbl';
        div.appendChild(tbl);

        let thead = document.createElement('thead');
        tbl.append(thead);
        let headRow = document.createElement('tr');
        thead.append(headRow);

        let emptyCell = document.createElement('th');
        headRow.append(emptyCell);
        for(let c in [0,1]) {
            let th = document.createElement('th');
            th.textContent = `${parseInt(c) + 1}`;
            headRow.append(th);
            if(c>0){
                let th = document.createElement('td');
                th.textContent = 'Δ';
                headRow.append(th);
            }
        }

        let tbody = document.createElement('tbody');
        tbl.append(tbody);
        for(let ds of this.datasets){
            let row = document.createElement('tr');
            tbody.append(row);
            let th = document.createElement('th');
            th.textContent = ds;
            row.append(th);
            for (let c in [0,1]) {
                let td = document.createElement('td');
                td.textContent = this.cursors[c][ds].toFixed(1);
                row.append(td);
                if(c>0){
                    let td = document.createElement('td');
                    td.textContent = this.cursors[2][ds].toFixed(1);
                    row.append(td);
                }
            }
        }
        return div
    }

    fillCursTbl(cursIndex){
        window.cursTbl = this.cursTbl;
        let tbody = this.cursTbl.querySelector('tbody');

        for(let n in this.datasets){
            let ds = this.datasets[n];
            let row = tbody.childNodes[n];

            let td = row.childNodes[cursIndex + 1];
            td.textContent = this.cursors[cursIndex][ds].toFixed(1);

            let tdD = row.childNodes[3];
            tdD.textContent = this.cursors[2][ds].toFixed(1);
        }
    }
}

class numDisplay {
    static defaults = {
        containerTable: document.createElement('table'),
        label: 'Volume courant',
        unit: 'l',
        updateCodition: (data)=>true,
        value: data=>data[data.length].Vte
    }

    constructor (conf) {
        conf = {...numDisplay.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

        this.div = document.createElement('div');
        this.div.innerHTML = `<div>${this.label} (${this.unit})</div> <div class='value'> </div>`
        this.containerTable.append(this.div);

        this.valueDisp = this.div.querySelector('.value');
    }

    update (data) {
        this.valueDisp.innerHTML = this.value(data);
    }
}
