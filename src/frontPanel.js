// Creation of the front panel object

var fp = {};

// *****************************
// Configurations
// *****************************


fp.dygraphConf = {
	includeZero: true,
	strokeWidth: 1,
	color: "hsl(220, 100%, 36%)",
	fillGraph:false,
	drawGrid:false,
	drawAxesAtZero:true,
	//showRoller:true,
	//rollPeriod:4,
	digitsAfterDecimal:3,
	animatedZooms:true,
	//drawYGrid:true,
	interactionModel:{},
	titleHeight: 50,
	rightGap: 100,
	axes:{
		x:{
			pixelsPerLabel:30,
	//var container = document.getElementById(fp.jparamContainer);
			drawGrid: false,
			axisLabelWidth: 10
		  },
		y:{
			pixelsPerLabel:15,
			drawGrid: true,
			axisLabelWidth: 35
		  }
	},
	valueFormatter:function(v){return Math.round(1000 * v)/1000}
};

fp.paramContainer = "#panel";
fp.waveformContainerID = "#fpGraphics";

fp.lungModels = [
	"SimpleLung",
	"SptLung",
	"SygLung",
	"RLung"
	];

fp.lungModel = "SimpleLung";

fp.ventModels = [
	"FlowControler",
	"PressureControler",
	"PressureAssistor",
	"VDR",
		  "IPV",
	"PVCurve"
	];

fp.ventModel = "PressureControler";

fp.progressDelay = 50;

fp.languages = {
	long: navigator.language,
	short: navigator.language.substr(0,2),
	fallback: "en"
	};
//for (var language in fp.languages){
//	console.log(language + ": " + fp.languages[language]);
//}
// **********************************
// Translation of the user interface
// **********************************

fp.translate1 = function(toTranslate, length){
	if(typeof dict[toTranslate]  != 'undefined' &&  length in dict[toTranslate] && navigator.language in dict[toTranslate][length]){
		return dict[toTranslate][length][navigator.language];
	}
	if(typeof dict[toTranslate]  != 'undefined' &&  length in dict[toTranslate] && navigator.language in dict[toTranslate][length]){
		return dict[toTranslate][length][navigator.language];
	}
	if(typeof dict[toTranslate]  != 'undefined' &&  length in dict[toTranslate] && navigator.language in dict[toTranslate][length]){
		return dict[toTranslate][length][navigator.language];
	}

	else {
		console.log("Was unable to translate \"" + toTranslate +"\"");
		return toTranslate;
	}
};


// **********************************
// Other unsorted functions
// **********************************

fp.updateModels = function(){

	for(var i in fp.ventilator.ventParams){
		if(fp.ventilator.ventParams[i].calculated != true){
			fp.ventilator[i] = parseFloat($("#input" + i).val());
		}
	}

	//fp.ventilator.updateCalcParams();
	for(var i in fp.ventilator.ventParams){
		if(fp.ventilator.ventParams[i].calculated == true){
			document.getElementById("data"+i).textContent = ""+ Math.round(10 * fp.ventilator[i])/10;
		}
	}

	for(var i in fp.ventilator.simParams){
		fp.ventilator[i] = parseFloat($("#input" + i).val());
	}

	fp.lung = new sv[fp.lungModel]();
	for(var i in fp.lung.mechParams){
		fp.lung[i] = parseFloat($("#input" + i).val());
	}
}

fp.ventilate = function(){

	fp.ventilator.time = 0;
	fp.data = fp.ventilator.ventilate(fp.lung);
	fp.timeData = fp.data.timeData;
}

fp.download = function(objArray)
{
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
 
    /*
    if (navigator.appName != 'Microsoft Internet Explorer')
    {
        window.open('data:text/csv;charset=utf-8,' + escape(str), 'simvent.dat');
    }
    else
    {
        var popup = window.open('','csv','');
        popup.document.body.innerHTML = '<pre>' + str + '</pre>';
    }
    */
    var link = document.createElement('a');
    link.download = 'simvent.dat';
    link.href = 'data:text/csv;charset=utf-8,' + escape(str);
    document.body.appendChild(link);
    setTimeout(function(){
    link.click();
    document.body.removeChild(link);
    }, 66);
}


// **********************************
// Création du tableau des paramètres
// **********************************

fp.iSelect = function(){
	this.select();
}

