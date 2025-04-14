import {SimpleLung} from './simvent-lungs.js';
import {translate} from './translate.js';

export class scenario {

    static defaults = {
        lung: new SimpleLung()
    }

    constructor(scnDesc){
        let params = {...scenario.defaults, ...scnDesc};
        for (let p in params) this[p] = params[p];

        this._tasks = this.tasks.map(t=>new task(t));
    }

    check(dat, vent, lung){
        if(this.ongoing){
            let task = this.ongoing;
            task.check(dat, vent, lung);

            if (task.completed && this.ongoing  && this.ongoing.lung) {
                this.lung = this.ongoing.lung;
            }
            return task.completed;
        }
        else return false;
    }

    get ongoing() {
        return this._tasks.filter(t=>!t.completed)[0];
    }

    get completed() {
        return this._tasks.filter(t=>t.completed);
    }
}

class task {
    static defaults = {
        lung: new SimpleLung(),
        resultFn: ()=>null
    }

    constructor(taskDesc){
        let params = {...task.defaults, ...taskDesc};
        for (let p in params) this[p] = params[p];
    }

    check(d, v, l){
        this.completed = this.test(d, v, l);
        if(this.completed) this.result = this.resultFn(d, v, l);
    }
}

export function scenarioTable (scenario) {

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Tâche</th><th>Statut</th></tr>`;
    table.append(thead);

    if(scenario.completed.length > 0){
        let tbCompleted = document.createElement('tbody');
        tbCompleted.className = 'completed';
        table.append(tbCompleted);
        //tbCompleted.innerHTML = `<tr><th colspan=2>
        //${translate('Completed tasks')}
        //</th></tr>`;

        for (let n in scenario.completed) {
            let task = scenario.completed[n];

            let row = taskRow(task);
            tbCompleted.append(row);
        }
    }

    if(scenario.ongoing){
        let tbOngoing = document.createElement('tbody');
        tbOngoing.className = 'ongoing';
        table.append(tbOngoing);
        //let h = `<tr><th colspan=2>
        //  ${translate('Ongoing tasks')}
        //  </th></tr>`;
        //tbOngoing.innerHTML = h; 

        let task = scenario.ongoing;
        tbOngoing.append(taskRow(task));
    }

    return table;
}

export function closeCompletedTasks(){
    let selector = 'tbody.completed tr:not(:last-child) details';
    let dtails = document.querySelectorAll(selector);
    dtails.forEach(d=> d.open = false);
}

function taskRow (task) {
    let row = document.createElement('tr');
    let tdDesc = document.createElement('td');
    tdDesc.appendChild(taskDesc(task));
    let tdState = document.createElement('td');

    //if(task.completed) tdState.append('✓');
    if(task.completed) tdState.append('✓');

    row.appendChild(tdDesc);
    row.appendChild(tdState);
    return row;
}

function taskDesc (task) {
    let details = document.createElement('details');
    details.open = true;
    details.innerHTML = `<summary>${task.title}</summary>
        ${task.instructions}`;
    if (task.completed && task.result) details.append(task.result);
    return details;
}
