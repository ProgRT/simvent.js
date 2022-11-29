//******************************
//	Ventilator models
//******************************

/**
 * @module simvent-ventilators
 */

/**
 * Base ventilator class uppon wich ventilator models are built
 */

//import * as sd  from "./simvent-describe.js";

class Ventilator{

	static simParams = [
		{id: 'Tsampl', init: .003, unit: 's'},
		{id: 'Tvent', init: 12, unit: 's'},
	];

	constructor(params) {

		this.time = 0;
		this.parseDefaultsList(Ventilator.simParams);
	}

	parseDefaultsList(list) {
		for(let p of list.filter(p=>!p.calculated)){
			this[p.id]=p.init;
		}
	}

	updateCalcParams(){ console.log("updateCalcParams is deprecated"); }

	log(lung){
		this.timeData.push( {
			
			// Ventilator variables

			time   : this.time,
			Pao    : this.Pao,
			Fip    : this.Fip,
			Fop    : this.Fop,
			stateP : this.stateP,

			// Lung variables

			Flung : lung.flow,
			Palv  : lung.Palv,
			Pel   : lung.Pel,
			Pmus  : lung.Pmus,
			Vabs  : lung.Vabs,
			Vti   : lung.Vti,
			Vte   : lung.Vte,
			Vt    : lung.Vt,
			Vtmax : lung.Vtmax,
			PCO2  : lung.PCO2,
			SCO2  : lung.SCO2,
			VCO2  : lung.VtCO2

		});
	}
	/**
	 * Ventilate a lung object by applying **ventilationCycle** algorythm for **Tvent** time.
	 * @param {LungObject} lung lung object
	 * @return {object} ventResult
	 */

	ventilate(lung){
		this.timeData = [];

		for ( this.simulationStop = this.time + this.Tvent; this.time <= this.simulationStop; ){
			this.ventilationCycle(lung);
		}

		return { timeData: this.timeData };
	}

	/**
	 * Ventilation algorithm. Wille be repeated by the **ventilate** function
	 * for the duration of **Tvent**.
	 * @virtual
	 */

	ventilationCycle(){
		throw "ventilationCycle() must be implemented i high level ventilator model.";
	}

	defaultsTable(){
		sd.defaultsTable.call(this,this.ventParams);
	}
};

/**
 * Flow trigered, pressure controled, flow cycled ventilator.
 * @extends sv.Ventilator
 */

export class PressureAssistor extends Ventilator{

	static ventParams = [
		{id: 'Passist', init: 12,  unit: "cmH₂O"},
		{id: 'PEEP',    init: 5,   unit: "cmH₂O"},
		{id: 'Ftrig',   init: 0.1, unit:"l/min."},
		{id: 'Cycling', init: 25,  unit: "%"},
	];

	constructor() {
		super();
		this.parseDefaultsList(PressureAssistor.ventParams);
	}

	ventilationCycle(lung){
		// Attente d'un declecnchement

		this.Fmax = 0;
		this.Pao = this.PEEP;
		while (lung.flow < this.Ftrig && this.time <= this.simulationStop){
			lung.appliquer_pression(this.PEEP, this.Tsampl);
			//this.timeData.push(sv.log(lung, this));
			this.log(lung);
			this.time += this.Tsampl;
		}

		// Phase inspiratoire
		this.Pao = this.Passist + this.PEEP;
		while (lung.flow > this.Fstop && this.time <= this.simulationStop){
			lung.appliquer_pression(this.Pao, this.Tsampl);
			//this.timeData.push(sv.log(lung, this));
			this.log(lung);
			this.time += this.Tsampl;

			if (lung.flow > this.Fmax) {this.Fmax = lung.flow;}
		}
		lung.appliquer_pression(this.PEEP, this.Tsampl)
	}

	get Fstop(){return this.Fmax * this.Cycling / 100;}

}

class Controler extends Ventilator{
	static ventParams = [
		{id: 'PEEP', init: 5, unit: 'hPa'},
		{id: 'Ti', init: 1, unit: 's'},
		{id: 'Fconv', init: 12, unit: '/min'},
	];
	constructor (params) {
		super(params);
		this.parseDefaultsList(Controler.ventParams);
	}

	get Tcycle() { return 60 / this.Fconv; }
	get Te() { return this.Tcycle - this.Ti; }

	ventilationCycle(lung){
		// Inspiration
		for(
			var tStop = this.time + this.Ti; 
			this.time < tStop && this.time <= this.simulationStop;
			this.time += this.Tsampl
		){
			this.applyControledParameter(lung);
			this.log(lung);
		}

		// Expiration
		this.Pao = this.PEEP
		for(
			var tStop = this.time + this.Te;
			this.time < tStop && this.time <= this.simulationStop;
			this.time += this.Tsampl
		){
			lung.appliquer_pression(this.Pao, this.Tsampl)
			this.log(lung);
		}
	}
}

