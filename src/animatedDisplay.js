import {graph} from "./moovingGraph.js";
import {fmt, dialog, button, icon, delta, ratio, improvedRange} from './utils.js';
import {display as numDisp} from './numDisplay.js';
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
        units: units
    };
   
	constructor(conf=null){

        conf = {...display.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

		this.data = [];
        this.wData = [];
		this.grData = [];
		this.graphStack = [];
        this.cursors = [];
		this.tStart = 0;

        this.container = document.createElement('div');
        this.container.className = 'waveformsContainer';
        this.target.append(this.container);

        this.cursCont = document.createElement('div');
        this.cursCont.className = 'cursCont';
        this.container.append(this.cursCont);

        this.btnStop = button({
            icon: "Pause",
            label: "Pause",
            title: "Pause",
            keyLabel: 'Space',
            callback: ()=>{
                if (this.graphInt)  this.stop()
            }
        });

        this.btnStart = button({
            icon: "Play",
            label: "Resume",
            title: "Resume",
            keyLabel: 'Space',
            callback: ()=>{
                this.start()
            }
        })
        this.btnStart.disabled = true;
        this.btnStop.disabled = true;

        window.addEventListener('keyup', (e)=>{
            if(e.code == 'Space') {
                e.preventDefault();
                if(this.graphInt) this.stop();
                else this.start();
            }
        });

        this.toolbar.append(this.btnStop);
        this.toolbar.append(this.btnStart);

        this.modal = new dialog({
            toolbar: this.toolbar,
            icon: "CourbesDeVentilation",
            title: "Waveforms",
            key: 'w'
        });

        this.modal.onopen = ()=>{
            this.modal.setContent(this.waveformSelect());
        };

        this.dwlLnk = dwlLnk()
        this.toolbar.append(this.dwlLnk);

        this.initGrStack();

        window.onresize = ()=>this.redraw();

        this.nDisp = new numDisp({
            target: this.target,
            numData: this.numData
        });

	}

    initGrStack () {
        for(let gr of this.graphStack) gr.remove();
        this.graphStack = [];

		for(var ds of this.datasets){
			let gr = new graph(ds, this.timePerScreen, this.container);
            gr.tStart = this.tStart;
			this.graphStack.push(gr);
		}

        this.redraw();

        for(let c of this.cursors){
            let time = c.time - this.tStart;
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
    }

    display (data) {
        this.grData = this.convUnits(data);
        let duration = d3.max(this.grData, d=>d.time);
        for (let g of this.graphStack) g.timePerScreen = duration;
        this.redraw();
        this.dwlLnk.href = this.dataUrl;
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
            this.wData = this.grData;
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

        // Note to myself: this loop is updating coordinates and data one
        // point at the time while there is about 10 missing point per
        // interval.

		while(this.grData.length < this.targNPts && this.data.length > 0){
            this.grData.push(this.data.shift());
            for(var g of this.graphStack) g.updateCoord(this.grData);
            if(this.nDisp) {
                this.nDisp.update([...this.wData, ...this.grData]);
            }
		}

		for (let gr of this.graphStack) gr.path.attr('d', gr.coord);
	}

    waveformSelect () {
        let cFilter = (k)=> {
            return k != "time" && this.grData[5][k] != undefined;
        }

        let cols = Object.keys(this.grData[0]).filter(cFilter);

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
            //this.btnStart.style.display = 'none';
            //this.btnStop.style.display = 'inline';
            this.btnStart.disabled = true;
            this.btnStop.disabled = false;
            this.dwlLnk.classList.add('disabled');
        }
	}

	stop(){
		clearInterval(this.graphInt);
        this.graphInt = null;
        this.restartNpts = this.grData.length;
        this.btnStart.disabled = false;
        this.btnStop.disabled = true;
        this.dwlLnk.disabled = false;
        
        if(this.grData.length > 2){

            this.dwlLnk.classList.remove('disabled');
            this.dwlLnk.href = this.dataUrl;
10
            this.cursTbl = new cursTable(this.datasets);
            this.addCursor(0);
            this.addCursor(1);
            this.redraw();
            let pannel = document.querySelector("#fpPanel");
            this.fillCursTbl(0);
            this.fillCursTbl(1);
            pannel.append(this.cursTbl.container);
            this.redraw();
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
            let time = this.grData[input.value].time - this.tStart;//This line of code seem unused and should probably be removed
            let c = this.cursors[n];
            for (let g of this.graphStack) g.cursors[n].move(c);
        }

        this.cursCont.append(ctrl);
    }

    fillCursTbl(cursIndex){
        this.cursTbl.fill(cursIndex, this.cursors, this.tStart);
    }

    get dataUrl(){
        let csv = toCsv([...this.wData, ...this.grData]);
        let bl = new Blob([csv]);
        return URL.createObjectURL(bl);
    }
}

class cursTable {
    constructor (rows) {
        this.rows = rows;

        this.container = pannelDiv('Cursors', 'Curseur');

        let tbl = document.createElement('table');
        tbl.className = 'cursTbl';
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

            row.childNodes[1].textContent = fmt(dif[ds], 2);
            row.childNodes[2].textContent = fmt(R[ds], 2);
        }
    }

    remove() { this.container.remove(); }
}

function toCsv(dat){
    let hLine = Object.keys(dat[0]).join(',');
    let dLines = dat.map(obj => Object.values(obj).join(',')).join('\n');
    return hLine + '\n' + dLines;
}

function dwlLnk () {

    let lnk = document.createElement('a');
    lnk.append(icon('Télécharger'));
    lnk.download = 'simvent_data.csv';
    lnk.title = translate('Download data');

    return lnk;
}
