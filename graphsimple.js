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
	durAnim: 1500,
	padPlage: 5
};

gs.animer = function(graph){
	if(graph.curAnim < graph.animations.length){
		graph.animations[graph.curAnim]();
		graph.curAnim ++;
	}
};

gs.stat = function(iddiv, respd){
	var tableau = "<table style='float:top'>";
	tableau += "<tr><td>P<small>A</small>CO₂:</td><td>" + Math.round(10*respd[0].pAco2)/10 +" mmHg</td></tr>";
	tableau += "<tr><td>P<small>E</small>CO₂:</td><td>" + Math.round(10*respd[0].pmeco2)/10 +" mmHg</td></tr>";
	tableau += '<tr><td>$\\frac{V_{EM}}{Vc}$ (Fowler):</td><td>' + Math.round(1000* respd[0].fowler)/10 +" %</td></tr>";
	tableau += '<tr><td>$\\frac{V_{EM}}{Vc}$ (Bohr):</td><td>' + Math.round(1000* respd[0].bohr)/10 +" %</td></tr>";
	tableau += "</table>";
	$(iddiv).append(tableau);
};


gs.graph = class {
	constructor(idsvg, conf){

		this.idsvg = idsvg;

		for(var index in gs.defaults){
			this[index] = gs.defaults[index];
		}

		for(var index in conf){
			this[index] = conf[index];
		}

		this.svg = d3.select(idsvg)
			.classed("gs", true);

		this.animations = [];
		this.anotations = [];
		this.plages = [];
		this.curAnim = 0;

		this.width = this.svg.style("width");
		this.width = this.width.substr(0, this.width.length-2);

		this.height = this.svg.style("height");
		this.height = this.height.substr(0, this.height.length-2);

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
			.attr("refX", "7")
			.attr("markerWidth", "21")
			.attr("markerHeight", "18")
			.attr("orient", "auto")
			.attr("markerUnits", "userSpaceOnUse")
			.append("path")
			.attr("d", "M3,5 L9,10 L3,15");
	}

	setscale (d, fx, fy){
		this.ymin = Math.min(d3.min(d, fy),0);
		this.ymax = d3.max(d, fy);
		this.xmin = d3.min(d, fx);
		this.xmax = d3.max(d, fx);

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
		this.echellex = d3.scale.linear()
			.domain([this.xmin, this.xmax])
			.range([this.margeG + this.padG, this.width - (this.margeD + this.padD)]);

		this.echelley = d3.scale.linear()
			.domain([this.ymin, this.ymax])
			.range([this.height - (this.margeB + this.padB), this.margeH + this.padH]);

		this.getlf(d, fx, fy);
		this.getsf(d, fx, fy);
		return this;
	}

	getlf(d, fx, fy){

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


	tracer (donnees, fonctionx, fonctiony){
		this.donnees = donnees;
		var times = this.donnees.map(function(d){return d.Time});
		this.animTime = Math.max(times) * 1000;

		var coord = this.lf(donnees, fonctionx, fonctiony);
		var surface = this.sf(donnees, fonctionx, fonctiony);
		if(!("gridY"in this)){
			this.drawGridY();
		}
		if(!("gridX"in this)){
			this.drawGridX();
		}

		if(!('waveformGroup' in this)){
			this.waveformGroup = this.svg.append("g")
				.attr("id", "waveformGroup");
		}

		this.clip = this.defs.append("clipPath")
			.attr("id", this.idsvg + "clip");
			//.attr("id", this.idsvg.replace("#","") + "clip");
		
		this.clipRect = this.clip.append("rect")
			.attr("x", this.margeG + this.padG)
			.attr("y", this.margeH + this.padH - 2)
			.attr("width", this.width - (this.margeD + this.margeG + this.padD + this.padG) + 2)
			.attr("height", this.height - (this.margeH + this.margeB + this.padH + this.padB) + 2)
			;

		this.surface = this.svg.append("path")
			.attr("d", surface)
			.attr("class", "surface")
			.style("clip-path", "url(" + this.idsvg + "clip)")
			;	

		this.axes()

		this.courbe = this.waveformGroup.append("path")
			.attr("d", coord)
			.style("clip-path", "url(" + this.idsvg + "clip)")
			.classed('dataPath', true);
		//this.playSimb();
		return this;
	}

	ajouter (donnees, fonctionx, fonctiony){

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

	// To simulate continuous plotting like the one seen in medical ventilators,
	// we plot the entire time serie, hidden by a zero width clip rectangle, and then
	// gradually unhide it.
	
	animate (){
		this.clipRect.attr("width", 0);

		this.clipRect.transition().ease("linear").duration(this.animTime)
				.attr("width", this.width - (this.margeD + this.margeG + this.padD + this.padG) + 2);
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
		console.log("tracerZeroX");
		this.ligneZeroX = this.svg.append("line")
			.attr("x1", this.margeG)
		//	.attr("x1", 0)
			.attr("x2", this.width - this.margeD)
			//.attr("x2", 200)
			.attr("y1", this.echelley(0))
			.attr("y2", this.echelley(0))
			.attr("class", "ligneZero");
	}

	axes (){
		//if(this.hasOwnProperty("axex")){console.log("Axe X déja présent");}
		//else{
			this.axex = this.svg.append("line")
				.attr("x1", this.margeG)
				.attr("x2", this.width - this.margeD)
				//.attr("y1", this.height - this.margeB)
				//.attr("y2", this.height - this.margeB)
				.attr("y1", this.echelley(0))
				.attr("y2", this.echelley(0))
				.attr("class", "axe");

			this.axey = this.svg.append("line")
				//.attr("x1", this.margeG)
				//.attr("x2", this.margeG)
				.attr("x1", this.echellex(0))
				.attr("x2", this.echellex(0))
				.attr("y1", this.height - this.margeB)
				.attr("y2", this.margeH)
				.attr("class", "axe");

			d3.selectAll(".axe").attr("style", "marker-end: url(#flechep);");
		//}
	}

	zoomX (xmin, xmax) {

		this.echellex = d3.scale.linear()
			.domain([0, 3])
			.range([this.margeG + this.padG, this.width - (this.margeD + this.padD)]);
		
		this.getlf(this.donnees, this.fx, this.fy );
		
		this.courbe.transition().duration(this.durAnim)
			.attr("d", this.lf(this.donnees));
	}

	plagey (min, max, id){
		var pad = this.padPlage;
		var plage = {};

		plage.ligneHaut = this.svg.append("line")
			.attr("y1", this.echelley(min + (max-min)/2) - pad)
			.attr("y2", this.echelley(min + (max-min)/2) - pad)
			.attr("class", "help")
			.attr("style", "marker-end: url(#flechep);");

		plage.ligneBas = this.svg.append("line")
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

		plage.texte = this.svg.append("text")
			.attr("class", "help")
			.attr("y", this.echelley(min + (max - min)/2))
			.attr("x", this.width - this.margeD/2)
			.attr("text-anchor", "middle")
			.text(id)
			.attr("opacity", 0);

		plage.texte.transition().duration(this.durAnim).attr("opacity",1);

		this.plages.push(plage);

	}

	plagex (min, max, id){
		var pad = this.padPlage;
		var plage = {};
		plage.ligne = this.svg.append("line")
			.attr("x1", this.echellex(min) + pad)
			.attr("x2", this.echellex(min)+ pad + 6)
			.attr("y1", this.height - this.margeB/1.5)
			.attr("y2", this.height - this.margeB/1.5)
			.attr("class", "axe")
			.attr("style", "marker-start: url(#fleches);marker-end: url(#flechep);");
			plage.ligne.transition().duration(this.durAnim).attr("x2", this.echellex(max)- pad);

		plage.texte = this.svg.append("text")
			.attr("x", this.echellex(min + (max - min)/2))
			.attr("y", this.height - this.margeB/2 + 20)
			.attr("text-anchor", "middle")
			.text(id)
			.attr("opacity", 0)
		plage.texte.transition().duration(this.durAnim).attr("opacity",1);
		this.plages.push(plage);

	}

	setidx (texte){
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
			//.attr("x", this.width - this.margeD)
			.attr("x", x)
			//.attr("y", this.height - (.2 * this.margeB))
			.attr("y", y)
			.attr("text-anchor", anchor)
			.text(texte);

		return this;
	}

	setidy (texte){

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
			.text(texte);

		return this;
	}

	pointy (val, id){

		var ligne = this.svg.append("line")
			.attr("x1", this.margeG)
			.attr("x2", this.margeG)
			.attr("y1", this.echelley(val))
			.attr("y2", this.echelley(val))
			.attr("class", "help");

		ligne
			.transition()
			.duration(this.durAnim)
			.attr("x2", this.width - this.margeD);

		this.anotations.push(ligne);

		var texte = this.svg.append("text")
			.attr("text-anchor", "middle")
			.attr("y", this.echelley(val))
			.attr("dy", 0)
			.attr("class", "help")
			.text(id);
		
		if(this.annotateOnRight == true){

			texte.attr("x", this.width - this.margeD/2);
		} 

		this.anotations.push(texte);
	}

	pointx (val, id){
		var an = this.svg.append("line")
			.attr("x1", this.echellex(val))
			.attr("x2", this.echellex(val))
			.attr("y1", this.echelley(this.ymax))
			.attr("y2", this.echelley(this.ymax))
			.attr("class", "help");
			an.transition().duration(this.durAnim).attr("y1", this.echelley(this.ymin) - 5);
		this.anotations.push(an);

		var an = this.svg.append("text")
			.attr("y", this.height - this.margeB/3)
			.attr("x", this.echellex(val))
			.attr("text-anchor", "middle")
			.text(id);
		this.anotations.push(an);
	}

	drawGridY (){

		this.gridY = d3.svg.axis()
			.orient("left")
			.tickSize(- (this.width - this.margeG - this.margeD))
			.scale(this.echelley);

		this.gridYGroup = this.svg.append("g")
			.attr("class", "gridY")
			.attr("transform", "translate(" + this.echellex(this.xmin) + ", 0)")
			.call(this.gridY)
			;

		return this;
	}

	drawGridX (){

		this.gridX = d3.svg.axis()
			.tickSize(- (this.height - this.margeH - this.margeB - this.padH))
			.scale(this.echellex);

		this.gridXGroup = this.svg.append("g")
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

//	return this;
}

gs.quickGraph = function(div, data, fx, fy, conf){
	return new gs.graph(div, conf)
		.setscale(data, fx, fy)
		.tracer(data, fx, fy);
}

gs.randomHue = function(saturation, lightnes){
	var hue = Math.random() * 360;
	var color = "hsl( " + hue + ", " + saturation + "%, " + lightnes + "% )";
	return color;
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
	/*
	else {
		newsvg.attr("class", "gs");
	}
	*/
	return gs.quickGraph("#" + newSVGid, data, fx, fy, conf);
}
