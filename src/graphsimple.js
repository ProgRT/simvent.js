if(typeof d3 == 'undefined'){
		  throw 'graphsimple.js: d3 library not loaded.';
}

var gs = {};

gs.defaults = {
		  margeG: 20,
		  margeD: 20,
		  margeH: 20,
		  margeB: 20,
		  padG: 0,
		  padD: 0,
		  padH: 0,
		  padB: 0,
		  idPos: "center",
		  annotateOnRight: true,
		  drawControlsSymbols: false,
		  autoScale: false,
		  debugMode: false,
		  durAnim: 1500,
		  padPlage: 5,
		  nticksY:6,
		  nticksX:10
};

gs.animer = function(graph){
		  if(graph.curAnim < graph.animations.length){
					 graph.animations[graph.curAnim]();
					 graph.curAnim ++;
		  }
};

gs.stat = function(iddiv, respd){
		  var tableau = "<table style='float:top'6>";
		  tableau += "<tr><td>P<small>A</small>CO₂:</td><td>" + Math.round(10*respd[0].pAco2)/10 +" mmHg</td></tr>";
		  tableau += "<tr><td>P<small>E</small>CO₂:</td><td>" + Math.round(10*respd[0].pmeco2)/10 +" mmHg</td></tr>";
		  tableau += '<tr><td>$\\frac{V_{EM}}{Vc}$ (Fowler):</td><td>' + Math.round(1000* respd[0].fowler)/10 +" %</td></tr>";
		  tableau += '<tr><td>$\\frac{V_{EM}}{Vc}$ (Bohr):</td><td>' + Math.round(1000* respd[0].bohr)/10 +" %</td></tr>";
		  tableau += "</table>";
		  $(iddiv).append(tableau);
};