fp.paramTable = function(object, paramSet, container, label){
	if(typeof object[paramSet] != "undefined"){
		//$(label).detach();
		if(document.getElementById('#'+ label) == null){
			$(container).append("<table id=\""+label+"\"></table>");
		}
		var table = $("#" + label) ; 
		//var table = $("#fpParamTable") ; 
//		if(typeof label != "undefined"){table.append("<tr><th colspan='3' class='fpPanelTitle'>"+label+"</th></tr>");}

		for(var id in object[paramSet]){
			var param = object[paramSet][id];
			//var abrev = id; // abrev will eventualy be set to a translated value
			var abrev = fp.translate1(id, "short");
			if (typeof param.unit != "undefined"){var unit = param.unit;}
			else {var unit = "";}

			var tr = $("<tr></tr>");

			var td = $("<td></td>")
					.attr("title", fp.translate1(id, "long"))
					.html(abrev + " :")
					.appendTo(tr);

			var td = $("<td class=\"data\"></td>");
			if (param.calculated == true){
				var value = Math.round(10 * fp.ventilator[id])/10;
				var dataSpan = $("<span></span>")
					.attr("id", "data" + id)
					.html(value)
					.appendTo(td);
			}
			else{
				var input = $("<input></input>")
						.attr("id", 'input' + id)
						.attr("value", object[id])
						.attr("size", '3')
						.attr("type", 'number')
						.attr("step", param.step)
						.attr("onFocus", 'this.select()')
						.appendTo(td);
			}
			tr.append(td);
			var unitSpan = $("<td class='unit'>" + unit + "</td>")
				.appendTo(tr);


			tr.appendTo(table);
		}
	}
} 

/***************************************
 * Creating the graphs
 **************************************/

fp.graphics = [];

fp.timeSeries = [
	"Pao",
	//"Fop",
	"Flung",
	//"Palv",
	"Vt",
	"PCO2"
	];


fp.timeSeries2 = [
	{
		id: "Pao", 
		dataSets:[
			{ dataSet: "timeData", key: "Pao"}
		]
	},
	{
		id: "Flung", 
		dataSets:[
			{ dataSet: "timeData", key: "Flung"}
		]
	},
	{
		id: "Palv", 
		dataSets:[
			{ dataSet: "timeData", key: "Palv"}
		]
	},
	{
		id: "PCO₂", 
		dataSets:[
			{ dataSet: "timeData", key: "PCO2"}
		]
	}
];

fp.initDyGraph = function(){
	$(".graph").detach();
	for (var index in fp.timeSeries){

		var id = fp.timeSeries[index];
		var idgraph = "#graph" + id;
		if (typeof dict[id] != "undefined"){
			var label = fp.translate1(fp.timeSeries[index], "long");
	//var container = document.getElementById(fp.jparamContainer);
		}
		else { label = id}

		var conf = fp.dygraphConf;
		//conf.ylabel = label;
		conf.title = label;
		conf.labels = ["Time", id];

		$(fp.waveformContainerID).append("<div class='graph' id='graph" + id + "'></div>");
		var  div = document.getElementById("graph" + id);

		fp.graphics.push(new Dygraph(div, [[0,0]], fp.dygraphConf));
	}
	if(fp.graphics.length > 1){
			  fp.sync = Dygraph.synchronize(
						 fp.graphics,
						 {
									selection: true,
									zoom: true,
									range: false
						 }
			  );
	}

}

// **********************************
// Paneau de sélection des graphiques
// **********************************

fp.updateTsSelect = function(){
		  fp.TsSelectDesactivate();
		  fp.timeSeries = [];
		  var params = document.querySelectorAll(".TsSelect");
		  for(var i = 0; i < params.length; i ++){
					 p = params[i];
					 if(p.checked == true){
								fp.timeSeries.push(p.id);
					 }
		  }
		  fp.graphics = [];
		  fp.initDyGraph();
		  fp.initProgress();
		  fp.plotDygraph(0);
}

