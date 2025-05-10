import * as vents from './simvent-ventilators.js';
import * as lungs from './simvent-lungs.js';
import {addGraph} from 'https://progrt.github.io/graphsimple.js/graphsimple.js';
import {icon} from './utils.js';
import {toCsv} from './animatedDisplay.js';
//import {YAML} from "https://cdn.skypack.dev/@eemeli/YAML";

const grconf =	{
	margeG:60,
	margeD:10,
	margeH:10,
	margeB:60,
	padH : .1,
    autoScale: true
};

const lConf = {
	margeG:60,
	margeD:10,
	margeH:10,
	margeB:60,
	padH : .1,
    autoScale: true,
    class: "loop",
    nticksX: 5
}

export class ventyaml {
	constructor(sourceNode) {
		if (! YAML){throw "ventyaml: YAML library not loaded."}

		this.clsList = sourceNode.classList;
		this.parentDiv = sourceNode.parentNode;

		this.container = document.createElement("figure");
		this.container.className = this.clsList;
		this.container.classList.add("ventyaml");
		this.container.classList.add("hidden");
		this.parentDiv.insertBefore(this.container, sourceNode);

        sourceNode.contentEditable = true;
        sourceNode.classList.add('ventyamlSource');
		this.container.appendChild(sourceNode);
        this.textarea = sourceNode;
        this.textarea.spellcheck = false;


		// Create waveform container div
		this.waveformContainer = document.createElement("div");
		this.waveformContainer.classList.add("vyamlwc");
		var containerId = "vyamlwc" + (document.getElementsByClassName("vyamlwc").length +1);
		this.waveformContainer.id = containerId;
		this.container.insertBefore(this.waveformContainer, this.textarea);
		this.waveformContainer.addEventListener("click", this.toggleSource.bind(this));

		this.downloadsDiv = document.createElement('div');
		this.downloadsDiv.classList.add('downloads');
		this.container.appendChild(this.downloadsDiv);

		addEventListener('keydown', e=>{
            if(e.ctrlKey & e.code =='Enter') this.update();
        });

		this.update();
	}

	update(){
		this.yaml = this.textarea.textContent;
		this.json = YAML.parse(this.yaml);
		this.updateLung();
		this.updateVent();
		this.run();
		this.updateGraph();
		this.updateCaption();
	}

	updateVent(){
		this.vents = [];

		if( !("Ventilateur" in this.json) &&!("Ventilateurs" in this.json)){
			this.vents.push(new vents.PressureControler());
		}

		else if('Ventilateur' in this.json){
			this.vents.push(this.createvent(this.json.Ventilateur));
		}

		else if(typeof this.json.Ventilateurs == 'object'){
			for(var i in this.json.Ventilateurs){
				this.vents.push(this.createvent(this.json.Ventilateurs[i]));
			}
		}
	}

	updateLung(){
		this.lungs = [];
		if ('Poumon' in this.json){
			//this.lung = this.createlung(this.json.Poumon);
			this.lungs.push(this.createlung(this.json.Poumon));
		}
		else if ('Poumons' in this.json){
			for(var i in this.json.Poumons){
				this.lungs.push(this.createlung(this.json.Poumons[i]));
			}
		}
		else{
			//this.lung = this.createlung('SimpleLung');
			this.lungs.push(this.createlung('SimpleLung'));
		}
	}

	createvent(ventDesc){
		if(typeof ventDesc == 'string'){
			if(ventDesc in vents){
				var vent = new vents[ventDesc]();
			}
		}
		else if(typeof ventDesc == 'object'){
			if(!("Mode" in ventDesc)){
				var vent = new vents.PressureControler();
			}

			else if(ventDesc.Mode in vents){
				var vent = new vents[ventDesc.Mode]();
			}
			else {console.log( "Does not seems to be a valid vent type")}

			for(var id in ventDesc){
				if(id!=="Mode" && typeof ventDesc[id] == 'number'){
					vent[id] = ventDesc[id];
				}
			}
		}
		if(typeof vent != 'undefined'){return vent;}
	}

