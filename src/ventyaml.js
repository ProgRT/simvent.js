class ventyaml {
	constructor(sourceNode) {
		this.clsList = sourceNode.classList;

		if (! YAML){throw "ventyaml: YAML library not loaded."}

		this.parentDiv = sourceNode.parentNode;

		this.container = document.createElement("figure");
		this.container.className =this.clsList;
		this.container.classList.add("ventyaml");

		this.parentDiv.insertBefore(this.container, sourceNode);

		if(sourceNode.tagName == "TEXTAREA"){
			this.textarea = sourceNode;
		}
		else{
			this.textarea = document.createElement("textarea");
			this.textarea.value = sourceNode.textContent;
			this.parentDiv.removeChild(sourceNode);
		}

		this.container.appendChild(this.textarea);

		this.textarea.classList.add("ventyamlSource");
		this.container.classList.add("hidden");
		this.textarea.value = this.textarea.value.trim();
		addEventListener('keyup', this.handleKeyup.bind(this));
		addEventListener('keydown', this.handleKeydown.bind(this));
		//this.createCM();


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

		// Operate the magic

		this.update();
	}

	handleKeydown(e){
		  if(e.key == 'Control'){this.ctrlDown = true}
		  if(e.key == 'Enter' && this.ctrlDown){this.update();}
	}

	handleKeyup(e){
		  if(e.key == 'Control'){this.ctrlDown = false}
	}

	setValue(value){
		this.textarea.value = value;
		if('cm' in this){
			console.log('We have a codemirror instance');
			this.cm.setValue(value);
		}
	}

	createCM(){

		// Replace source element with codemirror if available

		if(typeof window.CodeMirror !== "undefined"){
			this.cm  = CodeMirror.fromTextArea(this.textarea,{
				//keyMap: "vim",
				theme: "midnight",
				mode: "yaml",
				matchBrackets: true,
				showCursorWhenSelecting: true,
				//lineNumbers: true
			});
		}
		else{console.log("Codemirror not available");}
	}

	update(){
//		this.cm.save();
		this.yaml = this.textarea.value;
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
			this.vents.push(new sv.PressureControler());
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
			if(ventDesc in sv){
				var vent = new sv[ventDesc]();
			}
		}
		else if(typeof ventDesc == 'object'){
			if(!("Mode" in ventDesc)){
				var vent = new sv.PressureControler();
			}

			else if(ventDesc.Mode in sv){
				var vent = new sv[ventDesc.Mode]();
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
			if(lungDesc in sv){
				var lung = new sv[lungDesc]();
			}
		}
		else if(typeof lungDesc == 'object'){
			if(!("Type" in lungDesc)){
				var lung = new sv.SimpleLung();
			}

			else if(lungDesc.Type in sv){
				var lung = new sv[lungDesc.Type]();
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
		while(this.downloadsDiv.firstChild){
				  this.downloadsDiv.removeChild(this.downloadsDiv.firstChild);
		}

		for(var i in this.vents){
			var vent = this.vents[i];
			for(var i in this.lungs){
				vent.time = 0;
				var data = vent.ventilate(this.lungs[i]).timeData;
				this.data.push(data);

				var array = typeof data != 'object' ? JSON.parse(data) : data;
				var str = '';

				var line = '';
				for (var index in array[0]) {
					if(line != '') line += '\t ';
					line += index;
				}

				str += line + '\r\n';
				for (var i = 0; i < array.length; i++) {
					var line = '';
					for (var index in array[i]) {
						if(line != '') line += '\t ';
						line += array[i][index];
					}
					str += line + '\r\n';
				}

				var link = document.createElement('a');
				link.download = 'simvent' + this.data.length + '.dat';
				link.href = 'data:text/tsv;charset=utf-8,' + escape(str);
				link.textContent = link.download + ' ';		
				this.downloadsDiv.appendChild(link);
			}
		}
	}

	updateGraph(){
		// 1- Clear all graph
		var wc = this.waveformContainer;
		while(wc.firstChild){
			wc.removeChild(wc.firstChild);
		}

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
			function fx(d){return d.time;}
			function fy(d){return d[courbe];}
			var graph = gs.addGraph(this.waveformContainer.id, this.data[0], fx, fy)
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
		if( typeof boucle == "object" && 'x' in boucle && 'y' in boucle && boucle.x != null && boucle.y != null){
			function fx(d){return d[boucle["x"]];}
			function fy(d){return d[boucle["y"]];}
			var graph = gs.addGraph(this.waveformContainer.id, this.data[0], fx, fy, {class: "loop"});
			graph.setidx(boucle["x"]);
			graph.setidy(boucle["y"]);
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
		}
		else{
			this.update();
			this.container.classList.add("hidden");
		}
	}

	updateCaption(){
		// Suprimer toute legende existantr



		// Si ume legende est specifiee dans la source, en creer une
		
		if("Legende" in this.json){
			this.captionElement = document.createElement('caption');
			this.captionElement.textContent = this.json.Legende;
			this.container.appendChild(this.captionElement);
		}
	}
}

function ventyamlEverything(selector){
	var preS = document.querySelectorAll(selector);
	for(var i in preS){
		if(typeof preS[i].tagName != 'undefined'){//Why the hell must I filter this?
			var ventyamlInstance = new ventyaml(preS[i]);
		}
	}
}