fp.mkTsSelect = function(){

		  if(document.querySelectorAll("#fpTselect").length > 0){
					 var Tselect = document.querySelector("#fpTselect");
					 TsSelect.parentNode.removeChild(TsSelect);
		  }

		  var keys = [];
		  var params = sv.log(fp.lung, fp.ventilator);
		  delete params.time;

		  for(var key in params){keys.push(key)};

		  keys = keys.sort(
					 function (a, b) {
								return a.toLowerCase().localeCompare(b.toLowerCase());
					 }
		  );

		  var div = document.createElement("div");
		  div.id = "fpTselect";
		  document.body.appendChild(div);

		  var divList = document.createElement("div");
		  divList.id = "fpTselectList";
		  div.appendChild(divList);


		  for(var i in keys){
					 var para = document.createElement("label");
					 para.for = keys[i];
					 var checkbox = document.createElement("input");
					 checkbox.type = "checkbox";
					 checkbox.className = 'TsSelect';
					 checkbox.id = keys[i];

					 if(fp.timeSeries.includes(keys[i])){
								checkbox.checked = true;
					 }

					 para.appendChild(checkbox);
					 var text = document.createTextNode(" " + keys[i]);
					 para.appendChild(text);
					 divList.appendChild(para);
		  }

		  var divButtons = document.createElement("div");
		  divButtons.id = "fpTselectButtons";
		  div.appendChild(divButtons);

		  var valider  = document.createElement("button");
		  var text = document.createTextNode("Valider");
		  valider.appendChild(text);
		  valider.onclick = fp.updateTsSelect;
		  divButtons.appendChild(valider);
}

// *****************************
// Mise à jour des graphiques
// *****************************

fp.plotDygraph = function(index){

		var id = fp.timeSeries[index];

		function f1(d, i, a){ return [ d["time"], d[id] ]; }
		
		var data = fp.timeData.map(f1);

		fp.graphics[index].updateOptions({file: data});
		fp.pBarr.value = (index + 1)/fp.timeSeries.length;
		
		if(index < fp.timeSeries.length - 1){
			++ index;
			setTimeout(function(){
				fp.plotDygraph(index)
			}, 10);
		}
		else{setTimeout(function(){fp.stopProgress();},50);}
		fp.graphics[0].resetZoom();
}

/**********************************
 * Progressbar
 * *******************************/

fp.progressBar = function(){
	fp.pbTimer = setTimer(function(){

	}, fp.pbDelay);
}

fp.initProgress = function(){
	document.querySelector(".fpShadow").classList.add('visible');
	fp.pDiv = document.createElement("div");
	fp.pDiv.id = "pDiv";
	fp.pDiv.textContent = "Updating graphics...";
	fp.pBarr = document.createElement("progress");
	fp.pBarr.value = 0;
	fp.pDiv.appendChild(fp.pBarr);
	document.body.appendChild(fp.pDiv);
};

fp.stopProgress = function(){
	setTimeout(function(){
		fp.hideShadow();
		document.body.removeChild(fp.pDiv);
	},100);
};

/*******************************************/
/*******************************************/

function maj() {
	fp.panelDesactivate();
	fp.initProgress();
	setTimeout(function(){
		fp.updateModels();
		fp.ventilate()
		fp.xmin = null;
		fp.ymin = null;
		fp.plotDygraph(0)
		//fp.plotDygraph1()
	}, 50);
}

fp.lungMenu = function(){
	var container = document.querySelector(fp.paramContainer);
	var select = document.createElement("select");
	select.id = "lungSelect";
	select.onchange = fp.lungChange;
	container.appendChild(select);

	for (var i in fp.lungModels){
		var option = document.createElement("option");
		option.value = fp.lungModels[i];
		option.textContent = fp.lungModels[i];
		select.appendChild(option);
	}
	select.selectedIndex = fp.lungModels.indexOf(fp.lungModel);
}

fp.ventMenu = function(){
	var container = document.querySelector(fp.paramContainer);
	var select = document.createElement("select");
	select.id = "ventSelect";
	select.onchange = fp.ventChange;
	container.appendChild(select);

	for (var i in fp.ventModels){
		var option = document.createElement("option");
		option.value = fp.ventModels[i];
		option.textContent = fp.ventModels[i];
		select.appendChild(option);
	}
	select.selectedIndex = fp.ventModels.indexOf(fp.ventModel);
}

fp.lungChange = function(){
	var select = document.getElementById("lungSelect");
	var newlung = select.options[select.selectedIndex].value;
	fp.lungModel = newlung;
	fp.lung = new sv[newlung];
	fp.init();
}

fp.ventChange = function(){
	var select = document.getElementById("ventSelect");
	var newVent = select.options[select.selectedIndex].value;
	fp.ventModel = newVent;
	fp.ventilator = new sv[newVent];
	fp.init();
}

fp.initShadow = function(){
	// If shadow does not already exist
	if (true) {
		var shadowDiv = document.createElement("div");
		shadowDiv.className = "fpShadow";
		shadowDiv.onclick = function(){
			fp.panelDesactivate();
			fp.hideShadow();
		}
		document.body.appendChild(shadowDiv);
	}
}

