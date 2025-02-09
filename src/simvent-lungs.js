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

class Lung{

	static simParams = [
		{id: 'Tsampl',   init: .001,  unit: 's'},
	];

	static carbParams = [
		{id: 'Vdaw',   init: 0.1,   unit: 'l'},
		{id: 'PiCO2',  init: 0.0,   unit: 'mmHg'},
		{id: 'PACO2',  init: 35.0,  unit: 'mmHg'},
		{id: 'Slope2', init: 0.003, unit: 'l'},
		{id: 'Slope3', init: 5, unit: 'mmhg/l'},
	];

	static variables = [
		{id: 'Vti',   init: 0,  unit: 'l'},
		{id: 'Vte',   init: 0,  unit: 'l'},
		{id: 'Vtmax', init: 0,  unit: 'l'},
		{id: 'Vabs',  init: 0,  unit: 'l'},
		{id: 'Flow',  init: 0,  unit: ''},
	];

	static mechParams = [
		{id: 'Raw',   init: 5,  unit: 'hPa/l/s'},
	];


	constructor() {

		this.parseDefaultsList([
			...Lung.simParams,
			...Lung.carbParams,
			...Lung.variables,
		]);

	}

	parseDefaultsList(list) {
		for(let p of list){
			this[p.id]=p.init;
		}
	}

	parseParams(list) {
		for(let p in list){
			if(p in this){this[p] = list[p]}
			else{console.log(`No parameter _${p}_ in lung _${this.constructor.name}_`)}
		}
	}

	get Palv() {return this.Pel - this.Pmus}
	get Pmus() {return 0}
	get Vt() {return this.Vtmax -this.Vte;}
	get SCO2() { return this.PCO2/(760-47); }
	get VcAlv() { return this.Vtmax - this.Vdaw; }
	get PplCO2() { return this.PACO2 - (this.Slope3 * (this.VcAlv / 2)); }

	get PCO2() {
		var PCO2 = sygY(
				this.Vte,
				this.PiCO2, 
				this.PplCO2, 
				this.Vdaw, //Pid / ou Vid 
				this.Slope2); // Kid

		if (this.Vte > this.Vdaw) {
			PCO2 += this.Slope3 * (this.Vte - this.Vdaw);
		}
		
		return PCO2;
	}

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
			//console.log(`appliquer_pression: this.Palv = ${this.Palv}`);
			var deltaP = pression - this.Palv;
			var flow = deltaP / this.Raw;
			this.appliquer_debit(flow, this.Tsampl);

			time += this.Tsampl;
		}
	};

	appliquer_debit (flow, duration){

		if(isNaN(flow)){
			throw "Lung.appliquer_debit: NaN value passed as flow";
		}

		this.flow = flow ; // l/s
		var deltaVolume = this.flow * duration; // l
		this.Vabs+= deltaVolume; // l

		if (this.flow > 0){
			// We are inhaling

			this.Vti += deltaVolume;
			this.Vtmax = this.Vti;
			this.Vte = 0;
			this.VtCO2 = 0;
		}

		else {
			this.Vti = 0;
			this.Vte -= deltaVolume;
			this.VtCO2 += this.SCO2 * (-deltaVolume);
		}
		this.time += duration;
	}

}

/** 
 * Basic lung model with linear compliance.
 * @extends Lung
 */

export class SimpleLung extends Lung {

	static mechParams = [
		...Lung.mechParams,
		{id: 'Crs',   init: 50,  unit: 'ml/hPa'},
		{id: 'Vfrc',   init: 2.5,  unit: 'l'},
	];

	constructor(params) {

		super();

		this.parseDefaultsList(SimpleLung.mechParams);
		this.parseParams(params);

		this.Vabs = this.Vfrc;

	}
	get Pel() {return 1000 * (this.Vabs - this.Vfrc)/ this.Crs;}
	get TC() {return .001 * this.Crs * this.Raw}

}

/** 
 * Lung model with linear compliance and spontaneous breathing.
 * @extends sv.Lung
 */

export class SptLung extends SimpleLung{

	static mechParams = [
		...SimpleLung.mechParams,
		{id: 'Fspt',   init: 14,  unit: '/min'},
		{id: 'Pmax',   init: 6.5, unit: 'hPa'},
		{id: 'Ti',     init: 1,   unit: 's'},
	];

	constructor(params) {

		super();

		this.parseDefaultsList(SptLung.mechParams);
		this.parseParams(params);
		this.time=0;

        console.log(SptLung.mechParams);
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

}

/** 
 * Lung model with sygmoïd complianceg
 * @extends sv.Lung
 */

export class SygLung extends Lung{

	static mechParams = [
		...Lung.mechParams,
		{id: 'Vmax', init: 4, unit: "l"},
		{id: 'Vmin', init: 0, unit: "l"},
		{id: 'Pid', init: 5, unit: "cmH₂O"},
		{id: 'Kid', init: 20, unit: "cmH₂O"},
	] ;

	constructor(params) {

		super();
		this.parseDefaultsList(SygLung.mechParams);
		this.parseParams(params);

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
	static mechParams = [
		...Lung.mechParams,
		{id: 'Vmax', init: 4, unit: "l"},
		{id: 'Vmin', init: 0, unit: "l"},
		{id: 'Pid', init: 20, unit: "cmH₂O"},
		{id: 'Kid', init: 20, unit: "cmH₂O"},
		{id: 'Phister', init: 20, unit: "cmH₂O"},
	];

	static calcParams = [
		{id: 'PidInsp', unit: "cmH₂O"},
		{id: 'PidExp', unit: "cmH₂O"},
	];

	static variables = [
		{id: 'lastFlow', init: 0},
		{id: 'Vtmax', init: 0},
		{id: 'lastPel', init: 0},
	];

	constructor(params) {
		super();

		this.parseDefaultsList(RLung.mechParams);
		this.parseDefaultsList(RLung.variables);
		this.parseParams(params);

		this.VmaxExp=this.Vmax;
		this.VminInsp=this.Vmin;
		this.Vabs = this.volume(0);

		this.fitInsp();
		this.fitExp();

		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);
		this.appliquer_pression(1,3);
		this.appliquer_pression(-1,3);

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
