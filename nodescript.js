#!/usr/bin/node
//import * as vent from './src/simvent-ventilators.mjs'
//import * as lung from './src/simvent-lungs.mjs'
import * as sv from './src/simvent.js'

const l = new sv.SimpleLung();
const v = new sv.PressureControler();

var data = v.ventilate(l);
console.log(data)
