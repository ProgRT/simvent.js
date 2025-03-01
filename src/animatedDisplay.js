import {graph} from "./moovingGraph.js";

export class display {

    static defaults = {

		debugMode: false,
        displayRemaining: false,
		timePerScreen: 12,
		Tsampl: 20,
		graphLoopInt: 20,
		target: d3.select(document.body),
		datasets: ['Pao', 'Flung', 'PCO2'],
    };
   
	constructor(conf=null){

        conf = {...display.defaults, ...conf};
        for (let param in conf) this[param] = conf[param];

		this.data = [];
		this.grData = [];
		this.graphStack = [];
		this.tStart = 0;

		for(var ds of this.datasets){
			let gr = new graph(ds, this.timePerScreen, this.target);
			this.graphStack.push(gr);
		}

        window.onresize = ()=>this.redraw();
	}

    animate (data) {
        let dur = d3.max(data, d=>d.time);
        this.timePerScreen = dur;
        for(const g of this.graphStack){
            g.timePerScreen = dur;
            g.setXscale();
        }
        let Tsampl = data[1].time - data[0].time;
		this.pointsPerScreen = this.timePerScreen / Tsampl;
		this.ptPerMs = .001 / Tsampl
        this.data = data;
        this.setYscale();
        this.tStart = this.data[0].time;
        for(const g of this.graphStack){
            g.tStart = this.tStart;
            g.coord = '';
        }
        this.grData = [];
        this.start();
    }

    clearGraphs () {
        for(const g of this.graphStack) {
            g.coord = '';
            g.path.attr('d', g.coord);
        }
    }

	setYscale(){
        let dat = [...this.data, ...this.grData];

        if(dat.length == 0){
            this.stop();
            throw new Error("setYscale: Plus de données disponible");
        }

		for(const g of this.graphStack){
			g.setYscale(dat);
			g.drawGradY();
			g.drawGradX();
			g.setNLf();
		}
	}

    push (data) {
        let Tsampl = data[1].time - data[0].time;
		this.pointsPerScreen = this.timePerScreen / Tsampl;

		this.ptPerMs = .001 / Tsampl
        this.data = [...this.data, ...data];

        this.setYscale();
        if (this.grData.length > 0) this.redraw();
        if (!this.graphInt) this.start();
    }

    display (data) {
        this.grData = data;
        for (let g of this.graphStack) g.timePerScreen = d3.max(this.grData, d=>d.time);
        this.redraw();
    }

	redraw(){
		let scalingData = [...this.data, ...this.grData];

		if(scalingData.length == 0){
			this.stop();
            return;
			//throw new Error("Plus de données disponible");
		}

		for(var g of this.graphStack){
			g.redraw(scalingData, this.grData);
		}
	}

	graphLoop(){

		if(this.data.length == 0){
            if (this.debugMode) {console.log("No more data")};
            this.stop();
            return 0;
		}

        // At this point, we have filled the graph. It is
        // time to clear and restart at 0 seconds

		if(this.grData.length >= this.pointsPerScreen){
           
			if(this.logPlotTime == true){
				this.loopEndTime = new Date().getTime();
				this.loopDuration = this.loopEndTime - this.loopStartTime;
                let loopTimeSec = this.loopDuration/1000;
                let msg = this.timePerScreen + 's plotted in ' + loopTimeSec  +'s';
				console.log(msg);
			}

			this.loopStartTime = new Date().getTime();


			this.tStart = this.data[0].time;
			for(const g of this.graphStack){
				g.tStart = this.tStart;
				g.coord = '';
			}
			this.grData = [];
		}

		while(this.grData.length < this.targNPts && this.data.length > 0){
            this.grData.push(this.data.shift());
            for(var g of this.graphStack) g.updateCoord(this.grData);
		}

		for (let gr of this.graphStack) gr.path.attr('d', gr.coord);
	}

    // Number of points thad should have been plotted at this time
    get targNPts() {
        return Math.floor(this.timeInLoop * this.ptPerMs)
    };

    // Time since last time plot started from zero sec onthe screen
    get timeInLoop() {return new Date().getTime() - this.loopStartTime};

	start(){
        if(this.graphInt) clearInterval(this.graphInt);
		this.loopStartTime = new Date().getTime();
		this.graphInt = setInterval(()=>this.graphLoop(), this.graphLoopInt);
	}

	stop(){
		clearInterval(this.graphInt);
        this.graphInt = null;
	}
}
