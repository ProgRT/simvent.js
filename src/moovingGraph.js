import {translate, units} from './translate.js';
import {fmt} from './utils.js';

export class graph {

	constructor(dataName, timePerScreen, target){
        target = d3.select(target);
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
        this.cursors = [];
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
		var ymax = dsMax * 1.5;

		if(ymax > 10){ymax = Math.ceil(ymax/5)*5}

		this.margeB = this.svg.style('font-size').slice(0,-2) * 2;
		this.margeH = this.svg.style('font-size').slice(0,-2) * 1;
		this.height = this.svg.style('height').slice(0, -2);

		this.echelley = d3.scale.linear()
			.domain([ymin, dsMax +(dsMax - ymin) *.1])
			.range([this.height - this.margeB, this.margeH]);
	}

	drawID(){
        let id = translate(this.dataName);
        if(this.dataName in units) id += ` (${units[this.dataName].unit})`;

		this.id = this.svg.append('text')
			.attr('x', this.margeG + 5)
			.attr('y', 18)
			.attr('text-anchor', 'start')
			.text(id)
		;
	}

	setNLf(){
		this.lf = function(d){
			const [point] = d.slice(-1);
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

		if(this.gradYGroup) this.gradYGroup.remove();

		this.gradY = d3.svg.axis()
			.ticks(4)
			.tickSize(5)
			.orient("left")
			.scale(this.echelley)
        ;

		this.gradYGroup = this.svg.append("g")
			.attr("class", "gradY")
			.attr("transform", "translate(" + this.margeG + ", 0)")
			.call(this.gradY)
		;
	}

	drawGradX (){

		if(this.gradXGroup) this.gradXGroup.remove();
		this.gradX = d3.svg.axis()
			.scale(this.echellex)
			.orient('bottom')
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
        for (let c of this.cursors) c.redraw();
	}

    remove () {
        this.svg.remove();
    }

    drawCursor(data){
        this.cursors.push(new cursor(this, data));
    }

    clearCursors(){
        for (let c of this.cursors) c.remove();
        this.cursors = [];
    }

}

class cursor {
    constructor (graph, data) {
        //console.log(`Height: ${graph.height} Marge: ${graph.margeB}`);
        this.data = data;
        this.time = data.time - graph.tStart;
        this.graph = graph;
        this.dataName = this.graph.dataName;
        this.cursG = this.graph.svg.append('g');
        this.cursG.attr('class', 'cursor');
        let x = this.graph.echellex(this.time);

        let y = graph.echelley(data[graph.dataName])
        let y1 = this.graph.margeH;
        let y2 = this.graph.height - this.graph.margeB;

        this.line = this.cursG.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', y1)
            .attr('y2', y2)
            .attr('stroke', 'red')
            .attr('opacity', '0.7')
        ;

        this.el = this.cursG.append('ellipse')
            .attr('cx', x)
            .attr('cy', y)
            .attr('rx', 3.5)
            .attr('ry', 3.5)
            .attr('stroke', 'red')
            .attr('fill', 'red')
            .attr('opacity', '0.3')
        ;

        this.txt = this.cursG.append('text')
            .attr('x', x +5)
            .attr('y', y)
            .attr('fill', 'red')
            //.attr('stroke', 'white')
            .text(fmt(this.data[this.dataName], 2))
        ;

    }

    move (data) {
        this.data = data;
        this.time = data.time - this.graph.tStart;
        let dataName = this.graph.dataName;
        let x = this.graph.echellex(this.time);
        let y = this.graph.echelley(data[dataName])

        this.line
            .attr('x1', x)
            .attr('x2', x)
        ;

        this.el
            .attr('cx', x)
            .attr('cy', y)
        ;

        this.txt
            .attr('x', x + 5)
            .attr('y', y)
            .text(fmt(this.data[this.dataName], 2))
        ;
    }

    redraw() {
        let x = this.graph.echellex(this.time);
        let y = this.graph.echelley(this.data[this.dataName])

        this.line
            .attr('x1', x)
            .attr('y1', this.graph.margeH)
            .attr('x2', x)
            .attr('y2', this.graph.height - this.graph.margeB);

        this.el
            .attr('cx', x)
            .attr('cy', y)
        ;

        this.txt
            .attr('x', x + 5)
            .attr('y', y)
        ;
    }

    remove () {
        this.cursG.remove();
    }
}