fp.hideShadow = function(){
	document.querySelector(".fpShadow").classList.remove('visible');
}

fp.initControls = function(){
	var cDiv = document.querySelector("#fpControls");
	cDiv.textContent = null;

	var cImg = document.createElement("img");
	cImg.src = "https://progrt.github.io/simvent.js/Icones/Courbes.svg";
	//cImg.src = "../Icones/Courbes.svg";
	cImg.alt = "Courbes";
	var pCtl = document.createElement("a");
	pCtl.appendChild(cImg);
	pCtl.onclick = fp.TsSelectActivate;
	cDiv.appendChild(pCtl);

	var cImg = document.createElement("img");
	cImg.src = "https://progrt.github.io/simvent.js/Icones/sliders.svg";
	//cImg.src = "../Icones/sliders.svg";
	cImg.alt = "Paramètres";
	var pCtl = document.createElement("a");
	pCtl.appendChild(cImg);
	pCtl.onclick = fp.panelActivate;
	cDiv.appendChild(pCtl);

}

fp.init = function(){
		  if(typeof fp.ventilator == "undefined"){fp.ventilator = new sv[fp.ventModel]();}
		  if(typeof fp.lung == "undefined"){fp.lung = new sv[fp.lungModel]();}

		  fp.initControls();

		  $(fp.paramContainer).children().remove();


		  var title = document.createElement("h2");
		  title.textContent = "Ventilateur";
		  title.className = "fpPanelTitle";
		  title.id = "fpH2PanelVent";
		  document.querySelector("#panel").appendChild(title);

		  fp.ventMenu();
		  fp.paramTable(fp.ventilator, "ventParams", fp.paramContainer, "Ventilateur"); 

		  var title = document.createElement("h2");
		  title.textContent = "Poumon";
		  title.className = "fpPanelTitle";
		  title.id = "fpH2PanelLung";
		  document.querySelector("#panel").appendChild(title);

		  fp.lungMenu();
		  fp.paramTable(fp.lung, "mechParams", fp.paramContainer, "Poumon"); 

		  var title = document.createElement("h2");
		  title.textContent = "Simulation";
		  title.className = "fpPanelTitle";
		  title.id = "fpH2PanelSim";
		  document.querySelector("#panel").appendChild(title);

		  fp.paramTable(fp.ventilator, 'simParams', fp.paramContainer, "Simulation"); 

		  $(fp.paramContainer).append('<button id="ventiler" value="ventiler" onClick="maj()">&#x25b6; Ventiler</button>');

		  var title = document.createElement("h2");
		  title.textContent = "Téléchargements";
		  title.className = "fpPanelTitle";
		  title.id = "fpH2PanelDownload";
		  document.querySelector("#panel").appendChild(title);

		  var downloadDiv  = document.createElement("div");
		  downloadDiv.id = "fpDownloadDiv";
		  document.querySelector("#panel").appendChild(downloadDiv);

		  var link  = document.createElement("a");
		  link.text = "simvent_timedata.dat";
		  link.onclick = function(){
					 fp.download(fp.timeData);
		  };
		  document.querySelector("#fpDownloadDiv").appendChild(link);

		  fp.initShadow();
		  fp.graphics = [];
		  fp.initDyGraph()
		  maj();

		  // Gestion des racourcis clavier
		  $("#panel input").keypress(function(event){
					 if (event.which == 13){ $("#ventiler").click(); }
		  });

		  $("input").change(function(){
					 fp.updateModels();
		  });

		  $("input").keyup(function(){
					 fp.updateModels();
		  });

		  fp.mkTsSelect();
};

fp.TsSelectActivate = function(){
	document.querySelector("#fpTselect").scrollTop = 0;
	document.querySelector("#fpTselect").classList.add('visible');
	//document.querySelector(".fpShadow").classList.add('visible');
}

fp.TsSelectDesactivate = function(){
	document.querySelector("#fpTselect").classList.remove('visible');
	//document.querySelector(".fpShadow").classList.remove('visible');
}

fp.panelActivate = function(){
	document.querySelector(fp.paramContainer).scrollTop = 0;
	document.querySelector(fp.paramContainer).classList.add('visible');
	document.querySelector(".fpShadow").classList.add('visible');
}

fp.panelDesactivate = function(){
	document.querySelector(fp.paramContainer).classList.remove('visible');
	//document.querySelector(".fpShadow").classList.remove('visible');
}
