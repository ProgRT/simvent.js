import * as simventLungs from "./simvent-lungs.js";
import * as simventVentilators from "./simvent-ventilators.js";
import {graph} from "./moovingGraph.js";

export class simulator {

	constructor(){
		this.debugMode = false;
		this.ventBufferFactor = 2;
		this.Tsampl = 20;
		this.ventTsampl = 0.005;
		this.ventLoopInt = 5;
		this.graphLoopInt = 5;
		this.target = d3.select(document.body);

		this.datasets = [
			{name: 'Pao'},
			{name: 'Flung'},
			{name: 'PCO2'}
		];

		this.ventList = [
			'FlowControler',
			'PressureControler',
			'PressureAssistor',
			'IPV',
			'VDR'
		];

		this.lungList = [
			'SimpleLung',
			'SptLung',
			'SygLung',
			'RLung'
		];

		this.timePerScreen = 12;
		this.graphData = [];
		this.data = [];
		this.graphData = [];
		this.graphStack = [];
		this.tStart = 0;

		this.lung = new simventLungs.SimpleLung();
		this.vent = new simventVentilators.FlowControler();	

		this.ventUpdate();

	}

	panelTitle(content){
		if(!this.panelDiv){throw 'sim class: non panelDiv'}
		var title = document.createElement("h2");
		title.textContent = content;
		title.classList.add("fpPanelTitle");
		title.classList.add(content.toLowerCase());
		this.panelDiv.appendChild(title);
	}

	lungMenu(){
		this.lungSelect = document.createElement("select");
		this.lungSelect.id = "lungSelect";
		this.lungSelect.onchange = ()=>this.lungChange();
		this.panelDiv.appendChild(this.lungSelect);

		for (var lung of this.lungList){
			var option = document.createElement("option");
			option.value = lung;
			option.textContent = lung;
			this.lungSelect.appendChild(option);
		}
		this.lungSelect.selectedIndex = this.lungList.indexOf(this.lung.constructor.name);
	}

	ventMenu(){
		this.ventSelect = document.createElement("select");
		this.ventSelect.id = "ventSelect";
		this.ventSelect.onchange = ()=>this.ventChange();
		this.panelDiv.appendChild(this.ventSelect);

		for (var vent of this.ventList){
			var option = document.createElement("option");
			option.value = vent;
			option.textContent = vent;
			this.ventSelect.appendChild(option);
		}
		this.ventSelect.selectedIndex = this.ventList.indexOf(this.vent.constructor.name);
	}

	ventChange(){
		this.nextVent = new simventVentilators[this.ventList[this.ventSelect.selectedIndex]]();
		this.nextVent.time = this.vent.time;
		this.vent = this.nextVent;
		this.ventUpdate();
		this.fillParamTable(this.vent, 'ventParams', this.ventTable);
	}

	lungChange(){
		this.lung = new simventLungs[this.lungList[this.lungSelect.selectedIndex]]();
		this.fillParamTable(this.lung, 'mechParams', this.lungTable);
	}

	initPanel(){

		this.panelDiv = document.createElement('div');
		this.panelDiv.id = 'fpPanel';
		this.panelDiv.classList.add('hidden');
		document.body.appendChild(this.panelDiv);

		this.panelTitle('Ventilateur');
		this.ventMenu();
		this.ventTable = document.createElement('table');
		this.panelDiv.appendChild(this.ventTable);
		this.fillParamTable(this.vent, 'ventParams', this.ventTable);

		this.panelTitle('Poumon');
		this.lungMenu();
		this.lungTable = document.createElement('table');
		this.panelDiv.appendChild(this.lungTable);
		this.fillParamTable(this.lung, 'mechParams', this.lungTable);

		if(this.debugMode == true){
			this.panelTitle('Monitorage');
			var text = document.createTextNode('Temps en réserve: ');
			this.panelDiv.append(text);
			this.spanDataMon = document.createElement('span');
			this.panelDiv.append(this.spanDataMon);
			var text = document.createTextNode('s');
			this.panelDiv.append(text);
		}

		if(this.displaySimParams == true){
			this.panelTitle('Simulation');
			this.simTable = document.createElement('table');
			this.panelDiv.appendChild(this.simTable);
			this.fillParamTable(this.vent, 'simParams', this.simTable);
		}

		this.buttonValidate = document.createElement('button');
		this.buttonValidate.textContent = 'Valider';
		this.buttonValidate.onclick = ()=>this.validate();
		this.buttonValidate.disabled = true;
		this.panelDiv.appendChild(this.buttonValidate);

	}

