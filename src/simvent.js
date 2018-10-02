/**
 * @overview simvent.js is a javascritp library aimed at 
 * simulating ventilation of the lung by medical mechanical ventilator.
 *
 * @author Nicolas Blais St-Laurent
 */

/**
 * All simvent.js class and functions are members of the <em>sv</em> object.
 * @namespace {Object} sv
 */
var sv = {}

//****************************
// Helper fumctions
//****************************

sv.translate = function(toTranslate, form, lang){
	try {var translated = dict[toTranslate][form][lang];}
	catch (e){console.log("Was unable to translate " + toTranslate)}
	finally {return translated;}
}

/**
 * Allo
 * @function
 */
sv.log = function(lung, vent){
	return {
		// Lung variables

		time  : vent.time,
		Flung : lung.flow,
		Palv  : lung.Palv,
		Pel   : lung.Pel,
		Pmus  : lung.Pmus,
		Vabs  : lung.Vabs,
		Vti   : lung.Vti,
		Vte   : lung.Vte,
		Vt	: lung.Vt,
		Vtmax : lung.Vtmax,
		PCO2  : lung.PCO2,
		SCO2  : lung.SCO2,
		VCO2  : lung.VtCO2,

		// Ventilator variables

		Pao    : vent.Pao,
		Fip    : vent.Fip,
		Fop    : vent.Fop,
		stateP : vent.stateP
	};
}

sv.logPerc = function(lung, vent){
	return {
		time: vent.time,
		Vtip: lung.Vtip,
		Vtep: lung.Vtep
	};
}

sv.sygY = function(x, ymin, ymax, xid, kid){
	return ymin + (ymax - ymin)/(1.0+Math.exp(-(x - xid)/kid))
};

sv.sygX = function(y, ymin, ymax, xid, kid){
	return xid - (kid * Math.log(((ymax - ymin)/(y - ymin))-1));
};

sv.avg = function(dataset, data, Nroll){

	for(var i = 0; i < dataset.length - (Nroll -1); i ++){

		var curent = i;
		var avged = dataset[curent][data];

		for(var i2 = curent + 1; i2 < (curent + Nroll) ; i2 ++){
			avged += dataset[i2][data];
		}

		dataset[curent][data] = avged/Nroll;
	}
}

sv.defaultsTable = function(obj){
	var target = document.scripts[document.scripts.length -1 ].parentNode;
	var table = document.createElement("table");
	target.appendChild(table);

	var rLine = document.createElement("tr");

	var c1 = document.createElement("th");
	c1.textContent = "Parameter";
	rLine.appendChild(c1);

	var c3 = document.createElement("th");
	c3.textContent = "Default";
	rLine.appendChild(c3);

	var c2 = document.createElement("th");
	c2.textContent = "Unit";
	rLine.appendChild(c2);

	table.appendChild(rLine);

	for(var id in obj){
		var param = obj[id];
		if(param.calculated != true){
			var rLine = document.createElement("tr");

			var c1 = document.createElement("td");
			c1.textContent = id;
			rLine.appendChild(c1);

			var c3 = document.createElement("td");
			c3.textContent = this[id];
			rLine.appendChild(c3);

			var c2 = document.createElement("td");
			c2.textContent = param.unit;
			rLine.appendChild(c2);

			table.appendChild(rLine);
		}
	}
};

sv.download = function(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
     
    var line = '';
    for (var index in array[0]) {
	    if(line != '') line += '\t '

		    line += index;
    }

    str += line + '\r\n';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if(line != '') line += '\t '
         
            line += array[i][index];
        }
 
        str += line + '\r\n';
    }
 
    var link = document.createElement('a');
    link.download = 'simvent.dat';
    link.href = 'data:text/tsv;charset=utf-8,' + escape(str);
    document.body.appendChild(link);
    setTimeout(function(){
		 link.click();
		 document.body.removeChild(link);
    }, 66);
}

//****************************
// Lung models
//****************************

/**
 * Lung models
 */