gs.graph = class {
		  constructor(idsvg, conf){


					 for(var index in gs.defaults){
								this[index] = gs.defaults[index];
					 }

					 for(var index in conf){
								this[index] = conf[index];
					 }

					 if(idsvg == null){
								this.idsvg = "#" + gs.newSvg();
					 }
					 else{
								this.idsvg = idsvg;
					 }
					 this.svg = d3.select(this.idsvg)
								.classed("gs", true);

					 if('class' in this){
								this.svg.classed(this.class, true);
					 }
					 this.gridGroup = this.svg.append("g")
								.attr("id", "gridGroup");

					 this.plageGroup = this.svg.append("g")
								.attr("id", "plageGroup");

					 this.waveformGroup = this.svg.append("g")
								.attr("id", "waveformGroup");

					 this.annotationsGroup = this.svg.append("g")
								.attr("id", "annotationsGroup");

					 this.controlsGroup = this.svg.append("g")
								.attr("class", "controlsGroup");

					 this.donnees = [];
					 this.courbes = [];
					 this.vecteurs = [];
					 this.etiquettes = [];
					 this.plagesx = [];
					 this.pointsx = [];
					 this.pointsy = [];

					 this.anotations = [];
					 this.animations = [];
					 this.curAnim = 0;


					 this.defs = this.svg.append("defs");

					 this.defs.append("marker")
								.attr("id", "flechep")
								.attr("refY", "7")
								.attr("refX", "7")
								.attr("markerWidth", "21")
								.attr("markerHeight", "14")
								.attr("orient", "auto")
								.attr("markerUnits", "userSpaceOnUse")
								.append("path")
								.attr("d", "M5,3 L9,7 L5,11");

					 this.defs.append("marker")
								.attr("id", "fleches")
								.attr("refY", "7")
								.attr("refX", "14")
								.attr("markerWidth", "21")
								.attr("markerHeight", "14")
								.attr("orient", "auto")
								.attr("markerUnits", "userSpaceOnUse")
								.append("path")
								.attr("d", "M16,3 L12,7 L16,11");

					 this.defs.append("marker")
								.attr("id", "flecheg")
								.attr("refY", "10")
								.attr("refX", "3")
								.attr("markerWidth", "21")
								.attr("markerHeight", "18")
								.attr("orient", "auto")
								.attr("markerUnits", "userSpaceOnUse")
								.append("path")
								.attr("d", "M9,5 L3,10 L9,15");

					 this.defs.append("marker")
								.attr("id", "flechev")
								.attr("refY", "10")
								.attr("refX", "9")
								.attr("markerWidth", "21")
								.attr("markerHeight", "18")
								.attr("orient", "auto")
								.attr("markerUnits", "userSpaceOnUse")
					 .attr('stroke', 'cntext-stroke')
								.append("path")
								.attr("d", "M3,5 L9,10 L3,15");

					 if (this.drawControlsSymbols == true){
								this.controlsGroup.append("text")
										  .attr("x", this.width - this.margeD - 80)
										  .attr("y", this.margeH + 80)
										  .attr("text-anchor", "middle")
										  .text('T')
										  .on('click', function(){alert('Allo !')});
					 }
					 addEventListener('resize', ()=>this.redessiner());
		  }

		  setRanges () {
					 this.width = this.svg.style("width");
					 this.width = this.width.substr(0, this.width.length-2);

					 this.height = this.svg.style("height");
					 this.height = this.height.substr(0, this.height.length-2);

					 this.rangeX = [this.margeG + this.padG, this.width - (this.margeD + this.padD)];
					 this.rangeY = [this.height - (this.margeB + this.padB), this.margeH + this.padH];

					 return this;
		  }

		  setDomain (d, fx, fy) {
					 this.ymin = Math.min(d3.min(d, fy),0);
					 this.ymax = d3.max(d, fy);
					 this.xmin = d3.min(d, fx);
					 this.xmax = d3.max(d, fx);

					 this.applyPaddings();
					 return this;
		  }

		  applyPaddings (){
					 if(this.padD != 0){
								this.xmax += this.padD * (this.xmax - this.xmin);
					 }

					 if(this.padB != 0){
								this.ymin -= this.padB * (this.ymax - this.ymin);
					 }
					 if(this.padG != 0){
								this.xmin -= this.padG * (this.xmax - this.xmin);
					 }
					 if(this.padH != 0){
								this.ymax += this.padH * (this.ymax - this.ymin);
					 }
					 return this;
		  }

		  SetScale () {
					 this.echellex = d3.scale.linear()
								.domain([this.xmin, this.xmax])
								.range(this.rangeX);

					 this.echelley = d3.scale.linear()
								.domain([this.ymin, this.ymax])
								.range(this.rangeY);
					 return this;
		  }

		  setscale (d, fx, fy){

					 this.setDomain(d, fx, fy);
					 this.setRanges();
					 this.SetScale();
					 return this;
		  }

		  getlf (fx, fy){

					 this.lf = d3.svg.line()
								.x(function(d) {return this.echellex(fx(d))})
								.y(function(d) {return this.echelley(fy(d))})
								.interpolate("linear");
		  }

		  getsf (d, fx, fy){

					 this.sf = d3.svg.area()
								.x(function(d) {return this.echellex(fx(d))})
								.y0(function(d) {return this.echelley(0)})
								.y1(function(d) {return this.echelley(fy(d))})
								.interpolate("linear");
		  }

		  drawgrids () {
					 if(!("gridY"in this)){
								this.drawGridY();
					 }

					 if(!("gridX"in this)){
								this.drawGridX();
					 }

		  }

			Autoscale (){
					  var lastData = this.donnees[this.donnees.length -1];
					  if('xmin' in this){
								if(d3.max(lastData.donnees, lastData.fy) > this.ymax){
										  this.ymax = d3.max(lastData.donnees, lastData.fy);
										  if(this.padH != 0){
													 this.ymax += this.padH * (this.ymax - this.ymin);
										  }
								}

								if(d3.min(lastData.donnees, lastData.fy) < this.ymin){
										  this.ymin = d3.min(lastData.donnees, lastData.fy);
										  if(this.padB != 0){
													 this.ymin += this.padH * (this.ymin - this.ymax);
										  }
								}

								 this.redessiner();
					  }
			}
		  tracer (donnees, fonctionx, fonctiony){
					this.donnees.push({donnees: donnees, fx: fonctionx, fy: fonctiony});
					if(this.autoScale){
							  this.Autoscale();
					}
					 this.drawgrids();

					 this.getsf(donnees, fonctionx, fonctiony);
					 var surface = this.sf(donnees, fonctionx, fonctiony);
					 this.surface = this.svg.append("path")
								.attr("d", surface)
								.attr("class", "surface")
								.style("clip-path", "url(" + this.idsvg + "clip)")
					 ;	

					 this.axes()

					 /*
					 if(!('waveformGroup' in this)){
								this.waveformGroup = this.svg.append("g")
										  .attr("id", "waveformGroup");
					 }
					 */

					if(!this.autoScale){
							  this.Tracer(donnees, fonctionx, fonctiony);
					}
					 //this.playSimb();
					 return this;
		  }

		  Tracer(d, fx, fy){
					 this.getlf(fx, fy);
					 var coord = this.lf(d);
					 var courbe = this.waveformGroup.append("path")
								.attr("d", coord)
								.style("clip-path", "url(" + this.idsvg + "clip)")
								.classed('dataPath', true);
					 this.courbes.push(courbe);
					 return this;
		  }

		  redessiner(){
					 this.setRanges();
					 this.SetScale();

					 this.drawGridX();
					 this.drawGridY();
					 this.setidx();
					 this.setidy();

					 for(var c of this.courbes){c.remove()}
					 for(var v of this.vecteurs){this.vectDraw(v)}
					 for(var e of this.etiquettes){this.etiqDraw(e)}
					 for(var p of this.plagesx){this.plagexDraw(p)}
					 for(var p of this.pointsy){this.pointyDraw(p)}

					 /*
					 var d = this.donnees[this.donnees.length - 1];
					 this.Tracer(d.donnees, d.fx, d.fy);
					 */
					 for(var d of this.donnees){
								this.Tracer(d.donnees, d.fx, d.fy);
					 }
		  }

		  ajouter (donnees, fonctionx, fonctiony){
					 this.getlf(fonctionx, fonctiony);
					 this.getsf(donnees, fonctionx, fonctiony);

					 var coord = this.lf(donnees, fonctionx, fonctiony);

					 this.courbe2 = this.waveformGroup.append("path")
								.attr("d", coord)
								.style("clip-path", "url(#" + this.idsvg + "clip)")
								.style("opacity", 0)
								.classed('dataPath', true);

					 this.courbe2.transition().duration(this.durAnim).style("opacity", 1);

					 this.anotations.push(this.courbe2);

					 return this;
		  }

		  raz (){
					 for(i in this.anotations){
								this.anotations[i].transition().duration(this.durAnim).style("opacity", 0);
								this.anotations[i].transition().delay(this.durAnim).remove();
					 }
					 for(i in this.plages){
								this.plages[i].ligne.transition().duration(this.durAnim).style("opacity", 0);
								this.plages[i].texte.transition().duration(this.durAnim).style("opacity", 0);
								this.plages[i].ligne.transition().delay(this.durAnim).remove();
								this.plages[i].texte.transition().delay(this.durAnim).remove();
					 }
		  }

		  tracerZeroX (){
					 this.ligneZeroX = this.svg.append("line")
								.attr("x1", this.margeG)
								.attr("x2", this.width - this.margeD)
								.attr("y1", this.echelley(0))
								.attr("y2", this.echelley(0))
								.attr("class", "ligneZero");
		  }

		  axes (){
					 this.axex = this.svg.append("line")
								.attr("x1", this.margeG)
								.attr("x2", this.width - this.margeD)
								.attr("y1", this.echelley(0))
								.attr("y2", this.echelley(0))
								.attr("class", "axe");

					 this.axey = this.svg.append("line")
								.attr("x1", this.echellex(0))
								.attr("x2", this.echellex(0))
								.attr("y1", this.height - this.margeB)
								.attr("y2", this.margeH)
								.attr("class", "axe");

					 d3.selectAll(".axe").attr("style", "marker-end: url(#flechep);");
		  }

		  zoomX (xmin, xmax) {

					 this.echellex = d3.scale.linear()
								.domain([0, 3])
								.range([this.margeG + this.padG, this.width - (this.margeD + this.padD)]);

					 this.getlf(this.fx, this.fy );

					 this.courbe.transition().duration(this.durAnim)
								.attr("d", this.lf(this.donnees));
		  }

		  vecteur ( x1, y1, x2, y2, options){
					 var pad = this.padPlage;
					 var vecteur = {x1: x1, y1: y1, x2: x2, y2: y2};

					 this.vectDraw(vecteur);
					 this.vecteurs.push(vecteur);

					 return this;

		  }

		  vectDraw(vect){

					 if(vect.ligne){vect.ligne.remove()}
					 vect.ligne = this.annotationsGroup.append("line")
								.attr("x1", this.echellex(vect.x1)/* + pad*/)
								.attr("x2", this.echellex(vect.x2) /*- pad*/)
								.attr("y1", this.echelley(vect.y1))
								.attr("y2", this.echelley(vect.y2))
								.attr("class", "vecteur")
								.attr("style", "marker-end: url(#flechev);");

					 return this;
		  }

		  etiquette ( x, y, texte, options){
					 var etiquette = {
								x: x,
								y: y,
								texte: texte,
								options: options
					 };

					 this.etiquettes.push(etiquette);
					 this.etiqDraw(etiquette);

					 return this;

		  }

		  etiqDraw (e) {

					 if(e.display){e.display.remove()}
					 e.display = this.annotationsGroup.append("text")
								.attr("class", "etiquette")
								.attr("x", this.echellex(e.x))
								.attr("y", this.echelley(e.y))
								.attr("text-anchor", "middle")
								.text(e.texte);

					 return this;
		  }

		  plagexDraw(p) {

					 if(p.ligne){p.ligne.remove()}
					 if(p.texteDisplay){p.texteDisplay.remove()}

					 p.ligne = this.plageGroup.append("line")
								.attr("x1", this.echellex(p.min) + this.padPlage)
								.attr("x2", this.echellex(p.max) - this.padPlage)
								.attr("y1", this.echelley(p.y))
								.attr("y2", this.echelley(p.y))
								//.attr("y1", this.height - this.margeB*.5)
								//.attr("y2", this.height - this.margeB*.5)
								.attr("class", "help")
								.attr("style", "marker-start: url(#flecheg);marker-end: url(#flechev);");

					 p.texteDisplay = this.svg.append("text")
								.attr("class", "help")
								.attr("x", this.echellex(p.min + (p.max - p.min)/2))
								//.attr("y", this.height - this.margeB * .3)
								.attr("y", this.echelley(p.y) - 15)
								.attr("text-anchor", "middle")
								.text(p.id)
					 ;
		  }

		  plagex (min, max, id, y){
					 var plage = {
								min: min,
								max: max,
								id: id,
								y: y
					 };

					 this.plagexDraw(plage);

					 this.plagesx.push(plage);

					 return this;

		  }

		  plagey (min, max, id){
					 var pad = this.padPlage;
					 var plage = {};

					 plage.ligneHaut = this.plageGroup.append("line")
								.attr("y1", this.echelley(min + (max-min)/2) - pad)
								.attr("y2", this.echelley(min + (max-min)/2) - pad)
								.attr("class", "help")
								.attr("style", "marker-end: url(#flechep);");

					 plage.ligneBas = this.plageGroup.append("line")
								.attr("y2", this.echelley(min + (max-min)/2) + pad)
								.attr("y1", this.echelley(min + (max-min)/2) + pad)
								.attr("class", "help")
								.attr("style", "marker-end: url(#flechep);");

					 if(this.annotateOnRight == true){
								plage.ligneHaut
										  .attr("x1", this.width - this.margeD/2)
										  .attr("x2", this.width - this.margeD/2);
								plage.ligneBas
										  .attr("x1", this.width - this.margeD/2)
										  .attr("x2", this.width - this.margeD/2);
					 }

					 plage.ligneHaut.transition()
								.duration(this.durAnim)
								.attr("y2", this.echelley(max) + pad);

					 plage.ligneBas.transition()
								.duration(this.durAnim)
								.attr("y2", this.echelley(min) - pad)

					 plage.rect = this.plageGroup.append("rect")
								.attr('x', this.margeG)
								.attr('y', this.echelley(max))
								.attr('width', this.width - this.margeD - this.margeG)
								.attr('height', this.echelley(min) - this.echelley(max));

					 plage.texte = this.svg.append("text")
								.attr("class", "help")
								.attr("y", this.echelley(min + (max - min)/2))
								.attr("x", this.width - this.margeD/2)
								.attr("text-anchor", "middle")
								.text(id)
								.attr("opacity", 0);

					 plage.texte.transition().duration(this.durAnim).attr("opacity",1);

					 this.plages.push(plage);
					 return this;

		  }

		  setidx (texte){
					 if (texte){this.idxText = texte}
					 if(this.idx){this.idx.remove()}
					 var y = this.height - (.2 * this.margeB);

					 if(this.idPos == "center"){
								var x = this.margeG + ((this.width - this.margeD)-this.margeG)/2;
								var anchor = "middle";
					 }

					 else if(this.idPos == "end"){
								var x = this.width - this.margeD;
								var anchor = "end";
					 }

					 this.idx = this.svg.append("text")
								.attr("x", x)
								.attr("y", y)
								.attr("text-anchor", anchor)
					 			.classed('idx', true)
								.text(this.idxText);

					 return this;
		  }

		  /*
		  texte(x,y,texte){
					 var t = this.svg.append('text')
								.attr("text-anchor", 'middle')
								.attr('x', this.echellex(x))
								.attr('y', this.echelley(y))
								.text(texte);
		  }
		  */

		  setidy (texte){

					 if(this.idy){this.idy.remove()}
					 if(texte){this.idyText = texte}
					 if(this.idPos == "center"){
								var x = this.margeG/3;
								var y = this.margeH + ((this.height - (this.margeB + this.margeH))/2);
								var anchor = "middle";
								var transform = "rotate(-90 " + x + " " + y + ")";
					 }

					 else if(this.idPos == "end"){
								var x = this.margeG + 15;
								var y = this.margeH + 10;
								var anchor = "start";
					 }

					 this.idy = this.svg.append("text")
								.attr("y", y)
								.attr("x", x)
								.attr("text-anchor", anchor)
								.attr("transform", transform)
								.text(this.idyText);

					 return this;
		  }

		  pointyDraw (p) {
					 if(p.ligne){p.ligne.remove()};
					 p.ligne = this.svg.append("line")
								.attr("x1", this.margeG)
								.attr("x2", this.width - this.margeD)
								.attr("y1", this.echelley(p.val))
								.attr("y2", this.echelley(p.val))
								.attr("class", "pointy");

					 /*
					 var texte = this.svg.append("text")
								.attr("text-anchor", "middle")
								.attr("y", this.echelley(val))
								.attr("dy", 0)
								.attr("class", "help")
								.text(id);

					 if(this.annotateOnRight == true){

								texte.attr("x", this.width - this.margeD/2);
					 } 
					 else{
								texte.attr("x", this.margeG/2);
					 }
					 */
		  }

		  pointy (val, id) {

					 var point = {
								val: val,
								id: id
					 };

					 this.pointyDraw(point);
					 this.pointsy.push(point);

					 return this;
		  }

		  pointx (val, id){
					 var an = this.svg.append("line")
								.attr("x1", this.echellex(val))
								.attr("x2", this.echellex(val))
								.attr("y1", this.echelley(this.ymin))
								.attr("y2", this.echelley(this.ymax))
								.attr("class", "pointx");
					 this.pointsx.push(an);

					 var an = this.svg.append("text")
								.attr("y", this.height - this.margeB/3)
								.attr("x", this.echellex(val))
								.attr("text-anchor", "middle")
								.text(id);
					 this.anotations.push(an);
					 return this;
		  }

		  drawGridY (){

					 if(this.gridYGroup){this.gridYGroup.remove()}
					 this.gridY = d3.svg.axis()
								.orient("left")
								.tickSize(- (this.width - this.margeG - this.margeD))
					 			.ticks(this.nticksY)
								.scale(this.echelley);

					 this.gridYGroup = this.gridGroup.append("g")
								.attr("class", "gridY")
								.attr("transform", "translate(" + this.echellex(this.xmin) + ", 0)")
								.call(this.gridY)
					 ;

					 return this;
		  }

		  drawGridX (){

					 if(this.gridXGroup){this.gridXGroup.remove()}
					 this.gridX = d3.svg.axis()
								.tickSize(- (this.height - this.margeH - this.margeB - this.padH))
					 			.ticks(this.nticksX)
								.scale(this.echellex);

					 this.gridXGroup = this.gridGroup.append("g")
								.attr("class", "gridX")
								.attr("transform", "translate(0, " + this.echelley(this.ymin) + ")")
								.call(this.gridX)
					 ;

					 return this;
		  }

		  drawGradY (){

					 this.gradY = d3.svg.axis()
								.tickSize(20)
					 //.orient("left")
								.scale(this.echelley);

					 this.gradYGroup = this.svg.append("g")
								.attr("class", "gradY")
								.attr("transform", "translate(" + this.echellex(this.xmin) + ", 0)")
								.call(this.gradY)
					 ;

					 return this;
		  }

		  drawGradX (){

					 this.gradX = d3.svg.axis()
								.scale(this.echellex);

					 this.gradXGroup = this.svg.append("g")
								.attr("class", "gradX")
								.attr("transform", "translate(0, " + this.echelley(this.ymin) + ")")
								.call(this.gradX)
					 ;

					 return this;
		  }

		  playSimb (){
					 this.svg.append("polygon")
								.attr("class", "playSimb")
								.attr("points", "0,0 0,50 43.3,25 0,0");
					 return this;
		  }

		  controlSymbol(){
					 return this;
		  }

		  //	return this;
}