/**
 * Time trigered, pressure controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

export class PressureControler extends Controler {
	
	static ventParams = [
		...Controler.ventParams,
		{id: 'Pinspi', init: 10, unit: 'hPa'},
	];

	constructor(params){
		super(params);
		this.parseDefaultsList(PressureControler.ventParams);
	}

	applyControledParameter (lung) {
		this.Pao = this.Pinspi + this.PEEP;
		lung.appliquer_pression(this.Pao, this.Tsampl);
	}

};

/**
 * Time trigered, flow controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

export class FlowControler extends Controler{
	
	static ventParams = [
		...Controler.ventParams,
		{id: 'Vt', init: 0.5, unit: 'l'},
	];

	constructor(params){
		super(params);
		this.parseDefaultsList(FlowControler.ventParams);
	}

	get Flow(){return this.Vt / this.Ti;}

	applyControledParameter (lung) {
			lung.appliquer_debit(this.Flow, this.Tsampl);
			this.Pao = lung.Palv + (this.Flow * lung.Raw);
	}

}

/**
 * Quasi-static (low flow), stepwise, pressure - volume loop maneuver
 * @extends sv.Ventilator
 */

export class PVCurve extends Ventilator{

	static ventParams = [
		{id: 'Pstart', init: 0,   unit: "cmH₂O"},
		{id: 'Pmax',   init: 100, unit: "cmH₂O"},
		{id: 'Pstop',  init: 0,   unit: "cmH₂O"},
		{id: 'Pstep',  init: 2,   unit: "cmH₂O"},
		{id: 'Tman',   init: 20,  unit: "s"}
	];
	constructor() {
		super();
		this.parseDefaultsList(PVCurve.ventParams);
	}

	ventilate (lung){

		this.timeData = [];
		var respd = [];

		this.time = 0.0;
		this.nbStep = ((this.Pmax - this.Pstart)+(this.Pmax - this.Pstop)) /this.Pstep
		this.Ti = this.Tman / this.nbStep
		this.Pao = this.Pstart

		while(this.Pao < this.Pmax){

			var tdeb = this.time;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				//timeData.push(sv.log(lung, this));
				this.log(lung);
				this.time += this.Tsampl;
			}

			this.Pao += this.Pstep;
		}

		while(this.Pao >= this.Pstop){

			var tdeb = this.time;

			while(this.time < (tdeb + this.Ti)){
				lung.appliquer_pression(this.Pao, this.Tsampl)
				this.log(lung);
				this.time += this.Tsampl;
			}

			this.Pao -= this.Pstep;
		}

		return {
			timeData: this.timeData,
			respd:respd
		};
	}

};

function phasitron(Fip, Pao){
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

export class IPV extends Ventilator{

	static simParams = [
		{id: 'Rexp', init: 1, unit: 'hPa/l/s'},
		{id: 'lppe', init: 4, unit: ''},
		{id: 'lpip', init: 6, unit: ''},
		{id: 'lpop', init: 1, unit: ''},
	];

	static ventParams = [
		{id: 'Fperc', init: 500, unit: '/min'},
		{id: 'Fhz',  unit: "hz", calculated: true},
		{id: 'Rit',   init: .5,  unit: ''},
		{id: 'Fipc',  init: .18, unit: 'l/s'},
	];

	static variables = [
		{id: 'Fop', init: 0}, //Phasitron output flow
		{id: 'Fip', init: 0}, //Phasitron output flow
		{id: 'Pao', init: 0}, //Presure at the ariway openning (phasitron output)
	];

	constructor(){
		super();
		this.parseDefaultsList(IPV.simParams);
		this.parseDefaultsList(IPV.ventParams);
		this.parseDefaultsList(IPV.variables);
	}

	get Fhz(){return this.Fperc / 60;}
	get Tip(){return (60/this.Fperc)*this.Rit;}
	get Tep(){return (60/this.Fperc)-this.Tip;}

	calcFop(){return this.Fop + (phasitron(this.Fip, this.Pao) - this.Fop)/this.lpop;}

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
			this.log(lung);
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
			this.Fop = this.calcFop();
			lung.appliquer_debit(this.Fop, this.Tsampl);
			
			this.log(lung);
			this.time += this.Tsampl;
		}
	}
		
	ventilationCycle(lung){
		this.percussiveInspiration(lung, this.Fipc);
		this.percussiveExpiration(lung, this.Rexp);
	}

};

export class VDR extends IPV{

	static ventParams = [
		...IPV.ventParams,
		{id: 'Tic',   init: 2,   unit: 's'},
		{id: 'Tec',   init: 2,   unit: 's'},
		{id: 'Fconv', calculated: true , unit: '/min'},
		{id: 'Fipl',  init: .18, unit: 'l/s'},
		{id: 'Fiph',  init: 1.8, unit: 'l/s'},
		{id: 'CPR',   init: 0,   unit: ''},
	];

	constructor(){
		super();
		this.parseDefaultsList(VDR.ventParams);
		this.CycleC=0;
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