/** 
 * Base lung class uppon wich other models are bulid
 * @memberof sv
 */

sv.Lung = class Lung{
	constructor() {

		this.defaults = {
			Tsampl: 0.001,
			Raw: 5,
			// Gaz exchange parameters
			Vdaw   : 0.1,
			PiCO2  : 0.0,
			PACO2  : 35.0,
			Slope2 : 0.003,
			Slope3 : 5,
			// Variable parameters
			Vti	:  0,
			Vte	:  0,
			Vtmax:0,
			PCO2:0,
			Vabs    : 0
		};

		this.parseDefaults();
	}

	parseDefaults() {
		for (var p in this.defaults) {
			this[p] = this.defaults[p];
		}
	}

	get Palv() {return this.Pel - this.Pmus;}
	get Vt() {return this.Vtmax -this.Vte;}
	get SCO2() { return this.PCO2/(760-47); }
	get VcAlv() { return this.Vtmax - this.Vdaw; }
	get PplCO2() { return this.PACO2 - (this.Slope3 * (this.VcAlv / 2)); }

	/**
	 * Simulate a pressure being applied to airway openning of the lung
	 * @param {number} pressure The pressure (in cmH₂O) applied
	 * @param {number} duration The time (in secconds) for which
	 * the pressure is applied
	 */

	appliquer_pression(pression, duree) {

		var time = 0.0;
		var deltaVolume = 0.0;

		while (time < duree){
			var deltaP = pression - this.Palv;
			var flow = deltaP / this.Raw;
			//this.flow = deltaP / this.Raw;
			this.appliquer_debit(flow, this.Tsampl);

			time += this.Tsampl;
		}
	};

	appliquer_debit (flow, duration){

		if(isNaN(flow)){
			throw "sv.SimpleLung.appliquer_debit: NaN value passed as flow";
		}

		this.flow = flow ; // l/s
		var deltaVolume = this.flow * duration; // l
		this.Vabs+= deltaVolume; // l
		// this.Vti += deltaVolume;

		if (this.flow > 0){
			// We are inhaling

			this.Vti += deltaVolume;
			this.Vtmax = this.Vti;
			this.PCO2 = 0;
			this.Vte = 0;
			this.VtCO2 = 0;
		}

		else {
			this.Vti = 0;
			this.Vte -= deltaVolume;
			this.updateCO2();
			this.VtCO2 += this.SCO2 * (-deltaVolume);
		}
		this.time += duration;
	}

	updateCO2() {
		var co2 = sv.sygY(
				this.Vte,
				this.PiCO2, 
				this.PplCO2, 
				this.Vdaw, 
				this.Slope2);

		if (this.Vte > this.Vdaw) {
			co2 += this.Slope3 * (this.Vte - this.Vdaw);
		}

		this.PCO2 = co2;
	};

	complianceCurve(){
		var vent = new sv.PVCurve;
		var data = vent.ventilate(this).timeData;
		var idsvg = "svg" + document.querySelectorAll("svg").length;
		document.write("<svg id='" + idsvg +"'></svg>");
		function fx(d){return d.Pel;}
		function fy(d){return d.Vabs;}
		var graph = new gs.graph("#"+idsvg); 
		graph.setscale(data, fx, fy);
		graph.tracer(data, fx, fy);
		graph.setidx("Elastic recoil pressure (cmH₂O)");
		graph.setidy("Volume (l)");
	}

	defaultsTable(){
		sv.defaultsTable.call(this,this.mechParams);
	}
}

/** 
 * Basic lung model with linear compliance.
 * @extends sv.Lung
 */

