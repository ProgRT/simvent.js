import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";
import {dialog} from './utils.js';
import {translate} from './translate.js';
import {scenario, scenarioTable, closeCompletedTasks} from './scenario.js';

export class simulator {
    static defaults = {
        dispTarget: document.body,
        debugMode: false,
        ventIntDur: 500,
        minDatDur: 3,
        minData: 1
    }

    constructor (parameters=null) {
        let params = {...simulator.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

        if(this.scnDesc){
            this.scenario = new scenario(this.scnDesc);
            this.lung = this.scenario.lung;
        };

        this.toolbar = document.querySelectorAll("nav div")[2];

        this.disp = new display({
            target: this.dispTarget,
            debugMode: this.debugMode
        });

        this.pannel = new basicPannel(
            {
                lungControl: this.scenario == null,
            }
        );
        this.pannel.container.onchange = ()=>this.update();


        if(this.scenario){
            this.modal = new dialog({
                toolbar: this.toolbar,
                title: this.scenario.title,
                id: 'tasks',
                icon: "Carnet"
            });

            this.updateModal();
        }

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
            let task = this.scenario.ongoing;

            if(this.debugMode) this.taskCheckMsg(task);
            task.completed = task.test(nDat, this.vent, this.lung);

            if (task.completed) {
                if(task.resultFn) {
                    task.result = task.resultFn(nDat, this.vent, this.lung);
                }
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

    taskCheckMsg (task) {
        let msg = `Tache: ${task.title}
Résultat: ${task.test([], this.vent, this.lung)}`;
        console.log(msg);
    }

}
