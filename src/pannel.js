import * as simventVents from "./simvent-ventilators.js";
import * as simventLungs from "./simvent-lungs.js";
//import {makeSwipable} from "./swipe.js";
import {icon, button} from "./utils.js";
import {translate} from './translate.js';

export class basicPannel {

    static defaults = {
        debugMode: false,
        target: document.body,
        toolbar: document.querySelector("#rightControls"),
        startVentModel: "FlowControler",
        startLungModel: "SimpleLung",
        lungControl: true
    };

    constructor (parameters=null) {
        let params = {...basicPannel.defaults, ...parameters};
        for (let p in params) this[p] = params[p];

		this.container = document.createElement('div');
		this.container.id = 'fpPanel';
		this.container.classList.add('hidden');
        this.container.onmouseleave = ()=>{
            this.container.classList.add('hidden');
        };
		this.target.appendChild(this.container);
        //makeSwipable("#fpPanel");

        this.lung = new simventLungs[this.startLungModel]();
        if(!this.vent){
            this.vent = new simventVents[this.startVentModel]();
        }

        this.ventCtl = new objControl({
            title: 'Ventilator',
            icon: "Souflet",
            target: this.container,
            constructors: simventVents,
            paramList: "ventParams",
            obj: this.vent
        });

        if(this.lungControl){
            this.lungCtl = new objControl({
                title: 'Lung',
                icon: "PoumonsAvecBronches",
                target: this.container,
                constructors: simventLungs,
                paramList: "mechParams",
                obj: this.lung
            });
        }

        //this.toolbar = document.querySelectorAll("nav div")[2];

        let btn = button({
            icon: "Sliders", 
            label: "togglePannel",
            title: 'Control pannel',
            key: 'p',
            callback: ()=>{
                let pannel = document.querySelector("#fpPanel");
                pannel.classList.toggle("hidden");
            }
        })

        this.toolbar.appendChild(btn);
    }

}

export class objControl {
    
    constructor (p) {
        
        let optList = p.optList || Object.keys(p.constructors);
        this.obj = p.obj || new p.constructors[optList[0]]();
        this.icon = p.icon || null;

        this.container = pannelDiv(p.title, this.icon);
		p.target.appendChild(this.container);

        this.modelMenu = modelMenu(optList, evt=>{
            let selected = evt.target.value; 
            this.obj = new p.constructors[selected]();
            this.paramTable.remove();
            this.paramTable = paramTable(this.obj, p.paramList);
            this.container.appendChild(this.paramTable);
        });
        this.modelMenu.value = this.obj.constructor.name;

        this.paramTable = paramTable(this.obj, p.paramList);

        this.container.appendChild(this.modelMenu);
        this.container.appendChild(this.paramTable);
    }
}

export function pannelDiv(title, iconName=null){

		let container = document.createElement('details');
        let t = sectionTitle(title, iconName);
        container.appendChild(t);
        container.open = true;

        return container;
}

export function sectionTitle(content, iconName=null){
    let title = document.createElement("summary");
    title.textContent = translate(content);

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

    for (var mod of list){
        var option = document.createElement("option");
        option.value = mod;
        option.textContent = translate(mod);
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
        td.innerHTML = `<label for='input${p.id}'>${translate(p.id)} :</label>`;
        tr.appendChild(td);

        // input or value cell
        var td = document.createElement('td');
        td.className = 'data';

        if (p.calculated == true){
            let value = object[p.id].toLocaleString(navigator.language);
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
            input.min = p.min;
            input.step = p.step;
            input.onfocus = function(){this.select()};

            input.onchange = (evt)=>{
                object[evt.target.name] = parseFloat(evt.target.value);
                for(var param of calculated){
                    document.querySelector('#data' + param.id)
                        .textContent = object[param.id].toLocaleString(navigator.language, {maximumFractionDigits: 1});
                }
            };

            td.appendChild(input);
        }
        tr.appendChild(td);

        // Parameter unit cell
        var td = document.createElement('td');
        td.className = 'unit';
        td.innerHTML = `<small>${p.unit}</small>`;
        //td.textContent = p.unit;

        tr.appendChild(td);

        // Push the row to the table
        table.appendChild(tr);
    }
    return table;
}

