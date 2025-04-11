import {graph} from "./moovingGraph.js";
import {fmt, dialog, button, delta, ratio, improvedRange} from './utils.js';
import {Vc, Ppeak} from './numDisplay.js';
import {pannelDiv} from './pannel.js';
import {translate, units} from './translate.js';

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
		toolbar: document.body,
		datasets: ['Pao', 'Flung', 'PCO2'],
        numData: [ Ppeak, Vc ],
        units: units
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

        this.modal = new dialog({
            toolbar: this.toolbar,
            icon: "CourbesDeVentilation",
            title: "Sélection des courbes"
        });

        this.modal.onopen = ()=>{
            this.modal.setContent(this.waveformSelect());
        };

        this.initGrStack();

        window.onresize = ()=>this.redraw();
        window.addEventListener('keyup', (e)=>{
            if(e.code == 'Space') {
                if(this.graphInt) this.stop();
                else this.start();
            }
        });

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
        this.graphStack = [];

		for(var ds of this.datasets){
			let gr = new graph(ds, this.timePerScreen, this.target);
            gr.tStart = this.tStart;
			this.graphStack.push(gr);
		}

        this.redraw();

        for(let c of this.cursors){
            let time = c.time - this.tStart;
            //for (let g of this.graphStack) g.drawCursor(time);
            for (let g of this.graphStack) g.drawCursor(c);
        }
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

    convUnits(data){
        for(let c in this.units){
            let f = this.units[c].factor;
            data = data.map(d=>{
                d[c] = d[c] * f;
                return d;
            });
        }
        return data;
    }

    push (data) {
        data = this.convUnits(data);

        let Tsampl = data[1].time - data[0].time;
		this.pstPerScr = this.timePerScreen / Tsampl;

		this.ptPerMs = .001 / Tsampl
        this.data = [...this.data, ...data];

        this.setYscale();
        if (this.grData.length > 0) this.redraw();
        //if (!this.graphInt) this.start();
    }

    display (data) {
        this.grData = this.convUnits(data);
        let duration = d3.max(this.grData, d=>d.time);
        for (let g of this.graphStack) g.timePerScreen = duration;
        this.redraw();
    }

    animate (data) {
        data = this.convUnits(data)
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

	redraw(){
		let scDat = [...this.data, ...this.grData];

		if(scDat.length > 0){
            for(var g of this.graphStack) g.redraw(scDat, this.grData);
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
                <label for='cb${column}'>${translate(column)}</label>`;
            list.appendChild(li);
        }

        list.onchange = ()=>{
            let checked = list.querySelectorAll("input:checked");
            checked = [...checked].map(i=>i.value);

            this.datasets = checked;
            this.initGrStack();
            this.setYscale();
            this.redraw();

            if(this.cursTbl) {
                this.cursTbl.remove();
                let pannel = document.querySelector("#fpPanel");
                this.cursTbl = new cursTable(this.datasets);
                this.cursTbl.fill(0, this.cursors);
                this.cursTbl.fill(1, this.cursors);
                this.fillCursTbl(0);
                this.fillCursTbl(1);
                pannel.append(this.cursTbl.container);
            }
        }

        return list;
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
            //console.log("Creating new interval");
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
            this.cursTbl = new cursTable(this.datasets);
            this.addCursor(0);
            this.addCursor(1);
            let pannel = document.querySelector("#fpPanel");
            this.fillCursTbl(0);
            this.fillCursTbl(1);
            pannel.append(this.cursTbl.container);
        }
	}

    addCursor(pos) {
        let n = this.cursors.length;

        let ctrl = improvedRange({
            className: 'cursCtrl',
            label: `Curseur ${this.cursors.length + 1} : `,
            max: this.grData.length - 1,
            value: Math.ceil(this.grData.length * pos)
        });

        let input = ctrl.querySelector('input');
        this.cursors[n] = this.grData[input.value];

        let time = this.grData[ctrl.value].time - this.tStart;
        for (let g of this.graphStack) {
            g.drawCursor(this.cursors[n]);
        }

        input.oninput = ()=>{
            this.cursors[n] = this.grData[input.value];
            this.fillCursTbl(n);
            let time = this.grData[input.value].time - this.tStart;
            for (let g of this.graphStack) g.cursors[n].move(this.cursors[n]);
        }

        this.cursCont.append(ctrl);
    }

    fillCursTbl(cursIndex){
        this.cursTbl.fill(cursIndex, this.cursors, this.tStart);
    }
}

class numDisplay {
    static defaults = {
        containerTable: document.createElement('table'),
        label: 'Volume courant',
        unit: 'l',
        updateCodition: (data)=>true,
        value: data=>data[data.length].Vte,
        dec: 0
    }

    constructor (conf) {
        conf = {...numDisplay.defaults, ...conf};
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

class cursTable {
    constructor (rows) {
        this.rows = rows;

        this.container = pannelDiv('Cursors', 'Curseur');
        let tbl = document.createElement('table');
        tbl.className = 'cursTbl';
        //tbl.innerHTML = `<thead><tr>
        //    <th></th><th>C1</th><th>C2</th><th>Δ</th><th>÷</th>
        //    </tr></thead>`
        tbl.innerHTML = `<thead><tr>
            <th></th><th>Δ</th><th>÷</th>
            </tr></thead>`
        this.container.appendChild(tbl);
        let heads = this.container.querySelectorAll('thead tr th');
        this.corner = [...heads][0];
        this.cursHead = [...heads].splice(1,2);

        this.tbody = document.createElement('tbody');
        for(let ds of rows){
            let row = document.createElement('tr');
            let label = translate(ds);
            row.innerHTML = `<th>${label}</th><td></td><td></td>`

            if(ds in units) row.childNodes[0].innerHTML += ` <small>(${units[ds].unit})</small>`;
            this.tbody.append(row);
        }
        tbl.append(this.tbody);
    }

    fill (col, cursors, tStart = 0) {

        let cursor = cursors[col];
        let dif = delta(cursors[0], cursors[1]);
        let R = ratio(cursors[0], cursors[1]);


        this.corner.textContent = `Δ t : ${fmt(dif.time, 3)} s`;
        for(let n in this.rows){
            let ds = this.rows[n];
            let row = this.tbody.childNodes[n];

            let tdD = row.childNodes[1];
            tdD.textContent = fmt(dif[ds], 2);
            //if(ds in units) tdD.innerHTML += ` <small>${units[ds].unit}</small>`;

            let tdR = row.childNodes[2];
            tdR.textContent = fmt(R[ds], 2);
        }
    }

    remove() { this.container.remove(); }
}
