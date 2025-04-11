import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";
import {dialog} from './utils.js';
import {translate} from './translate.js';
import {scenario, scenarioTable, closeCompletedTasks} from './scenario.js';

export class simulator {
    static defaults = {
        dispTarget: document.body,
        toolbar: document.querySelector('#rightControls'),
        debugMode: false,
        ventIntDur: 500,
        minDatDur: 3,
        minData: 1
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        this.disp = new display({
            target: this.dispTarget,
            toolbar: this.toolbar,
            debugMode: this.debugMode
        });

        if(this.scnDesc){
            this.scenario = new scenario(this.scnDesc);
            this.lung = this.scenario.lung;

            this.modal = new dialog({
                toolbar: this.toolbar,
                title: this.scenario.title,
                id: 'tasks',
                icon: "Carnet"
            });

            this.updateModal();
        };

        let panCnf = {
            lungControl: this.scenario == null,
            vent: this.scenario && this.scenario.vent?this.scenario.vent:null,
        }
        this.pannel = new basicPannel(panCnf);
        this.pannel.container.onchange = ()=>this.update();

        //--------------------------//
        // New data generation loop //
        //--------------------------//

        this.pushNewData();
        this.ventIntID = setInterval(()=>{

            // this.disp.data are data that have not
            // been plotted yet
            // console.log(this.disp.data.length);

            if (this.disp.data.length < this.minData) {
                this.pushNewData();
            }
        }, this.ventIntDur);

        this.disp.start();
    }

    pushNewData () {
        this.update();
        //if (this.debugMode) this.newDataMsg();
        const nDat = this.vent.ventilate(this.lung).timeData;
        this.disp.push(nDat);
        
        // -----------------------------------------
        // Let's check if a task have been completed 
        // -----------------------------------------

        if(this.scenario && this.scenario.ongoing){
            let nCompl = this.scenario.check(nDat, this.vent, this.lung);
            if (nCompl) {
                this.lung = this.scenario.lung;
                this.updateModal();
                this.modal.showModal();
            }
        }
    }

    updateModal(){
        this.modal.content.innerHTML = null;
        this.modal.content.innerHTML = this.scenario.intro;
        this.modal.content.append(scenarioTable(this.scenario));
        closeCompletedTasks();
    }

    update () {
        let time = this.vent ? this.vent.time : 0;
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = time;

		if(this.vent.Fconv){this.vent.Tvent = 60 / this.vent.Fconv};
        this.minData = this.minDatDur /this.vent.Tsampl;
        if(this.pannel.lungCtl) this.lung = this.pannel.lungCtl.obj;
    }

    newDataMsg () {
        console.log("Generating new data");
        console.log(`Time: ${this.vent.time}`);
    }
}
