class graph {
		  constructor(dataName, timePerScreen, target){
					 this.timePerScreen = timePerScreen;
					 this.dataName = dataName;

					 this.svg = target.append('svg');
					 this.svg.attr('class', 'gs');
					 this.path = this.svg.append('path');
					 this.path.attr('class', 'gsPlotLine');
					 this.coord = '';

					 this.setXscale();	
					 this.drawID();
		  }

		  setXscale(){
					 this.margeG = this.svg.style('font-size').slice(0,-2) * 2.1;
					 this.margeD = this.svg.style('font-size').slice(0,-2) * .8;
					 this.width = this.svg.style('width').slice(0, -2);

					 this.echellex = d3.scale.linear()
								.domain([0, this.timePerScreen])
								.range([this.margeG, this.width - this.margeD]);
		  }

		  setYscale(dataSet){
					 var dsMin = d3.min(dataSet, d => d[this.dataName]);
					 var dsMax = d3.max(dataSet, d => d[this.dataName]);

					 var ymin = Math.min(0,dsMin);
					 var ymax = Math.max(dsMax , - dsMin);

					 if(ymax > 10){ymax = Math.ceil(ymax/5)*5}
					 if(ymax < 10){ymax = Math.ceil(ymax)}
					 if(ymin < 0 && ymin > -10){ymin = Math.floor(ymin)}
					 if(ymin < -10){ymin = Math.floor(ymin/5)*5}

					 this.margeB = this.svg.style('font-size').slice(0,-2) * 2;
					 this.margeH = this.svg.style('font-size').slice(0,-2) * 1;
					 this.height = this.svg.style('height').slice(0, -2);

					 this.echelley = d3.scale.linear()
								.domain([ymin, ymax])
								.range([this.height - this.margeB, this.margeH]);
		  }

		  drawID(){
					 this.id = this.svg.append('text')
								.attr('x', this.margeG + 5)
								.attr('y', 18)
								.attr('text-anchor', 'start')
								.text(this.dataName)
					 ;
		  }

		  setNLf(){
					 this.lf = function(d){
								var l = d.length;
								var point = d[l -1];
								if(l == 0){
									console.log('NLF: no data to plot');
								}
								else if (l == 1){
									this.coord = this.coord + 'M' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
								}
								else {
									this.coord = this.coord + 'L' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
								}
								return this.coord;
					 }
		  }

		  drawGradY (){

					 if(this.gradYGroup){this.gradYGroup.remove()}
					 this.gradY = d3.svg.axis()
								.ticks(4)
								.tickSize(5)
								.orient("left")
								.scale(this.echelley);

					 this.gradYGroup = this.svg.append("g")
								.attr("class", "gradY")
								.attr("transform", "translate(" + this.margeG + ", 0)")
								.call(this.gradY)
					 ;

					 return this;
		  }

		  drawGradX (){

					 if(this.gradXGroup){this.gradXGroup.remove()}
					 this.gradX = d3.svg.axis()
								.scale(this.echellex)
								.orient('bottom')
								//.ticks(2)
					 			.tickValues(d3.range(2,this.timePerScreen, 2))
					 ;

					 this.gradXGroup = this.svg.append("g")
								.attr("class", "gradX")
								.attr("transform", "translate(0, " + this.echelley(0) + ")")
								.call(this.gradX)
					 ;

		  }

		replot(data){
				  var lf = d3.svg.line()
								.x((d)=> this.echellex(d['time']-this.tStart))
								.y((d)=> this.echelley(d[this.dataName]))
								.interpolate("linear");
				  this.coord = lf(data);
				  this.path.attr('d', this.coord);
		}

		redraw(scalingData, plotData){
				  this.setXscale();
				  this.setYscale(scalingData);
				  this.drawGradX();
				  this.drawGradY();
				  this.replot(plotData);
		}

}

class simulator {
		  constructor(){
					 this.target = d3.select(document.body);

					 this.datasets = [
								{name: 'Pao'},
								{name: 'Flung'},
								{name: 'PCO2'}
					 ];

					 this.timePerScreen = 12;
					 this.graphData = [];
					 this.data = [];
					 this.graphData = [];
					 this.graphStack = [];
					 this.tStart = 0;

					 this.lung = new sv.SimpleLung();
					 this.vent = new sv.FlowControler();	

					 this.ventUpdate();

					 for(var ds of this.datasets){
								var gr = new graph(ds.name, this.timePerScreen, this.target);
								gr.tStart = 0;
								this.graphStack.push(gr);
					 }
		  }

		  panelTitle(content){
					 if(!this.panelDiv){throw 'sim class: non panelDiv'}
					 var title = document.createElement("h2");
					 title.textContent = content;
					 title.className = "fpPanelTitle";
					 this.panelDiv.appendChild(title);
		  }

		  lungMenu(){
					 var select = document.createElement("select");
					 select.id = "lungSelect";
					 select.onchange = this.lungChange;
					 this.panelDiv.appendChild(select);

					 for (var lung of sv.lungs){
								var lungName = lung.name;
								var option = document.createElement("option");
								option.value = lungName;
								option.textContent = lungName;
								select.appendChild(option);
					 }
					 select.selectedIndex = sv.lungs.indexOf(sv[this.lung.constructor.name]);
		  }

