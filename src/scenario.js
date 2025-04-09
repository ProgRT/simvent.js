import {SimpleLung} from './simvent-lungs.js';
import {translate} from './translate.js';

export class scenario {

    static defaults = {
        lung: new SimpleLung()
    }

    constructor(scnDesc){
        let params = {...scenario.defaults, ...scnDesc};
        for (let p in params) this[p] = params[p];
    }

    get ongoing() {
        return this.tasks.filter(t=>!t.completed)[0];
    }

    get completed() {
        return this.tasks.filter(t=>t.completed);
    }
}

export function scenarioTable (scenario) {

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Tâche</th><th>Statut</th></tr>`;
    table.append(thead);

    let tbCompleted = document.createElement('tbody');
    tbCompleted.className = 'completed';
    table.append(tbCompleted);
    if(scenario.completed.length > 0){
        tbCompleted.innerHTML = `<tr><th colspan=2>${translate('Completed tasks')}</th></tr>`;
    }

    let tbOngoing = document.createElement('tbody');
    tbOngoing.className = 'ongoing';
    table.append(tbOngoing);
    if(scenario.ongoing){
        tbOngoing.innerHTML = `<tr><th colspan=2>${translate('Ongoing tasks')}</th></tr>`;
    }


    for (let n in scenario.completed) {
        let task = scenario.completed[n];

        let row = taskRow(task);
        tbCompleted.append(row);
    }

    if(scenario.ongoing){
        let task = scenario.ongoing;
        tbOngoing.append(taskRow(task));
    }

    return table;
}

export function closeCompletedTasks(){
    let cBody = document.querySelector('tbody.completed');
    let dtails = cBody.querySelectorAll('tr:not(:last-child) details');
    dtails.forEach(d=> d.open = false);
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

function taskDesc (task) {
    let details = document.createElement('details');
    details.open = true;
    details.innerHTML = `<summary>${task.title}</summary>
        ${task.instructions}`;
    if (task.completed && task.result) details.append(task.result);
    return details;
}
