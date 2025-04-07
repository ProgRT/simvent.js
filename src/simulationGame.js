import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";
import {dialog} from './utils.js';

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
                title: "Tâches",
                id: 'tasks',
                icon: "Carnet"
            });

            this.modal.setContent(scenarioTable(this.scenario));
            this.lung = this.scenario.tasks[0].lung;
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
            task.completed = task.test([], this.vent, this.lung);

            if (task.completed) {
                if(task.resultFn) {
                    task.result = task.resultFn([], this.vent, this.lung);
                }
                this.modal.setContent(scenarioTable(this.scenario));
                this.modal.showModal();
            }
        }
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

function scenarioTable (scenario) {

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Tâche</th><th>Statut</th></tr>`;
    table.append(thead);

    for (let n in scenario.completed) {
        let task = scenario.completed[n];

        let row = taskRow(task);
        table.append(row);
    }

    if(scenario.ongoing){
        let task = scenario.ongoing;
        table.append(taskRow(task));
    }

    return table;
}

class scenario {
    constructor(scnDesc){
        //let params = {...simulator.defaults, ...parameters};
        for (let p in scnDesc) this[p] = scnDesc[p];
    }

    get ongoing() {
        return this.tasks.filter(t=>!t.completed)[0];
    }

    get completed() {
        return this.tasks.filter(t=>t.completed);
    }
}

function taskDesc (task) {
    let details = document.createElement('details');
    details.open = true;
    details.innerHTML = `<summary>${task.title}</summary>
        ${task.instructions}`;
    if (task.completed && task.result) details.append(task.result);
    return details;
}

function taskRow (task) {
    let row = document.createElement('tr');
    let tdDesc = document.createElement('td');
    tdDesc.appendChild(taskDesc(task));
    let tdState = document.createElement('td');

    //if(task.completed) tdState.append('✓');
    if(task.completed) tdState.append('Fait');

    row.appendChild(tdDesc);
    row.appendChild(tdState);
    return row;
}