	createlung(lungDesc){
		if(typeof lungDesc == 'string'){
			if(lungDesc in lungs){
				var lung = new lungs[lungDesc]();
			}
		}
		else if(typeof lungDesc == 'object'){
			if(!("Type" in lungDesc)){
				var lung = new lungs.SimpleLung();
			}

			else if(lungDesc.Type in lungs){
				var lung = new lungs[lungDesc.Type]();
			}
			else {console.log( "Does not seems to be a valid lung type")}

			for(var id in lungDesc){
				if(id!=="Type" && typeof lungDesc[id] == 'number'){
					lung[id] = lungDesc[id];
				}
			}
		}
		if(typeof lung != 'undefined'){return lung;}
	}

	run(){
		this.data = [];
		this.downloadsDiv.childNodes.forEach(n=>n.remove());

		for(let vent of this.vents){

			for(let lung of this.lungs){
				vent.time = 0;
				var data = vent.ventilate(lung).timeData;
				this.data.push(data);
                let csv = toCsv(data);

				var link = document.createElement('a');
                link.append(icon('Télécharger'));
				link.download = 'simvent' + this.data.length + '.csv';
				link.href = URL.createObjectURL(new Blob([csv]));;
				link.append(link.download);		

				this.downloadsDiv.appendChild(link);
			}
		}
	}

	updateGraph(){
		// 1- Clear all graph
        this.waveformContainer.childNodes.forEach(n=>n.remove());

		// 2- Check what must be ploted and plot it

		if("Courbes" in this.json){
			var courbes = this.json.Courbes;

			if(typeof courbes == "object"){
				for(var i in courbes){
					this.createWaveform(courbes[i]);
				}
			}
			else{console.log("ventyaml: Value for courbes must be a string list");}
		}
		else if("Courbe" in this.json){
			this.createWaveform(this.json.Courbe);
		}
		if("Boucles" in this.json){
			for(var i in this.json.Boucles){
				this.createLoop(this.json.Boucles[i])
			}
		}

		else if("Boucle" in this.json){
			var boucle = this.json.Boucle;
			this.createLoop(boucle);
		}

		if(!('Courbes' in this.json) 
				&& ! ('Courbe' in this.json)
				&& ! ('Boucle' in this.json)
				&& ! ('Boucles' in this.json)){
			this.createWaveform("Flung");
		}
	}

	createWaveform(courbe){
		if(typeof courbe == "string"){
            let fx = d=>d.time;
            let fy = d=>d[courbe];

			var graph = addGraph(
                this.waveformContainer.id,
                this.data[0], fx, fy, grconf
            )
				.setidx('Temps (s)')
				.setidy(courbe);

			if(this.data.length>1){
				for(var i = 1; i< this.data.length;i++){
					graph.tracer(this.data[i],fx,fy);
				}
			}


		}
		else{console.log("ventyaml: Value for courbes must be a string")}
	}	

	createLoop(boucle){
		if(
            typeof boucle == "object"
            && 'x' in boucle
            && 'y' in boucle
            && boucle.x != null
            && boucle.y != null
        ){
            let fx = d=>d[boucle.x];
            let fy = d=>d[boucle.y];

			var graph = addGraph(
                this.waveformContainer.id,
                this.data[0],
                fx, fy, lConf
            );

			graph.setidx(boucle.x);
			graph.setidy(boucle.y);

			if(this.data.length>1){
				for(var i = 1; i< this.data.length;i++){
					graph.tracer(this.data[i],fx,fy);
				}
			}
		}
		else{console.log("ventyaml: invalid loop description")}
	}

	toggleSource(){
		if(this.container.classList.contains("hidden")){
			this.container.classList.remove("hidden");
            this.textarea.focus();
		}
		else{
			this.update();
			this.container.classList.add("hidden");
		}
	}

	updateCaption(){
		// Suprimer toute legende existantr
		if(this.container.querySelector('caption')){
			this.container.querySelector('caption').remove();
		}
		// Si ume legende est specifiee dans la source, en creer une
		
		if("Legende" in this.json){
			this.captionElement = document.createElement('caption');
			this.captionElement.textContent = this.json.Legende;
			this.container.appendChild(this.captionElement);
		}
	}
}

export async function ventyamlEverything(selector){
	var preS = document.querySelectorAll(selector);

	for(var i in preS){
		if(typeof preS[i].tagName != 'undefined'){//Why the hell must I filter this?
			var ventyamlInstance = new ventyaml(preS[i]);
		}
		await new Promise(f=>setTimeout(f,5));
	}
}
