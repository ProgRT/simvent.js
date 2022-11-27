---
title: Courbe pression-temps d'une ventilation en pression contrôlée
---
<script>
var lung = new sv.SimpleLung();
var ventilator = new sv.PressureControler();
var data = ventilator.ventilate(lung);

fx = function(d){return d.time};
fy2 = function(d){return d.Flung};

var graph = gs.quickGraph(null, data.timeData, fx, fy2).setidx("Time").setidy("Flow");
</script>
