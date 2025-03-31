import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";

export class simulator {
    static defaults = {
        dispTarget: document.body,
        debugMode: false,
        ventIntDur: 10,
        minDatDur: 3
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        this.disp = new display({target: this.dispTarget, debugMode: this.debugMode});
        this.pannel = new basicPannel();
        this.pannel.container.onchange = ()=>this.update();
        this.update();

        this.ventIntID = setInterval(()=>{

            let nptDat = this.disp.data;
            if (nptDat.length < this.minData) {
                this.update();
                const nDat = this.vent.ventilate(this.lung).timeData;
                this.disp.push(nDat);
            }
        }, this.ventIntDur);

        this.disp.start();
    }

    update () {
        let time = this.vent ? this.vent.time : 0;
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = time;
		if(this.vent.Fconv){this.vent.Tvent = 60 / this.vent.Fconv};
        this.minData = this.minDatDur /this.vent.Tsampl;
        this.lung = this.pannel.lungCtl.obj;
    }

}