sv.SimpleLung = class SimpleLung extends sv.Lung {
	constructor(params) {
		super();

		this.defaults = {
			Crs : 50.0,// ml/cmH2O
			Pmus   : 0,// cmH2O/l/s
			Vfrc: 2.5
			};

		this.parseDefaults();
		this.Vabs = this.Vfrc;
		this.mechParams = {
			Crs: {unit: "ml/cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		}

	}
	get Pel() {return 1000 * (this.Vabs - this.Vfrc)/ this.Crs;}

}

/** 
 * Lung model with linear compliance and spontaneous breathing.
 * @extends sv.Lung
 */

sv.SptLung = class SptLung extends sv.Lung{

	constructor() {

		super();
		this.defaults = {
			Crs : 50.0 ,// ml/cmH2O
			Fspt : 14.0 ,// c/min
			Ti : 1 , // sec
			Pmax : 6.5, // cmH20
			Vabs: 0, // Have to be initialised
			time : 0 // Have to be initialised
		};

		this.parseDefaults();
		this.mechParams = {
			Crs: {unit: "ml/cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"},
			Fspt: {unit: "/min."},
			Ti: {unit: "sec."},
			Pmax: {unit: "cmH₂O"}
		}
	}

	get Pmus(){
		var mTime = this.time % (60.0/this.Fspt);

		if(mTime<(2*this.Ti) && this.Fspt > 0){
			return 0.5 * this.Pmax * (1 + Math.sin(
						(2*Math.PI )* (mTime / (2*this.Ti))- Math.PI/2
					));
		}
		else{ return 0; }
	}

	get Pel() {return 1000 * this.Vabs/ this.Crs;}
}

/** 
 * Lung model with sygmoïd complianceg
 * @extends sv.Lung
 */

sv.SygLung = class SygLung extends sv.Lung{
	constructor() {

		super();
		this.defaults = {
			 // Mechanical parameters
			 Vmax : 4.0,
			 Vmin : 0.0,
			 Pid : 5.0,
			 Kid : 20.0,
			 Pmus:0,
		 };

		this.parseDefaults();

		this.mechParams = {
			Vmax: {unit: "l"},
			Vmin: {unit: "l"},
			Pid: {unit: "cmH₂O"},
			Kid: {unit: "cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		};

		this.flow = 0.0;
		this.Vabs = this.volume(0);
	}

	volume(P){
		return sv.sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
	}

	get Pel() {
		return sv.sygX(this.Vabs, this.Vmin, this.Vmax, this.Pid, this.Kid);
	}
};

/** 
 * Lung model with sygmoïd pressure - volume relation and inspiratory - expiratory histeresis.
 * @extends sv.Lung
 */

sv.RLung = class RLung extends sv.Lung {
	constructor() {
		super();
		this.defaults = {
			// Mechanical parameters
			Vmax : 4.0,
			Vmin : 0.0,
			Pid : 20,
			Kid : 20.0,
			Phister: 20,

			flow : 0.0,
			lastFlow : 0.0,
			Pmus: 0,
			Vtmax : 0,
			lastPel: 0
		};

		this.parseDefaults();

		this.VmaxExp=this.Vmax;
		this.VminInsp=this.Vmin;
		this.Vabs = this.volume(0);
		//console.log('Palv = ' + this.Palv);
		//console.log('Palv = ' + this.Palv);
		this.fitInsp();
		//console.log('Palv = ' + this.Palv);
		this.fitExp();
		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);
		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);
		//console.log('Palv = ' + this.Palv);
		//console.log('VminInsp = ' + this.VminInsp);
		//console.log('VmaxExp = ' + this.VmaxExp);

		this.mechParams = {
			Vmax: {unit: "l"},
			Vmin: {unit: "l"},
			PidInsp: {unit: "cmH₂O"},
			PidExp: {unit: "cmH₂O"},
			Kid: {unit: "cmH₂O"},
			Raw: {unit: "cmH₂O/l/s"}
		};
	}

	volume(P){
		return sv.sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
	}

	fitInsp(){
		//console.log('fitInsp');
		var N = 1 + Math.pow(Math.E,-((this.lastPel - this.PidInsp)/this.Kid));
		this.VminInsp = (N * this.Vabs - this.Vmax)/(N-1);
	}
	
	fitExp(){
		//console.log('fitExp');
		var N = 1 + Math.pow(Math.E,-((this.lastPel - this.PidExp)/this.Kid));
		this.VmaxExp = this.Vmin + (this.Vabs- this.Vmin) * N;
	}

	fit(){
		if (this.flow > 0 && this.lastFlow < 0){
			this.fitInsp();
		}

		else if (this.flow < 0 && this.lastFlow > 0){
			// We were inhaling and and are now exhaling
			this.fitExp();
		}

		this.lastFlow = this.flow;
	}

	get Pel(){
		this.fit();

		if (this.flow >= 0){
			var p = sv.sygX(
					this.Vabs, 
					this.VminInsp, 
					this.Vmax, 
					this.PidInsp, 
					this.Kid);
			this.lastPel = p;
			return p;
		}

		else /*if (this.flow < 0)*/{
			var p = sv.sygX(
					this.Vabs, 
					this.Vmin, 
					this.VmaxExp, 
					this.PidExp, 
					this.Kid);
			this.lastPel = p;
			return p;
		}
			/*
		else {
			var p = sv.sygX(
					this.Vabs, 
					this.Vmin, 
					this.VmaxExp, 
					this.Pid, 
					this.Kid);
			this.lastPel = p;
			return p;
		}
		*/
	}

	get PidInsp() {return this.Pid + (this.Phister/2);}
	get PidExp() {return this.Pid - (this.Phister/2);}
};

//******************************
//	Ventilator models
//******************************

/**
 * Lung object created with one of the simvent.js lung classes :
 * 
 * - {@link sv.SimpleLung}
 * - {@link sv.SptLung}
 * - {@link sv.SygLung}
 * - {@link sv.RLung}
 * @typedef LungObject
 */

/**
 * Base ventilator class uppon wich ventilator models are built
 */

sv.Ventilator = class Ventilator{

	constructor() {
		this.time = 0;

		/**
		 * Duration of the simulation in seconds
		 * @type {number}
		 */

		this.Tvent= 12;

		/** 
		 * Time in seconds between each iteration. 
		 * Higher value will result in faster simulation. 
		 * Lower values will result in more accurate simulation. 
		 * @type {number}
		 * */

		this.Tsampl = 0.003;

		this.demoLung = sv.SimpleLung;

		this.simParams = {
			Tsampl:{unit: "s"},
			Tvent: {uni: "s"}
		};

	}

	updateCalcParams(){ console.log("updateCalcParams is deprecated"); }

	/**
	 * Ventilate a lung object by applying **ventilationCycle** algorythm for **Tvent** time.
	 * @param {LungObject} lung lung object
	 * @return {object} ventResult
	 */

	ventilate(lung){

		this.timeData = [];

		for ( this.simulationStop = this.time + this.Tvent; this.time <= this.simulationStop; ){
				  //console.log("simvent: starting vent cycle");
			this.ventilationCycle(lung);
		}

		/*
		if(this.lowPass > 1){

			for (var index in this.dataToFilter){
				var id = this.dataToFilter[index];
				var smoothed = this.timeData[0][id];
				for (var jndex = 1, len = this.timeData.length; jndex<len; ++jndex){
					var currentValue = this.timeData[jndex][id];
					smoothed += (currentValue - smoothed) / this.lowPass;
					this.timeData[jndex][id] = smoothed;
				}
			}
		}

		if(this.rAvg >= 2){

			for (var index in this.dataToFilter){
				sv.avg(this.timeData, this.dataToFilter[index], this.rAvg);
			}
		}
		*/
		return {
			timeData: this.timeData
		};
	}

	/**
	 * Ventilation algorithm. Wille be repeated by the **ventilate** function
	 * for the duration of **Tvent**.
	 * @virtual
	 */

	ventilationCycle(){
		throw "ventilationCycle() must be implemented i high level ventilator model.";
	}

	sampleWaveform(){
		var lung = new this.demoLung();
		var data = this.ventilate(lung).timeData;

		var params = ["Pao"];
		for(var i in params){
			var idsvg = "svg" + document.querySelectorAll("svg").length;
			document.write("<svg id='" + idsvg +"' class='ventSample'></svg>");
			function fx(d){return d.time;}
			function fy(d){return d[params[i]];}
			var graph = new gs.graph("#"+idsvg); 
			graph.setscale(data, fx, fy);
			graph.tracer(data, fx, fy);
			graph.setidx("Time (s)");
			graph.setidy(params[i]);
		}
	}

	defaultsTable(){
		sv.defaultsTable.call(this,this.ventParams);
	}
};

/**
 * Flow trigered, pressure controled, flow cycled ventilator.
 * @extends sv.Ventilator
 */

sv.PressureAssistor = class PressureAssistor extends sv.Ventilator{

	constructor() {
		super();

		/** Inspiratory assistance (in cmH₂O)
		 * @member {number} */

		this.Passist = 12.0;
		this.PEEP = 5.0;
		this.Cycling = 25;
		this.Ftrig = 0.1;
		this.demoLung = sv.SptLung;

		this.ventParams = {
			Passist:{unit: "cmH₂O"},
			PEEP:{unit: "cmH₂O"},
			Ftrig:{unit:"l/min."},
			Cycling:{unit: "%"},
		};

	}

	ventilationCycle(lung){
		// Attente d'un declecnchement

		this.Fmax = 0;
		this.Pao = this.PEEP;
		while (lung.flow < this.Ftrig && this.time <= this.simulationStop){
			lung.appliquer_pression(this.PEEP, this.Tsampl);
			this.timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}

		// Phase inspiratoire
		this.Pao = this.Passist + this.PEEP;
		while (lung.flow > this.Fstop && this.time <= this.simulationStop){
			lung.appliquer_pression(this.Passist, this.Tsampl);
			this.timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;

			if (lung.flow > this.Fmax) {this.Fmax = lung.flow;}
		}
		lung.appliquer_pression(this.PEEP, this.Tsampl)
	}

	get Fstop(){return this.Fmax * this.Cycling / 100;}

}

/**
 * Time trigered, pressure controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

sv.PressureControler = class PressureControler extends sv.Ventilator {
	
	constructor(){
			super();

			this.Pinspi = 10.0;
			this.PEEP = 5.0;
			this.Ti = 1;
			this.Fconv = 12;


			this.ventParams = {
				Pinspi:{unit: "cmH₂O"},
				PEEP:{unit: "cmH₂O"},
				Fconv:{unit:"/min."},
				Ti:{unit: "cmH₂O"},
				Te:{calculated: true, unit: "sec."},
				Tcycle:{calculated: true, unit: "sec."}
			 };
	}

	get Tcycle() { return 60 / this.Fconv; }
	get Te() { return this.Tcycle - this.Ti; }

	ventilationCycle(lung){

			var tdeb = this.time;
			var tStop = this.time + this.Ti;

			this.Pao = this.Pinspi + this.PEEP;
			while(this.time < tStop && this.time<=this.simulationStop){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				this.timeData.push(sv.log(lung, this));

				this.time += this.Tsampl;
			}

			var tStop = this.time + this.Te;
			this.Pao = this.PEEP
			while(this.time < tStop && this.time<=this.simulationStop){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				this.timeData.push(sv.log(lung, this));

				this.time += this.Tsampl;
			}
	}

};

/**
 * Quasi-static (low flow), stepwise, pressure - volume loop maneuver
 * @extends sv.Ventilator
 */

sv.PVCurve = class PVCurve extends sv.Ventilator{

	constructor() {
		super();
		//this.Pstart = -100.0;
		this.Pstart = 0;
		this.Pmax = 100;
		this.Pstop = 0;
		this.Pstep = 2;
		this.Tman = 20;

		this.ventParams = {
			Pstart: {unit: "cmH₂O"},
			Pmax: {unit: "cmH₂O"},
			Pstop: {unit: "cmH₂O"},
			Pstep: {unit: "cmH₂O"},
			Tman: {unit: "s"}
		};
	}

	ventilate (lung){

		var timeData = [];
		var respd = [];

		this.time = 0.0;
		this.nbStep = ((this.Pmax - this.Pstart)+(this.Pmax - this.Pstop)) /this.Pstep
		this.Ti = this.Tman / this.nbStep
		this.Pao = this.Pstart

		while(this.Pao < this.Pmax){

			var tdeb = this.time;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}

			this.Pao += this.Pstep;
		}

		while(this.Pao >= this.Pstop){

			var tdeb = this.time;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}

			this.Pao -= this.Pstep;
		}

		return {
			timeData: timeData,
			respd:respd
		};
	}

};