	fillParamTable(object, paramSet, table){

		while(table.hasChildNodes()){table.removeChild(table.firstChild)}

		for(var p of object.__proto__.constructor[paramSet]){
			var tr = document.createElement('tr');
			table.appendChild(tr);

			// Parameter name cell

			var td = document.createElement('td');
			//td.title = fp.translate1(id, "long");
			td.title = p.id;
			td.textContent = p.id + ' :';
			tr.appendChild(td);

			// input or value cell

			var td = document.createElement('td');
			td.className = 'data';

			if (p.calculated == true){
				var value = Math.round(10 * this.vent[p.id])/10;
				var dataSpan = document.createElement('span');
				dataSpan.id = 'data' + p.id;
				dataSpan.textContent = value;
				td.appendChild(dataSpan);
			}
			else{
				var input = document.createElement('input');
				input.id = 'input' + p.id;
				input.name = p.id;
				input.value = object[p.id];
				input.type = 'number';
				input.onfocus = function(){this.select()};
				input.onchange = (evt)=>{
					object[evt.target.name] = parseFloat(evt.target.value);
					if(object.ventParams){
						for(var param in object.ventParams){
							if(object.ventParams[param].calculated == true){
								document.querySelector('#data' + param).textContent = Math.round(10 * object[param])/10;
							}
						}
					}
					this.ventUpdate();
					this.buttonValidate.disabled = false;
				};
				input.onkeyup = (evt)=>{
					this.buttonValidate.disabled = false;
				};
				td.appendChild(input);
			}
			tr.appendChild(td);

			// Parameter unit cell

			var td = document.createElement('td');
			td.className = 'unit';
			td.textContent = p.unit;
			tr.appendChild(td);

			// Push the row to the table

			table.appendChild(tr);
		}
	} 

	ventUpdate(){
		if(this.vent.Fconv){this.vent.Tvent = 60 / this.vent.Fconv};
		this.vent.Tsampl = this.ventTsampl;
		this.pointsPerMilliseconds = .001 / this.vent.Tsampl
		this.pointsPerScreen = this.timePerScreen / this.vent.Tsampl;
	}

	setYscale(){
		var dataSet = this.data.concat(this.graphData);

		for(const g of this.graphStack){
			// Tentative de débugage
			if(dataSet.length == 0){
				this.stop();
				throw new Error("Plus de données disponible");
			}
			g.setYscale(dataSet);
			g.drawGradY();
			g.drawGradX();
			g.setNLf();
		}
	}

	redraw(){
		var scalingData = this.data.concat(this.graphData);
		// Tentative de débugage
		if(scalingData.length == 0){
			this.stop();
			throw new Error("Plus de données disponible");
		}

		for(var g of this.graphStack){
			g.redraw(scalingData, this.graphData);
		}
	}

	ventLoop(){
		if(this.spanDataMon){
			this.spanDataMon.textContent = Math.round(this.data.length * this.vent.Tsampl * 10 )/10;
		}

		if(this.data.length * this.vent.Tsampl * 1000 <= this.ventLoopInt){
			this.ventilate();
		}
	}

	ventilate(){
		var newDat = this.vent.ventilate(this.lung).timeData;
		this.data = this.data.concat(newDat);
	}

	validate(){
		document.activeElement.blur();
		this.buttonValidate.disabled = true;
	}

	graphLoop(){
		if(!this.data){
			this.stop();
			throw new Error('Dooo, this is not supposed to hapen !!!.');
		}

		if(this.data.length == 0){
			this.stop();
			throw new Error('Stoped; no more data to plot.');

		}

		//if(this.graphData.length >= this.pointsPerScreen){
		// Essayon avec un facteur de sécurité
		if(this.graphData.length >= this.pointsPerScreen * 1.1){

			if(this.debugMode == true){
				this.loopEndTime = new Date().getTime();
				this.loopDuration = this.loopEndTime - this.loopStartTime;
				console.log(this.timePerScreen + 's plotted in ' +  this.loopDuration/1000 +'s');
			}

			this.loopStartTime = new Date().getTime();

			this.setYscale();

			this.tStart = this.data[0].time;
			for(const g of this.graphStack){
				g.tStart = this.tStart;
				g.coord = '';
			}
			this.graphData = [];
		}

		this.timeInLoop = new Date().getTime() - this.loopStartTime;
		//if(this.debugMode == true){console.log('Time in loop: ' + this.timeInLoop)}
		this.targetNumPoints = Math.floor(this.timeInLoop * this.pointsPerMilliseconds);
		while(this.graphData.length < this.targetNumPoints){
			//if(this.debugMode == true){console.log('graphdata.length: ' + this.graphData.length)}
			//if(this.debugMode == true){console.log('Target num points: ' + this.targetNumPoints)}
			this.graphData.push(this.data.shift());
			for(var gr of this.graphStack){
				if(gr.coord == null){gr.coord = ''}
				gr.coord = gr.coord + gr.lf(this.graphData);
			}
		}

		for(var gr of this.graphStack){
			gr.path.attr('d', gr.coord);
		}
	}

	start(){
		for(var ds of this.datasets){
			var gr = new graph(ds.name, this.timePerScreen, this.target);
			gr.debugMode = this.debugMode;
			gr.tStart = 0;
			this.graphStack.push(gr);
		}
		this.ventLoop();
		this.setYscale();
		this.startLoops();
	}

	startLoops(){
		this.ventInt = setInterval(()=>this.ventLoop(), this.ventLoopInt);
		this.loopStartTime = new Date().getTime();
		this.graphInt = setInterval(()=>this.graphLoop(), this.graphLoopInt);
	}

	stop(){
		clearInterval(this.ventInt);
		clearInterval(this.graphInt);
	}
}

