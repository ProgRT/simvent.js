"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var sv = {};

//****************************
// Helper fumctions
//****************************

sv.translate = function (toTranslate, form, lang) {
	try {
		var translated = dict[toTranslate][form][lang];
	} catch (e) {
		console.log("Was unable to translate " + toTranslate);
	} finally {
		return translated;
	}
};

/**
 * Allo
 * @function
 */
sv.log = function (lung, vent) {
	return {
		// Lung variables

		time: vent.time,
		Flung: lung.flow,
		Palv: lung.Palv,
		Pel: lung.Pel,
		Pmus: lung.Pmus,
		Vabs: lung.Vabs,
		Vti: lung.Vti,
		Vte: lung.Vte,
		Vt: lung.Vt,
		Vtmax: lung.Vtmax,
		PCO2: lung.PCO2,
		SCO2: lung.SCO2,
		VCO2: lung.VtCO2,

		// Ventilator variables

		Pao: vent.Pao,
		Fip: vent.Fip,
		Fop: vent.Fop,
		stateP: vent.stateP
	};
};

sv.logPerc = function (lung, vent) {
	return {
		time: vent.time,
		Vtip: lung.Vtip,
		Vtep: lung.Vtep
	};
};

sv.sygY = function (x, ymin, ymax, xid, kid) {
	return ymin + (ymax - ymin) / (1.0 + Math.exp(-(x - xid) / kid));
};

sv.sygX = function (y, ymin, ymax, xid, kid) {
	return xid - kid * Math.log((ymax - ymin) / (y - ymin) - 1);
};

sv.avg = function (dataset, data, Nroll) {

	for (var i = 0; i < dataset.length - (Nroll - 1); i++) {

		var curent = i;
		var avged = dataset[curent][data];

		for (var i2 = curent + 1; i2 < curent + Nroll; i2++) {
			avged += dataset[i2][data];
		}

		dataset[curent][data] = avged / Nroll;
	}
};

