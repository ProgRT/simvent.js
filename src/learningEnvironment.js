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
        minData: 1,
        numData: ['Ppeak', 'Vt'],
        scnConf: null,
        debug: [
            //'dataGenTime'
        ]
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        let panCnf = {
            lungControl: this.scnDesc == null,
            vent: this.scenario && this.scenario.vent?this.scenario.vent:null,
            target: this.dispTarget
        }

        this.pannel = new basicPannel(panCnf);
        this.pannel.container.onchange = ()=>this.update();


        this.disp = new display({
            target: this.dispTarget,
            toolbar: this.toolbar,
            debugMode: this.debugMode,
            datasets: this.datasets,
            numData: this.numData
        });
        
        //--------------------------//
        // New data generation loop //
        //--------------------------//

        this.pushNewData();
        this.ventIntID = setInterval(()=>{

            // this.disp.data are data that have not
            // been plotted yet

            if (this.disp.data.length < this.minData) {
                this.pushNewData();
            }
        }, this.ventIntDur);

        this.disp.start();
    }

    pushNewData () {
        this.update();
        let tStart = new Date();

        const nDat = this.vent.ventilate(this.lung).timeData;
        

        this.disp.push(nDat);

        let tEnd = new Date();
        if(this.debug.includes('dataGenTime')) console.log(`Nouvelles données générées en ${tEnd - tStart}`);
        
        // -----------------------------------------
        // Let's check if a task have been completed 
        // -----------------------------------------

        if(this.scenario && this.scenario.ongoing){
            //let dat = [...this.disp.grData, ...this.disp.data];
            let dat = [...this.disp.grData];
            let nCompl = this.scenario.check(dat, this.vent, this.lung);
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

        this.progressIndicator.max = this.scenario.tasks.length;
        this.progressIndicator.value = this.scenario.completed.length;
        closeCompletedTasks();
    }

    update() {
        let time = this.vent ? this.vent.time : 0;
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = time;
		if(this.vent.Fconv){this.vent.Tvent = 60 / this.vent.Fconv};

        this.minData = this.minDatDur /this.vent.Tsampl;
        if(this.pannel.lungCtl) this.lung = this.pannel.lungCtl.obj;
    }

    loadScenario(scnDesc) {
        this.pannel.remove();
        if(this.modal) this.modal.remove();
        
        this.scenario = new scenario(scnDesc);
        this.lung = this.scenario.lung;

        this.modal = new dialog({
            toolbar: this.toolbar,
            title: this.scenario.title,
            id: 'tasks',
            icon: "Carnet"
        });
        this.modal.btnOpen.classList.add("highlight");

        this.progressIndicator = document.createElement('progress');
        this.modal.footer.append(this.progressIndicator);
        this.updateModal();

        let panCnf = {
            lungControl: false,
            vent: this.scenario && this.scenario.vent?this.scenario.vent:null,
            target: this.dispTarget
        }

        this.pannel = new basicPannel(panCnf);
        this.pannel.container.onchange = ()=>this.update();
    }

    newDataMsg () {
        console.log(`Time: ${this.vent.time}`);
    }
}