sv.Phasitron = {};

sv.Phasitron.Fop = function(Fip, Pao){
	if(Pao >= 0 && Pao <=40){
		return Fip + (Fip * (5 -(Pao/8)));
	}
	else if(Pao > 40){return Fip;}
	else if(Pao < 0){return 6 * Fip;}
};

/**
 * High frequency ventilator imitating Percussionaire's VDR-4.
 * @extends sv.Ventilator
 */


sv.IPV = class IPV extends sv.Ventilator{

	constructor(){
		super();

		this.Tramp= 0.005;
		this.Rexp= 1; // cmH2O/l/s. To be adjusted based on the visual aspect of the curve.
		this.lppe = 4;
		this.lpip = 6;
		this.lpop = 1

		this.simParams = {
			Tvent: {unit: "s"},
			Tsampl: {unit: "s"},
			Tramp: {unit: "s"},
			Rexp: {unit: "cmH₂O/l/s"},
		};

		this.Fperc= 500;
		this.Rit= 0.5; //Ratio of inspiratory time over total time (percussion)
		this.Fipc=0.18;

		this.Fop=0; //Phasitron output flow
		this.Fip=0; //Phasitron output flow
		this.Pao=0;//Presure at the ariway openning (phasitron output)

		this.ventParams = {
			Fperc: {unit: "/min"},
			Fhz: {unit: "hz", calculated: true},
			Rit: {},
			Fipc: {unit: "l/s"}
		};

	}

	get Fhz (){ return this.Fperc / 60; }
	get Tip(){return (60/this.Fperc)*this.Rit;}
	get Tep(){return (60/this.Fperc)-this.Tip;}

	percussiveExpiration (lung, Rexp){
		// Must be executed in a scope where the timeData container is defined
		lung.flow = 0;
		this.Fip = 0;
		this.Fop = 0;
		this.stateP = 0;
		lung.Vtep = 0;

		var tStopPerc = this.time + this.Tep;
		while (this.time < tStopPerc){
			var Pao = - lung.flow * Rexp;			
			this.Pao = this.Pao + (Pao - this.Pao)/this.lppe;
			var flow = (this.Pao - lung.Palv)/lung.Raw;
			lung.appliquer_debit(flow, this.Tsampl);
			this.timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}
	}

	percussiveInspiration (lung, inFlow){
		// Must be executed in a scope where the timeData container is defined
		this.stateP = 1;
		lung.Vtip = 0;
		var tStartInsp = this.time;
		var tStopPerc = this.time + this.Tip;

		while (this.time < tStopPerc){

			this.Fip = this.Fip + (inFlow - this.Fip)/this.lpip;
			this.Pao = (this.Fop * lung.Raw) + lung.Palv;
			this.Fop = this.Fop + (sv.Phasitron.Fop(this.Fip, this.Pao) - this.Fop)/this.lpop;
			lung.appliquer_debit(this.Fop, this.Tsampl);
			
			this.timeData.push(sv.log(lung, this));
			this.time += this.Tsampl;
		}
	}
		
	ventilationCycle(lung){
			  this.percussiveInspiration(lung, this.Fipc);
			  this.percussiveExpiration(lung, this.Rexp);
	}


};

