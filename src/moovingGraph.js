export class graph {

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
        this.tStart = 0;
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
			const point = d[d.length -1];
            const prefix = d.length == 1 ? 'M' : 'L';
            const x = this.echellex(point.time - this.tStart);
            const y = this.echelley(point[this.dataName]);
            return `${prefix} ${x},${y}`;
		}
	}

    updateCoord (data) {
        this.coord += this.lf(data);
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