		  ventMenu(){
					 this.ventSelect = document.createElement("select");
					 this.ventSelect.id = "ventSelect";
					 this.ventSelect.onchange = ()=>this.ventChange();
					 this.panelDiv.appendChild(this.ventSelect);

					 for (var vent of sv.ventilators){
								var ventName = vent.name;
								var option = document.createElement("option");
								option.value = ventName;
								option.textContent = ventName;
								this.ventSelect.appendChild(option);
					 }
					 this.ventSelect.selectedIndex = sv.ventilators.indexOf(sv[this.vent.constructor.name]);
		  }

		  ventChange(){
					 this.nextVent = new sv.ventilators[this.ventSelect.selectedIndex];
					 this.nextVent.time = this.vent.time;
					 this.vent = this.nextVent;
					 this.ventUpdate();
					 this.fillParamTable(this.vent, 'ventParams', this.ventTable);
		  }

		  lungChange(){}

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
/*
					 this.panelTitle('Monitorage');
					 var text = document.createTextNode('Temps en réserve: ');
					 this.panelDiv.append(text);
					 this.spanDataMon = document.createElement('span');
					 this.panelDiv.append(this.spanDataMon);
					 var text = document.createTextNode('s');
					 this.panelDiv.append(text);
					 */

					 /*
					 this.panelTitle('Simulation');
					 this.paramTable(this.ventilator, 'simParams', this.paramContainer, "Simulation"); 

*/
					 this.buttonValidate = document.createElement('button');
					 this.buttonValidate.textContent = 'Valider';
					 this.buttonValidate.onclick = ()=>this.validate();
					 this.buttonValidate.disabled = true;
					 this.panelDiv.appendChild(this.buttonValidate);

					 // Gestion des racourcis clavier
					 /*
					 $("#panel input").keypress(function(event){
								if (event.which == 13){ $("#ventiler").click(); }
					 });

					 $("input").change(function(){
								this.updateModels();
					 });

					 $("input").keyup(function(){
								this.updateModels();
					 });
					 */
		  }

		  fillParamTable(object, paramSet, table){
					 if(typeof object[paramSet] == "undefined"){throw object.name + '[' + paramSet + '] does not exist'}

					 while(table.hasChildNodes()){table.removeChild(table.firstChild)}

					 for(var id in object[paramSet]){
								var param = object[paramSet][id];
								//var abrev = fp.translate1(id, "short");
								var abrev = id;

								if (typeof param.unit != "undefined"){var unit = param.unit;}
								else {var unit = "";}

								var tr = document.createElement('tr');
								table.appendChild(tr);

								// Parameter name cell

								var td = document.createElement('td');
								//td.title = fp.translate1(id, "long");
								td.title = id;
								td.textContent = abrev + ' :';
								tr.appendChild(td);

								/*
								var td = $("<td></td>")
										  .attr("title", fp.translate1(id, "long"))
										  .html(abrev + " :")
										  .appendTo(tr);
										  */

								// input or value cell
								
								var td = document.createElement('td');
								td.className = 'data';
								//td.title = fp.translate1(id, "long");

								if (param.calculated == true){
										  var value = Math.round(10 * this.vent[id])/10;
										  var dataSpan = document.createElement('span');
										  dataSpan.id = 'data' + id;
										  dataSpan.textContent = value;
										  td.appendChild(dataSpan);
								}
								else{
										  var input = document.createElement('input');
										  input.id = 'input' + id;
										  input.name = id;
										  input.value = object[id];
										  input.type = 'number';
										  input.step = param.step
										  input.onfocus = function(){this.select()};
										  input.onchange = (evt)=>{
													 object[evt.target.name] = parseFloat(evt.target.value);
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
								td.textContent = unit;
								tr.appendChild(td);

								// Push the row to the table

								table.appendChild(tr);
					 }
		  } 

		  ventUpdate(){
					 this.vent.Tvent = 60 / this.vent.Fconv;
					 this.vent.Tsampl = 0.01;
					 this.pointsPerScreen = this.timePerScreen / this.vent.Tsampl;
		  }

		  setYscale(){
					 var dataSet = this.data.concat(this.graphData);

					 for(graph of this.graphStack){
								graph.setYscale(dataSet);
								graph.drawGradY();
								graph.drawGradX();
								graph.setNLf();
					 }
		  }

		  redraw(){
					 var scalingData = this.data.concat(this.graphData);

					 for(var graph of this.graphStack){
								graph.redraw(scalingData, this.graphData);
					 }
		  }
		  ventLoop(){
					 //this.spanDataMon.textContent = Math.round(this.data.length * this.vent.Tsampl * 10 )/10;
					 if(this.data.length <= 1/this.vent.Tsampl){
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
					 if(this.data.length == 0){ throw 'Stoped; no more data to plot.'}

					 if(this.graphData.length >= this.pointsPerScreen){
								this.setYscale();
								this.tStart = this.data[0].time;
								for(graph of this.graphStack){
										  graph.tStart = this.tStart;
										  graph.coord = '';
								}
								this.graphData = [];
					 }

					 this.graphData.push(this.data.shift());
					 for(var gr of this.graphStack){
								var coord = gr.lf(this.graphData);
								gr.path.attr('d', coord);
					 }
		  }

		  start(){
					 this.ventLoop();
					 this.setYscale();
					 this.startLoops();
		  }

		  startLoops(){
					 this.ventInt = setInterval(()=>this.ventLoop(), 500);
					 this.graphInt = setInterval(()=>this.graphLoop(), this.vent.Tsampl * 1000);
		  }

		  stop(){
					 clearInterval(this.ventInt);
					 clearInterval(this.graphInt);
		  }
}