sv.VDR = class VDR extends sv.IPV{

	constructor(){
		super();

		this.Tic= 2; // Convective inspiratory time
		this.Tec= 2; // Convective expiratory time
		this.Fipl= 0.18; // 	
		this.Fiph= 1.8; // 
		this.CPR = 0;

		this.Fop=0; //Phasitron output flow
		this.Fip=0; //Phasitron output flow
		this.Pao=0;//Presure at the ariway openning (phasitron output)
		this.CycleC=0;

		this.ventParams = {
			Tic: {unit: "s"},
			Tec: {unit: "s"},
			Fconv: {unit: "s", calculated: true},
			Fperc: {unit: "/min"},
			Fhz: {unit: "hz", calculated: true},
			Rit: {},
			Fiph: {unit: "l/s"},
			Fipl: {unit: "l/s"},
			CPR: {}
		};

	}

	get Fconv (){ return 60 / (this.Tic + this.Tec); }
	get Tcc (){ return this.Tic + this.Tec; } // Duration of the convection cycle

	convectiveInspiration (lung){
		var tStopConv = this.Tcc * Math.ceil(this.time/this.Tcc);
		var tCPR = this.time + 0.8;
		this.CycleC=1;
		while (this.time < tStopConv && this.time < this.simulationStop){
			if (this.time < tCPR){
				var inflow = this.Fiph;
			}
			else {var inflow = this.Fiph * (1 + this.CPR);}
			this.percussiveInspiration(lung, inflow);

			if (this.time < tCPR){
				this.percussiveExpiration(lung, this.Rexp);
			}
			else {
				this.percussiveExpiration(lung, this.Rexp *  (1 + this.CPR));
			}
			//this.percData.push(sv.logPerc(lung, this));
		}
	}

	convectiveExpiration (lung){
		var tStopConv = this.Tcc * Math.floor(this.time/this.Tcc)+ this.Tec;
		this.CycleC=0;
		while (this.time < tStopConv && this.time < this.simulationStop){
			this.percussiveInspiration(lung, this.Fipl);
			this.percussiveExpiration(lung, this.Rexp);
			//this.percData.push(sv.logPerc(lung, this));
		}
	}

	ventilationCycle(lung){
			this.convectiveExpiration(lung);
			this.convectiveInspiration(lung);
	}

};

