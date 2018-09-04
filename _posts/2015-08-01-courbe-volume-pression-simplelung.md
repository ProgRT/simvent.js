---
title: Courbe pression-volume du modèle sv.SimpleLung
---

<svg id="svg1{{ page.id | replace: "/", "" }}" class="square"></svg>

<script>

	var lung = new sv.SimpleLung();
	/*
	var ventilator = new sv.PresureControler();
	ventilator.nbcycles = 3;
*/
	var ventilator = new sv.PVCurve();
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.Palv};
	fy1 = function(d){return d.Vt};


	var graph1 = new gs.quickGraph( "#svg1{{ page.id | replace: "/", "" }}", data.timeData, fx, fy1)
		.setidx("Palv")
		.setidy("Vt");


</script>