import {sygX, sygY} from './simvent-math.js';
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

export class Lung{
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
		var co2 = sygY(
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

export class SimpleLung extends Lung {
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

export class SptLung extends Lung{

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

export class SygLung extends Lung{
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
		return sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
	}

	get Pel() {
		return sygX(this.Vabs, this.Vmin, this.Vmax, this.Pid, this.Kid);
	}
};

/** 
 * Lung model with sygmoïd pressure - volume relation and inspiratory - expiratory histeresis.
 * @extends sv.Lung
 */

export class RLung extends Lung {
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
		this.fitInsp();
		this.fitExp();
		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);
		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);

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
		return sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
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
			var p = sygX(
					this.Vabs, 
					this.VminInsp, 
					this.Vmax, 
					this.PidInsp, 
					this.Kid);
			this.lastPel = p;
			return p;
		}

		else /*if (this.flow < 0)*/{
			var p = sygX(
					this.Vabs, 
					this.Vmin, 
					this.VmaxExp, 
					this.PidExp, 
					this.Kid);
			this.lastPel = p;
			return p;
		}
	}

	get PidInsp() {return this.Pid + (this.Phister/2);}
	get PidExp() {return this.Pid - (this.Phister/2);}
};