/**
 * Time trigered, flow controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

sv.FlowControler = class FlowControler extends sv.Ventilator{
	
	constructor(){
		super();

		this.Vt = 0.5;
		this.PEEP = 5.0;
		this.Ti = 1;
		this.Fconv = 18;

		this.ventParams = {
										Vt:{unit: "l", step:0.01},
			PEEP:{unit: "cmH₂O"},
			Fconv:{unit:"/min."},
			Ti:{unit: "cmH₂O"},
			Te:{calculated: true, unit: "sec."},
			Tcycle:{calculated: true, unit: "sec."}
		};
	}

	get Tcycle(){return 60 / this.Fconv;}
	get Te(){return (60 / this.Fconv) - this.Ti;}
	get Flow(){return this.Vt / this.Ti;}

	ventilationCycle(lung){

			for(var tStop=this.time+this.Ti; this.time<tStop && this.time<=this.simulationStop;this.time += this.Tsampl){
				lung.appliquer_debit(this.Flow, this.Tsampl)
				this.Pao = lung.Palv + (this.Flow * lung.Raw);
				this.timeData.push(sv.log(lung, this));
			}

			this.Pao = this.PEEP
			for(var tStop = this.time + this.Te; this.time < tStop && this.time<= this.simulationStop;this.time += this.Tsampl){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				this.timeData.push(sv.log(lung, this));
			}

			//var pmeco2 = ((760-47) * lung.veco2/lung.vce);
	}

}

sv.Protocol = class Protocol {

	constructor() {

	 }

	ventilate(lung) {
		  
	}
}

sv.ventilators = [
	sv.PressureControler,
	sv.FlowControler,
	sv.PressureAssistor,
	sv.VDR,
	sv.PVCurve
];

sv.lungs = [
	sv.SimpleLung,
	sv.SptLung,
	sv.SygLung,
	sv.RLung
];
