import * as simventVents from "./simvent-ventilators.js";
import * as simventLungs from "./simvent-lungs.js";
import {makeSwipable} from "./swipe.js";
import {icon, button} from "./utils.js";

export class basicPannel {

    static defaults = {
        debugMode: false,
        target: document.body,
        startVentModel: "FlowControler",
        startLungModel: "SimpleLung"
    };

    constructor (parameters=null) {
        let params = {...basicPannel.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

		this.container = document.createElement('div');
		this.container.id = 'fpPanel';
		this.container.classList.add('hidden');
		this.target.appendChild(this.container);
        makeSwipable("#fpPanel");

        this.lung = new simventLungs[this.startLungModel]();
        this.vent = new simventVents[this.startVentModel]();

        this.ventCtl = new objControl({
            title: "Ventilator",
            icon: "Souflet",
            target: this.container,
            constructors: simventVents,
            paramList: "ventParams",
            obj: this.vent
        });

        this.lungCtl = new objControl({
            title: "Lung",
            icon: "PoumonsAvecBronches",
            target: this.container,
            constructors: simventLungs,
            paramList: "mechParams",
            obj: this.lung
        });

        this.toolbar = document.querySelectorAll("nav div")[2];

        let btn = button({
            icon: "Sliders", 
            label: "togglePannel",
            title: "Panneau de contrôle",
            callback: ()=>{
                console.log("Allo");
                let pannel = document.querySelector("#fpPanel");
                pannel.classList.toggle("hidden");
            }
        })

        this.toolbar.appendChild(btn);
    }

}

export class objControl {
    
    constructor (parameters) {
        
        let target = parameters.target;
        let title = parameters.title;
        let constructors = parameters.constructors;
        let optList = parameters.optList || Object.keys(constructors);
        this.obj = parameters.obj || new constructors[optList[0]]();
        this.icon = parameters.icon || null;
        let paramList = parameters.paramList;

		this.container = document.createElement('div');
		target.appendChild(this.container);

        this.modelMenu = modelMenu(optList, evt=>{
            let selected = evt.target.value; 
            this.obj = new constructors[selected]();
            this.paramTable.remove();
            this.paramTable = paramTable(this.obj, paramList);
            this.container.appendChild(this.paramTable);
        });
        this.modelMenu.value = this.obj.constructor.name;

        this.paramTable = paramTable(this.obj, paramList);

        this.container.appendChild(sectionTitle(title, this.icon));
        this.container.appendChild(this.modelMenu);
        this.container.appendChild(this.paramTable);
    }
}

function sectionTitle(content, iconName=null){
    var title = document.createElement("h2");
    title.textContent = content;

    if(iconName){
        title.insertAdjacentElement('afterbegin', icon(iconName));
    }

    title.classList.add("fpPanelTitle");
    title.classList.add(content.toLowerCase());

    return title;
}

function modelMenu(list, callback){
    let select = document.createElement("select");
    select.onchange = callback;

    for (var vent of list){
        var option = document.createElement("option");
        option.value = vent;
        option.textContent = vent;
        select.appendChild(option);
    }
    return select;
}

function paramTable(object, paramSet) {
    let pset = object.__proto__.constructor[paramSet];
    let calculated = pset.filter(p=>p.calculated == true);
    var table = document.createElement('table');

    for(var p of object.__proto__.constructor[paramSet]){
        var tr = document.createElement('tr');
        table.appendChild(tr);

        // Parameter name cell

        var td = document.createElement('td');
        //td.title = fp.translate1(id, "long");
        td.title = p.id;
        td.textContent = p.id + ' :';
        tr.appendChild(td);

        // input or value cell
        var td = document.createElement('td');
        td.className = 'data';

        if (p.calculated == true){
            let value = object[p.id].toFixed(1);
            var dataSpan = document.createElement('span');
            dataSpan.id = 'data' + p.id;
            dataSpan.textContent = value;
            td.appendChild(dataSpan);
        }
        else{
            var input = document.createElement('input');
            input.id = 'input' + p.id;
            input.name = p.id;
            input.value = object[p.id];
            input.type = 'number';
            input.min = 0;
            input.step = p.step;
            input.onfocus = function(){this.select()};

            input.onchange = (evt)=>{
                object[evt.target.name] = parseFloat(evt.target.value);
                for(var param of calculated){
                    document.querySelector('#data' + param.id)
                        .textContent = object[param.id].toFixed(1);
                }
            };

            td.appendChild(input);
        }
        tr.appendChild(td);

        // Parameter unit cell
        var td = document.createElement('td');
        td.className = 'unit';
        td.textContent = p.unit;
        tr.appendChild(td);

        // Push the row to the table
        table.appendChild(tr);
    }
    return table;
}

