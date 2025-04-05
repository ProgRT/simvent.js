import {display} from "./animatedDisplay.js";
import {basicPannel} from "./pannel.js";
import {dialog} from './utils.js';
import {senario} from '../senario.js';

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

        this.toolbar = document.querySelectorAll("nav div")[2];

        this.disp = new display({
            target: this.dispTarget,
            debugMode: this.debugMode
        });

        this.pannel = new basicPannel();
        this.pannel.container.onchange = ()=>this.update();

        this.pushNewData();
 

        this.modal = new dialog({
            toolbar: this.toolbar,
            title: "Tâches",
            icon: "Carnet"
        });

        this.modal.setContent(senarioTable(senario));

        //--------------------------//
        // New data generation loop //
        //--------------------------//

        this.ventIntID = setInterval(()=>{

            // this.disp.data are data that have not
            // been plotted yet
            // console.log(this.disp.data.length);

            if (this.disp.data.length < this.minData) {
                this.pushNewData();
            }
        }, this.ventIntDur);
    }

    pushNewData () {
        this.update();
        //if (this.debugMode) this.newDataMsg();
        const nDat = this.vent.ventilate(this.lung).timeData;
        this.disp.push(nDat);
        
        // -----------------------------------------
        // Let's check if a task have been completed 
        // -----------------------------------------

        let ongoing = senario.filter(t=>!t.completed);
        if (ongoing.length == 0) return;

        let task = ongoing[0];

        if(this.debugMode) this.taskCheckMsg(task);
        task.completed = task.test([], this.vent, this.lung);

        if (task.completed) {
            this.modal.setContent(senarioTable(senario));
            this.modal.showModal();
        }
    }

    update () {
        let time = this.vent ? this.vent.time : 0;
        this.vent = this.pannel.ventCtl.obj;
        this.vent.time = time;
		if(this.vent.Fconv){this.vent.Tvent = 60 / this.vent.Fconv};
        this.minData = this.minDatDur /this.vent.Tsampl;
        this.lung = this.pannel.lungCtl.obj;
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

function senarioTable (senario) {

    let completed = senario.filter(t=>t.completed);
    let ongoing = senario.filter(t=>!t.completed);

    let table = document.createElement('table');
    let row = document.createElement('tr');
    row.innerHTML = `<th>Tâche</th><th>Statut</th>`;
    table.append(row);

    for (let n in completed) {
        let task = completed[n];

        let row = document.createElement('tr');
        row.innerHTML = `<td>
        <details ${n == (completed.length - 1) ? 'open':null}>
        <summary>${task.title}</summary>
        ${task.instructions}
        </details>
        </td>
            <td>✓</td>`;
        table.append(row);
    }

    if(ongoing.length > 0){
        let task = ongoing[0];
        let lastRow = document.createElement('tr');
        lastRow.innerHTML = `<td>
    <details open>
        <summary>${task.title}</summary>
        ${task.instructions}
    </details>
</td>
<td></td>`;
        table.append(lastRow);
    }

    return table;
}
