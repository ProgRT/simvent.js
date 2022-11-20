//******************************
//	Ventilator models
//******************************

/**
 * @module simvent-ventilators
 */

/**
 * Base ventilator class uppon wich ventilator models are built
 */

class Ventilator{

	constructor(params) {

		this.time = 0;

		/**
		 * Duration of the simulation in seconds
		 * @type {number}
		 */

		//this.Tvent = 12;
		this.Tvent = 0

		/** 
		 * Time in seconds between each iteration. 
		 * Higher value will result in faster simulation. 
		 * Lower values will result in more accurate simulation. 
		 * @type {number}
		 * */

		//this.Tsampl = 0.003;
		this.Tsampl = 0;

		this.simParams = {
			Tsampl:{unit: "s", init: .003},/** Will this comment be parsed ? **/
			Tvent: {unit: "s", init: 12},
		};

		if(typeof params != 'undefined'){
			for(const index in this.simParams){
				this[index] = typeof params[index] != 'undefined' ? param[index] : this.simParams[index].init;
			}
		}	
		else{
			for(const index in this.simParams){
				this[index] = this.simParams[index].init;
			}
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
		sv.defaultsTable.call(this,this.ventParams);
	}
};

/**
 * Flow trigered, pressure controled, flow cycled ventilator.
 * @extends sv.Ventilator
 */

export class PressureAssistor extends Ventilator{

	constructor() {
		super();

		/** Inspiratory assistance (in cmH₂O)
		 * @member {number} */

		this.Passist = 12.0;
		this.PEEP = 5.0;
		this.Cycling = 25;
		this.Ftrig = 0.1;

		//this.demoLung = SptLung;

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
	constructor (params) {
		super(params);

		//this.ventParams = {
		//	PEEP:{unit: "cmH₂O", init: 5},
		//	Ti:{unit:"s", init: 1},
		//	Fconv:{unit: "/min", init: 12},
		//};

		this.ventParams = {};
		this.ventParams['PEEP'] = {unit: "cmH₂O", init: 5};
		this.ventParams['Ti'] = {unit:"s", init: 1};
		this.ventParams['Fconv'] = {unit: "/min", init: 12};


		if(typeof params != 'undefined'){
			for(const key in this.ventParams){
				this[key] = key in params ? params[key] : this.ventParams[key].init;
			}
		}
		else{
			for(const key in this.ventParams){
				this[key] = this.ventParams[key].init;
			}
		}
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
			//this.timeData.push(sv.log(lung, this));
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
	
	constructor(params){
		super(params);

		this.Pinspi = 10.0;

		this.ventParams = {
			Pinspi:{unit: "cmH₂O"},
			PEEP:{unit: "cmH₂O"},
			Fconv:{unit:"/min."},
			Ti:{unit: "cmH₂O"},
			Te:{calculated: true, unit: "sec."},
			Tcycle:{calculated: true, unit: "sec."}
		};
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
	
	constructor(params){
		super(params);

		this.Vt = 0.5;
		this.ventParams['Vt']={unit: "l", step:0.01};
		this.ventParams['Te']={calculated: true, unit: "sec."};
		this.ventParams['Tcycle']={calculated: true, unit: "sec."};
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

/*

logPerc = function(lung, vent){
	return {
		time: vent.time,
		Vtip: lung.Vtip,
		Vtep: lung.Vtep
	};
}
*/

export class IPV extends Ventilator{

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
		this.Pao=0; //Presure at the ariway openning (phasitron output)

		this.ventParams = {
			Fperc: {unit: "/min"},
			Fhz: {unit: "hz", calculated: true},
			Rit: {},
			Fipc: {unit: "l/s"}
		};

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