gs.quickGraph = function(div, data, fx, fy, conf){
		  return new gs.graph(div, conf)
					 .setscale(data, fx, fy)
					 .tracer(data, fx, fy);
}

gs.addGraph = function(target, data, fx, fy, conf){
		  var numSVG = document.getElementsByTagName("svg").length + 1; 
		  var newSVGid = target + "SVG" + numSVG;
		  var newsvg = d3.select("#" + target)
					 .append("svg")
					 .attr("id", newSVGid)
		  ;
		  if (typeof conf != "undefined" && 'class' in conf){
					 newsvg.classed(conf.class, true);
		  }
		  return gs.quickGraph("#" + newSVGid, data, fx, fy, conf);
}

gs.newSvg = function(){
		  var scriptParent = document.scripts[document.scripts.length - 1].parentNode;
		  var numSVG = document.getElementsByTagName("svg").length + 1; 
		  var newSVGid = "svg" + numSVG;
		  var newsvg = d3.select(scriptParent)
					 .append("svg")
					 .attr("id", newSVGid);
		  return newSVGid;
}

gs.newDiv = function(){
		  var scriptParent = document.scripts[document.scripts.length - 1].parentNode;
		  var divNum = document.querySelectorAll("div").length + 1;
		  var newDiv = document.createElement("div");
		  newDiv.id = "div" + divNum;
		  scriptParent.appendChild(newDiv);
		  return newDiv.id;
}

gs.randomHue = function(saturation, lightnes){
		  var hue = Math.random() * 360;
		  var color = "hsl( " + hue + ", " + saturation + "%, " + lightnes + "% )";
		  return color;
}
