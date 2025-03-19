import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";

export class simulator {
    static defaults = {
        dispTarget: document.body,
        animate: false
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        this.disp = new display({target: this.dispTarget});
        this.pannel = new basicPannel();
        this.pannel.container.onchange = ()=>this.update();
        this.update();
    }

    update () {
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = 0;
        this.lung = this.pannel.lungCtl.obj;
        this.data = this.vent.ventilate(this.lung).timeData;
        if (this.animate) {
            this.disp.animate(this.data);
        }
        else this.disp.display(this.data);
    }
}

