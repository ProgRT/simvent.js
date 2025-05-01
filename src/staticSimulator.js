import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";

export class simulator {
    static defaults = {
        dispTarget: document.body,
        toolbar: document.querySelector("#rightControls"),
        animate: false,
        numData: [],
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        this.pannel = new basicPannel({target: this.dispTarget});
        this.pannel.container.onchange = ()=>this.update();
        this.disp = new display({
            target: this.dispTarget,
            toolbar: this.toolbar,
            numData: this.numData
        });
        this.update();
    }

    update () {
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = 0;
        this.lung = this.pannel.lungCtl.obj;
        this.data = this.vent.ventilate(this.lung).timeData;
        if (this.animate) {
            console.log("Animating new data");
            this.disp.animate(this.data);
        }
        else {
            console.log("Displaying new data");
            this.disp.display(this.data);
        }
    }
}