sv.defaultsTable = function (obj) {
	var target = document.scripts[document.scripts.length - 1].parentNode;
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

	for (var id in obj) {
		var param = obj[id];
		if (param.calculated != true) {
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

sv.download = function (objArray) {
	var array = (typeof objArray === "undefined" ? "undefined" : _typeof(objArray)) != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	var line = '';
	for (var index in array[0]) {
		if (line != '') line += '\t ';

		line += index;
	}

	str += line + '\r\n';
	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += '\t ';

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	var link = document.createElement('a');
	link.download = 'simvent.dat';
	link.href = 'data:text/tsv;charset=utf-8,' + escape(str);
	document.body.appendChild(link);
	setTimeout(function () {
		link.click();
		document.body.removeChild(link);
	}, 66);
};

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

sv.Lung = function () {
	function Lung() {
		_classCallCheck(this, Lung);

		this.defaults = {
			Tsampl: 0.001,
			Raw: 5,
			// Gaz exchange parameters
			Vdaw: 0.1,
			PiCO2: 0.0,
			PACO2: 35.0,
			Slope2: 0.003,
			Slope3: 5,
			// Variable parameters
			Vti: 0,
			Vte: 0,
			Vtmax: 0,
			PCO2: 0,
			Vabs: 0
		};

		this.parseDefaults();
	}

	_createClass(Lung, [{
		key: "parseDefaults",
		value: function parseDefaults() {
			for (var p in this.defaults) {
				this[p] = this.defaults[p];
			}
		}
	}, {
		key: "appliquer_pression",


		/**
   * Simulate a pressure being applied to airway openning of the lung
   * @param {number} pressure The pressure (in cmH₂O) applied
   * @param {number} duration The time (in secconds) for which
   * the pressure is applied
   */

		value: function appliquer_pression(pression, duree) {

			var time = 0.0;
			var deltaVolume = 0.0;

			while (time < duree) {
				var deltaP = pression - this.Palv;
				var flow = deltaP / this.Raw;
				//this.flow = deltaP / this.Raw;
				this.appliquer_debit(flow, this.Tsampl);

				time += this.Tsampl;
			}
		}
	}, {
		key: "appliquer_debit",
		value: function appliquer_debit(flow, duration) {

			if (isNaN(flow)) {
				throw "sv.SimpleLung.appliquer_debit: NaN value passed as flow";
			}

			this.flow = flow; // l/s
			var deltaVolume = this.flow * duration; // l
			this.Vabs += deltaVolume; // l
			// this.Vti += deltaVolume;

			if (this.flow > 0) {
				// We are inhaling

				this.Vti += deltaVolume;
				this.Vtmax = this.Vti;
				this.PCO2 = 0;
				this.Vte = 0;
				this.VtCO2 = 0;
			} else {
				this.Vti = 0;
				this.Vte -= deltaVolume;
				this.updateCO2();
				this.VtCO2 += this.SCO2 * -deltaVolume;
			}
			this.time += duration;
		}
	}, {
		key: "updateCO2",
		value: function updateCO2() {
			var co2 = sv.sygY(this.Vte, this.PiCO2, this.PplCO2, this.Vdaw, this.Slope2);

			if (this.Vte > this.Vdaw) {
				co2 += this.Slope3 * (this.Vte - this.Vdaw);
			}

			this.PCO2 = co2;
		}
	}, {
		key: "complianceCurve",
		value: function complianceCurve() {
			var vent = new sv.PVCurve();
			var data = vent.ventilate(this).timeData;
			var idsvg = "svg" + document.querySelectorAll("svg").length;
			document.write("<svg id='" + idsvg + "'></svg>");
			function fx(d) {
				return d.Pel;
			}
			function fy(d) {
				return d.Vabs;
			}
			var graph = new gs.graph("#" + idsvg);
			graph.setscale(data, fx, fy);
			graph.tracer(data, fx, fy);
			graph.setidx("Elastic recoil pressure (cmH₂O)");
			graph.setidy("Volume (l)");
		}
	}, {
		key: "defaultsTable",
		value: function defaultsTable() {
			sv.defaultsTable.call(this, this.mechParams);
		}
	}, {
		key: "Palv",
		get: function get() {
			return this.Pel - this.Pmus;
		}
	}, {
		key: "Vt",
		get: function get() {
			return this.Vtmax - this.Vte;
		}
	}, {
		key: "SCO2",
		get: function get() {
			return this.PCO2 / (760 - 47);
		}
	}, {
		key: "VcAlv",
		get: function get() {
			return this.Vtmax - this.Vdaw;
		}
	}, {
		key: "PplCO2",
		get: function get() {
			return this.PACO2 - this.Slope3 * (this.VcAlv / 2);
		}
	}]);

	return Lung;
}();

/** 
 * Basic lung model with linear compliance.
 * @extends sv.Lung
 */

sv.SimpleLung = function (_sv$Lung) {
	_inherits(SimpleLung, _sv$Lung);

	function SimpleLung(params) {
		_classCallCheck(this, SimpleLung);

		var _this = _possibleConstructorReturn(this, (SimpleLung.__proto__ || Object.getPrototypeOf(SimpleLung)).call(this));

		_this.defaults = {
			Crs: 50.0, // ml/cmH2O
			Pmus: 0, // cmH2O/l/s
			Vfrc: 2.5
		};

		_this.parseDefaults();
		_this.Vabs = _this.Vfrc;
		_this.mechParams = {
			Crs: { unit: "ml/cmH₂O" },
			Raw: { unit: "cmH₂O/l/s" }
		};

		return _this;
	}

	_createClass(SimpleLung, [{
		key: "Pel",
		get: function get() {
			return 1000 * (this.Vabs - this.Vfrc) / this.Crs;
		}
	}]);

	return SimpleLung;
}(sv.Lung);

/** 
 * Lung model with linear compliance and spontaneous breathing.
 * @extends sv.Lung
 */

sv.SptLung = function (_sv$Lung2) {
	_inherits(SptLung, _sv$Lung2);

	function SptLung() {
		_classCallCheck(this, SptLung);

		var _this2 = _possibleConstructorReturn(this, (SptLung.__proto__ || Object.getPrototypeOf(SptLung)).call(this));

		_this2.defaults = {
			Crs: 50.0, // ml/cmH2O
			Fspt: 14.0, // c/min
			Ti: 1, // sec
			Pmax: 6.5, // cmH20
			Vabs: 0, // Have to be initialised
			time: 0 // Have to be initialised
		};

		_this2.parseDefaults();
		_this2.mechParams = {
			Crs: { unit: "ml/cmH₂O" },
			Raw: { unit: "cmH₂O/l/s" },
			Fspt: { unit: "/min." },
			Ti: { unit: "sec." },
			Pmax: { unit: "cmH₂O" }
		};
		return _this2;
	}

	_createClass(SptLung, [{
		key: "Pmus",
		get: function get() {
			var mTime = this.time % (60.0 / this.Fspt);

			if (mTime < 2 * this.Ti && this.Fspt > 0) {
				return 0.5 * this.Pmax * (1 + Math.sin(2 * Math.PI * (mTime / (2 * this.Ti)) - Math.PI / 2));
			} else {
				return 0;
			}
		}
	}, {
		key: "Pel",
		get: function get() {
			return 1000 * this.Vabs / this.Crs;
		}
	}]);

	return SptLung;
}(sv.Lung);

/** 
 * Lung model with sygmoïd complianceg
 * @extends sv.Lung
 */

sv.SygLung = function (_sv$Lung3) {
	_inherits(SygLung, _sv$Lung3);

	function SygLung() {
		_classCallCheck(this, SygLung);

		var _this3 = _possibleConstructorReturn(this, (SygLung.__proto__ || Object.getPrototypeOf(SygLung)).call(this));

		_this3.defaults = {
			// Mechanical parameters
			Vmax: 4.0,
			Vmin: 0.0,
			Pid: 5.0,
			Kid: 20.0,
			Pmus: 0
		};

		_this3.parseDefaults();

		_this3.mechParams = {
			Vmax: { unit: "l" },
			Vmin: { unit: "l" },
			Pid: { unit: "cmH₂O" },
			Kid: { unit: "cmH₂O" },
			Raw: { unit: "cmH₂O/l/s" }
		};

		_this3.flow = 0.0;
		_this3.Vabs = _this3.volume(0);
		return _this3;
	}

	_createClass(SygLung, [{
		key: "volume",
		value: function volume(P) {
			return sv.sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
		}
	}, {
		key: "Pel",
		get: function get() {
			return sv.sygX(this.Vabs, this.Vmin, this.Vmax, this.Pid, this.Kid);
		}
	}]);

	return SygLung;
}(sv.Lung);

/** 
 * Lung model with sygmoïd pressure - volume relation and inspiratory - expiratory histeresis.
 * @extends sv.Lung
 */

sv.RLung = function (_sv$Lung4) {
	_inherits(RLung, _sv$Lung4);

	function RLung() {
		_classCallCheck(this, RLung);

		var _this4 = _possibleConstructorReturn(this, (RLung.__proto__ || Object.getPrototypeOf(RLung)).call(this));

		_this4.defaults = {
			// Mechanical parameters
			Vmax: 4.0,
			Vmin: 0.0,
			Pid: 20,
			Kid: 20.0,
			Phister: 20,

			flow: 0.0,
			lastFlow: 0.0,
			Pmus: 0,
			Vtmax: 0,
			lastPel: 0
		};

		_this4.parseDefaults();

		_this4.VmaxExp = _this4.Vmax;
		_this4.VminInsp = _this4.Vmin;
		_this4.Vabs = _this4.volume(0);
		//console.log('Palv = ' + this.Palv);
		//console.log('Palv = ' + this.Palv);
		_this4.fitInsp();
		//console.log('Palv = ' + this.Palv);
		_this4.fitExp();
		_this4.appliquer_pression(1, 3);
		_this4.appliquer_pression(-1, 3);
		_this4.appliquer_pression(1, 3);
		_this4.appliquer_pression(-1, 3);
		//console.log('Palv = ' + this.Palv);
		//console.log('VminInsp = ' + this.VminInsp);
		//console.log('VmaxExp = ' + this.VmaxExp);

		_this4.mechParams = {
			Vmax: { unit: "l" },
			Vmin: { unit: "l" },
			PidInsp: { unit: "cmH₂O" },
			PidExp: { unit: "cmH₂O" },
			Kid: { unit: "cmH₂O" },
			Raw: { unit: "cmH₂O/l/s" }
		};
		return _this4;
	}

	_createClass(RLung, [{
		key: "volume",
		value: function volume(P) {
			return sv.sygY(P, this.Vmin, this.Vmax, this.Pid, this.Kid);
		}
	}, {
		key: "fitInsp",
		value: function fitInsp() {
			//console.log('fitInsp');
			var N = 1 + Math.pow(Math.E, -((this.lastPel - this.PidInsp) / this.Kid));
			this.VminInsp = (N * this.Vabs - this.Vmax) / (N - 1);
		}
	}, {
		key: "fitExp",
		value: function fitExp() {
			//console.log('fitExp');
			var N = 1 + Math.pow(Math.E, -((this.lastPel - this.PidExp) / this.Kid));
			this.VmaxExp = this.Vmin + (this.Vabs - this.Vmin) * N;
		}
	}, {
		key: "fit",
		value: function fit() {
			if (this.flow > 0 && this.lastFlow < 0) {
				this.fitInsp();
			} else if (this.flow < 0 && this.lastFlow > 0) {
				// We were inhaling and and are now exhaling
				this.fitExp();
			}

			this.lastFlow = this.flow;
		}
	}, {
		key: "Pel",
		get: function get() {
			this.fit();

			if (this.flow >= 0) {
				var p = sv.sygX(this.Vabs, this.VminInsp, this.Vmax, this.PidInsp, this.Kid);
				this.lastPel = p;
				return p;
			} else /*if (this.flow < 0)*/{
					var p = sv.sygX(this.Vabs, this.Vmin, this.VmaxExp, this.PidExp, this.Kid);
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
	}, {
		key: "PidInsp",
		get: function get() {
			return this.Pid + this.Phister / 2;
		}
	}, {
		key: "PidExp",
		get: function get() {
			return this.Pid - this.Phister / 2;
		}
	}]);

	return RLung;
}(sv.Lung);

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

sv.Ventilator = function () {
	function Ventilator() {
		_classCallCheck(this, Ventilator);

		this.time = 0;

		/**
   * Duration of the simulation in seconds
   * @type {number}
   */

		this.Tvent = 12;

		/** 
   * Time in seconds between each iteration. 
   * Higher value will result in faster simulation. 
   * Lower values will result in more accurate simulation. 
   * @type {number}
   * */

		this.Tsampl = 0.003;

		this.demoLung = sv.SimpleLung;

		this.simParams = {
			Tsampl: { unit: "s" },
			Tvent: { uni: "s" }
		};
	}

	_createClass(Ventilator, [{
		key: "updateCalcParams",
		value: function updateCalcParams() {
			console.log("updateCalcParams is deprecated");
		}

		/**
   * Ventilate a lung object by applying **ventilationCycle** algorythm for **Tvent** time.
   * @param {LungObject} lung lung object
   * @return {object} ventResult
   */

	}, {
		key: "ventilate",
		value: function ventilate(lung) {

			this.timeData = [];

			for (this.simulationStop = this.time + this.Tvent; this.time <= this.simulationStop;) {
				//console.log("simvent: starting vent cycle");
				this.ventilationCycle(lung);
			}

			if (this.lowPass > 1) {

				for (var index in this.dataToFilter) {
					var id = this.dataToFilter[index];
					var smoothed = this.timeData[0][id];
					for (var jndex = 1, len = this.timeData.length; jndex < len; ++jndex) {
						var currentValue = this.timeData[jndex][id];
						smoothed += (currentValue - smoothed) / this.lowPass;
						this.timeData[jndex][id] = smoothed;
					}
				}
			}

			if (this.rAvg >= 2) {

				for (var index in this.dataToFilter) {
					sv.avg(this.timeData, this.dataToFilter[index], this.rAvg);
				}
			}
			return {
				timeData: this.timeData
			};
		}

		/**
   * Ventilation algorithm. Wille be repeated by the **ventilate** function
   * for the duration of **Tvent**.
   * @virtual
   */

	}, {
		key: "ventilationCycle",
		value: function ventilationCycle() {
			throw "ventilationCycle() must be implemented i high level ventilator model.";
		}
	}, {
		key: "sampleWaveform",
		value: function sampleWaveform() {
			var lung = new this.demoLung();
			var data = this.ventilate(lung).timeData;

			var params = ["Pao"];
			for (var i in params) {
				var fx = function fx(d) {
					return d.time;
				};

				var fy = function fy(d) {
					return d[params[i]];
				};

				var idsvg = "svg" + document.querySelectorAll("svg").length;
				document.write("<svg id='" + idsvg + "' class='ventSample'></svg>");

				var graph = new gs.graph("#" + idsvg);
				graph.setscale(data, fx, fy);
				graph.tracer(data, fx, fy);
				graph.setidx("Time (s)");
				graph.setidy(params[i]);
			}
		}
	}, {
		key: "defaultsTable",
		value: function defaultsTable() {
			sv.defaultsTable.call(this, this.ventParams);
		}
	}]);

	return Ventilator;
}();

/**
 * Flow trigered, pressure controled, flow cycled ventilator.
 * @extends sv.Ventilator
 */

sv.PressureAssistor = function (_sv$Ventilator) {
	_inherits(PressureAssistor, _sv$Ventilator);

	function PressureAssistor() {
		_classCallCheck(this, PressureAssistor);

		/** Inspiratory assistance (in cmH₂O)
   * @member {number} */

		var _this5 = _possibleConstructorReturn(this, (PressureAssistor.__proto__ || Object.getPrototypeOf(PressureAssistor)).call(this));

		_this5.Passist = 12.0;
		_this5.PEEP = 5.0;
		_this5.Cycling = 25;
		_this5.Ftrig = 0.1;
		_this5.demoLung = sv.SptLung;

		_this5.ventParams = {
			Passist: { unit: "cmH₂O" },
			PEEP: { unit: "cmH₂O" },
			Ftrig: { unit: "l/min." },
			Cycling: { unit: "%" }
		};

		return _this5;
	}

	_createClass(PressureAssistor, [{
		key: "ventilationCycle",
		value: function ventilationCycle(lung) {
			// Attente d'un declecnchement

			this.Fmax = 0;
			this.Pao = this.PEEP;
			while (lung.flow < this.Ftrig && this.time <= this.simulationStop) {
				lung.appliquer_pression(this.PEEP, this.Tsampl);
				this.timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}

			// Phase inspiratoire
			this.Pao = this.Passist + this.PEEP;
			while (lung.flow > this.Fstop && this.time <= this.simulationStop) {
				lung.appliquer_pression(this.Passist, this.Tsampl);
				this.timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;

				if (lung.flow > this.Fmax) {
					this.Fmax = lung.flow;
				}
			}
			lung.appliquer_pression(this.PEEP, this.Tsampl);
		}
	}, {
		key: "Fstop",
		get: function get() {
			return this.Fmax * this.Cycling / 100;
		}
	}]);

	return PressureAssistor;
}(sv.Ventilator);

/**
 * Time trigered, pressure controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

sv.PressureControler = function (_sv$Ventilator2) {
	_inherits(PressureControler, _sv$Ventilator2);

	function PressureControler() {
		_classCallCheck(this, PressureControler);

		var _this6 = _possibleConstructorReturn(this, (PressureControler.__proto__ || Object.getPrototypeOf(PressureControler)).call(this));

		_this6.Pinspi = 10.0;
		_this6.PEEP = 5.0;
		_this6.Ti = 1;
		_this6.Fconv = 12;

		_this6.ventParams = {
			Pinspi: { unit: "cmH₂O" },
			PEEP: { unit: "cmH₂O" },
			Fconv: { unit: "/min." },
			Ti: { unit: "cmH₂O" },
			Te: { calculated: true, unit: "sec." },
			Tcycle: { calculated: true, unit: "sec." }
		};
		return _this6;
	}

	_createClass(PressureControler, [{
		key: "ventilationCycle",
		value: function ventilationCycle(lung) {

			var tdeb = this.time;
			var tStop = this.time + this.Ti;

			this.Pao = this.Pinspi + this.PEEP;
			while (this.time < tStop && this.time <= this.simulationStop) {
				lung.appliquer_pression(this.Pao, this.Tsampl);
				this.timeData.push(sv.log(lung, this));

				this.time += this.Tsampl;
			}

			var tStop = this.time + this.Te;
			this.Pao = this.PEEP;
			while (this.time < tStop && this.time <= this.simulationStop) {
				lung.appliquer_pression(this.Pao, this.Tsampl);
				this.timeData.push(sv.log(lung, this));

				this.time += this.Tsampl;
			}
		}
	}, {
		key: "Tcycle",
		get: function get() {
			return 60 / this.Fconv;
		}
	}, {
		key: "Te",
		get: function get() {
			return this.Tcycle - this.Ti;
		}
	}]);

	return PressureControler;
}(sv.Ventilator);

/**
 * Quasi-static (low flow), stepwise, pressure - volume loop maneuver
 * @extends sv.Ventilator
 */

sv.PVCurve = function (_sv$Ventilator3) {
	_inherits(PVCurve, _sv$Ventilator3);

	function PVCurve() {
		_classCallCheck(this, PVCurve);

		//this.Pstart = -100.0;
		var _this7 = _possibleConstructorReturn(this, (PVCurve.__proto__ || Object.getPrototypeOf(PVCurve)).call(this));

		_this7.Pstart = 0;
		_this7.Pmax = 100;
		_this7.Pstop = 0;
		_this7.Pstep = 2;
		_this7.Tman = 20;

		_this7.ventParams = {
			Pstart: { unit: "cmH₂O" },
			Pmax: { unit: "cmH₂O" },
			Pstop: { unit: "cmH₂O" },
			Pstep: { unit: "cmH₂O" },
			Tman: { unit: "s" }
		};
		return _this7;
	}

	_createClass(PVCurve, [{
		key: "ventilate",
		value: function ventilate(lung) {

			var timeData = [];
			var respd = [];

			this.time = 0.0;
			this.nbStep = (this.Pmax - this.Pstart + (this.Pmax - this.Pstop)) / this.Pstep;
			this.Ti = this.Tman / this.nbStep;
			this.Pao = this.Pstart;

			while (this.Pao < this.Pmax) {

				var tdeb = this.time;

				while (this.time < tdeb + this.Ti) {
					lung.appliquer_pression(this.Pao, this.Tsampl);
					timeData.push(sv.log(lung, this));
					this.time += this.Tsampl;
				}

				this.Pao += this.Pstep;
			}

			while (this.Pao >= this.Pstop) {

				var tdeb = this.time;

				while (this.time < tdeb + this.Ti) {
					lung.appliquer_pression(this.Pao, this.Tsampl);
					timeData.push(sv.log(lung, this));
					this.time += this.Tsampl;
				}

				this.Pao -= this.Pstep;
			}

			return {
				timeData: timeData,
				respd: respd
			};
		}
	}]);

	return PVCurve;
}(sv.Ventilator);

sv.Phasitron = {};

sv.Phasitron.Fop = function (Fip, Pao) {
	if (Pao >= 0 && Pao <= 40) {
		return Fip + Fip * (5 - Pao / 8);
	} else if (Pao > 40) {
		return Fip;
	} else if (Pao < 0) {
		return 6 * Fip;
	}
};

/**
 * High frequency ventilator imitating Percussionaire's VDR-4.
 * @extends sv.Ventilator
 */

sv.IPV = function (_sv$Ventilator4) {
	_inherits(IPV, _sv$Ventilator4);

	function IPV() {
		_classCallCheck(this, IPV);

		var _this8 = _possibleConstructorReturn(this, (IPV.__proto__ || Object.getPrototypeOf(IPV)).call(this));

		_this8.Tramp = 0.005;
		_this8.Rexp = 1; // cmH2O/l/s. To be adjusted based on the visual aspect of the curve.
		_this8.rAvg = 2;
		_this8.lowPass = 3;

		_this8.simParams = {
			Tvent: { unit: "s" },
			Tsampl: { unit: "s" },
			Tramp: { unit: "s" },
			Rexp: { unit: "cmH₂O/l/s" },
			rAvg: {},
			lowPass: {}
		};

		_this8.Fperc = 500;
		_this8.Rit = 0.5; //Ratio of inspiratory time over total time (percussion)
		//this.Fipl= 0.18; // 	
		//this.Fiph= 1.8; // 
		//this.CPR = 0;
		_this8.Fipc = 0.18;

		_this8.Fop = 0; //Phasitron output flow
		_this8.Fip = 0; //Phasitron output flow
		_this8.Pao = 0; //Presure at the ariway openning (phasitron output)

		_this8.ventParams = {
			Fperc: { unit: "/min" },
			Fhz: { unit: "hz", calculated: true },
			Rit: {},
			Fipc: { unit: "l/s" }
		};

		_this8.dataToFilter = ["Pao", "Flung"];
		return _this8;
	}

	_createClass(IPV, [{
		key: "percussiveExpiration",
		value: function percussiveExpiration(lung, Rexp) {
			// Must be executed in a scope where the timeData container is defined
			lung.flow = 0;
			this.Fip = 0;
			this.Fop = 0;
			this.stateP = 0;
			lung.Vtep = 0;

			var tStopPerc = this.time + this.Tep;
			while (this.time < tStopPerc) {
				this.Pao = -lung.flow * Rexp;

				var flow = (this.Pao - lung.Palv) / lung.Raw;
				lung.appliquer_debit(flow, this.Tsampl);
				this.timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}
		}
	}, {
		key: "percussiveInspiration",
		value: function percussiveInspiration(lung, inFlow) {
			// Must be executed in a scope where the timeData container is defined
			this.stateP = 1;
			lung.Vtip = 0;
			this.Fip = inFlow;
			var tStartInsp = this.time;
			var tStopPerc = this.time + this.Tip;

			while (this.time < tStopPerc) {

				this.Fip = inFlow;
				this.Pao = this.Fop * lung.Raw + lung.Palv;
				this.Fop = sv.Phasitron.Fop(this.Fip, this.Pao);
				lung.appliquer_debit(this.Fop, this.Tsampl);

				this.timeData.push(sv.log(lung, this));
				this.time += this.Tsampl;
			}
		}
	}, {
		key: "ventilationCycle",
		value: function ventilationCycle(lung) {
			this.percussiveInspiration(lung, this.Fipc);
			this.percussiveExpiration(lung, this.Rexp);
		}
	}, {
		key: "Fhz",
		get: function get() {
			return this.Fperc / 60;
		}
	}, {
		key: "Tip",
		get: function get() {
			return 60 / this.Fperc * this.Rit;
		}
	}, {
		key: "Tep",
		get: function get() {
			return 60 / this.Fperc - this.Tip;
		}
	}]);

	return IPV;
}(sv.Ventilator);

sv.VDR = function (_sv$IPV) {
	_inherits(VDR, _sv$IPV);

	function VDR() {
		_classCallCheck(this, VDR);

		var _this9 = _possibleConstructorReturn(this, (VDR.__proto__ || Object.getPrototypeOf(VDR)).call(this));

		_this9.Tramp = 0.005;
		_this9.Rexp = 1; // cmH2O/l/s. To be adjusted based on the visual aspect of the curve.
		_this9.rAvg = 2;
		_this9.lowPass = 3;

		_this9.simParams = {
			Tvent: { unit: "s" },
			Tsampl: { unit: "s" },
			Tramp: { unit: "s" },
			Rexp: { unit: "cmH₂O/l/s" },
			rAvg: {},
			lowPass: {}
		};

		_this9.Tic = 2; // Convective inspiratory time
		_this9.Tec = 2; // Convective expiratory time
		_this9.Fperc = 500;
		_this9.Rit = 0.5; //Ratio of inspiratory time over total time (percussion)
		_this9.Fipl = 0.18; // 	
		_this9.Fiph = 1.8; // 
		_this9.CPR = 0;

		_this9.Fop = 0; //Phasitron output flow
		_this9.Fip = 0; //Phasitron output flow
		_this9.Pao = 0; //Presure at the ariway openning (phasitron output)
		_this9.CycleC = 0;

		_this9.ventParams = {
			Tic: { unit: "s" },
			Tec: { unit: "s" },
			Fconv: { unit: "s", calculated: true },
			Fperc: { unit: "/min" },
			Fhz: { unit: "hz", calculated: true },
			Rit: {},
			Fiph: { unit: "l/s" },
			Fipl: { unit: "l/s" },
			CPR: {}
		};

		_this9.dataToFilter = ["Pao", "Flung"];
		return _this9;
	}

	_createClass(VDR, [{
		key: "convectiveInspiration",
		// Duration of the convection cycle

		value: function convectiveInspiration(lung) {
			var tStopConv = this.Tcc * Math.ceil(this.time / this.Tcc);
			var tCPR = this.time + 0.8;
			this.CycleC = 1;
			while (this.time < tStopConv && this.time < this.simulationStop) {
				if (this.time < tCPR) {
					var inflow = this.Fiph;
				} else {
					var inflow = this.Fiph * (1 + this.CPR);
				}
				this.percussiveInspiration(lung, inflow);

				if (this.time < tCPR) {
					this.percussiveExpiration(lung, this.Rexp);
				} else {
					this.percussiveExpiration(lung, this.Rexp * (1 + this.CPR));
				}
				//this.percData.push(sv.logPerc(lung, this));
			}
		}
	}, {
		key: "convectiveExpiration",
		value: function convectiveExpiration(lung) {
			var tStopConv = this.Tcc * Math.floor(this.time / this.Tcc) + this.Tec;
			this.CycleC = 0;
			while (this.time < tStopConv && this.time < this.simulationStop) {
				this.percussiveInspiration(lung, this.Fipl);
				this.percussiveExpiration(lung, this.Rexp);
				//this.percData.push(sv.logPerc(lung, this));
			}
		}
	}, {
		key: "ventilationCycle",
		value: function ventilationCycle(lung) {
			this.convectiveExpiration(lung);
			this.convectiveInspiration(lung);
		}
	}, {
		key: "Fconv",
		get: function get() {
			return 60 / (this.Tic + this.Tec);
		}
	}, {
		key: "Tcc",
		get: function get() {
			return this.Tic + this.Tec;
		}
	}]);

	return VDR;
}(sv.IPV);

/**
 * Time trigered, flow controled, time cycled ventilator.
 * @extends sv.Ventilator
 */

sv.FlowControler = function (_sv$Ventilator5) {
	_inherits(FlowControler, _sv$Ventilator5);

	function FlowControler() {
		_classCallCheck(this, FlowControler);

		var _this10 = _possibleConstructorReturn(this, (FlowControler.__proto__ || Object.getPrototypeOf(FlowControler)).call(this));

		_this10.Vt = 0.5;
		_this10.PEEP = 5.0;
		_this10.Ti = 1;
		_this10.Fconv = 18;

		_this10.ventParams = {
			Vt: { unit: "l", step: 0.01 },
			PEEP: { unit: "cmH₂O" },
			Fconv: { unit: "/min." },
			Ti: { unit: "cmH₂O" },
			Te: { calculated: true, unit: "sec." },
			Tcycle: { calculated: true, unit: "sec." }
		};
		return _this10;
	}

	_createClass(FlowControler, [{
		key: "ventilationCycle",
		value: function ventilationCycle(lung) {

			for (var tStop = this.time + this.Ti; this.time < tStop && this.time <= this.simulationStop; this.time += this.Tsampl) {
				lung.appliquer_debit(this.Flow, this.Tsampl);
				this.Pao = lung.Palv + this.Flow * lung.Raw;
				this.timeData.push(sv.log(lung, this));
			}

			this.Pao = this.PEEP;
			for (var tStop = this.time + this.Te; this.time < tStop && this.time <= this.simulationStop; this.time += this.Tsampl) {
				lung.appliquer_pression(this.Pao, this.Tsampl);
				this.timeData.push(sv.log(lung, this));
			}

			//var pmeco2 = ((760-47) * lung.veco2/lung.vce);
		}
	}, {
		key: "Tcycle",
		get: function get() {
			return 60 / this.Fconv;
		}
	}, {
		key: "Te",
		get: function get() {
			return 60 / this.Fconv - this.Ti;
		}
	}, {
		key: "Flow",
		get: function get() {
			return this.Vt / this.Ti;
		}
	}]);

	return FlowControler;
}(sv.Ventilator);

sv.Protocol = function () {
	function Protocol() {
		_classCallCheck(this, Protocol);
	}

	_createClass(Protocol, [{
		key: "ventilate",
		value: function ventilate(lung) {}
	}]);

	return Protocol;
}();

sv.ventilators = [sv.PressureControler, sv.FlowControler, sv.PressureAssistor, sv.VDR, sv.PVCurve];

sv.lungs = [sv.SimpleLung, sv.SptLung, sv.SygLung, sv.RLung];
