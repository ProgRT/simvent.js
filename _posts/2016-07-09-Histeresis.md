---
title: Histérèse de la courbe pression-volume de poumon
---
<svg id="svg1{{ page.id | replace: "/", "" }}" class="square"></svg>

	var lung = new sv.RLung();
	var ventilator = new sv.PVCurve();

	var data = ventilator.ventilate(lung).timeData;

	fx = function(d){return d.Palv};
	fy2 = function(d){return d.Vt};


	var graph = gs.quickGraph( "#svg1{{ page.id | replace: "/", "" }}", data, fx, fy2)
		.setidx("Pressure")
		.setidy("Volume");

<script>

	var lung = new sv.RLung();
	var ventilator = new sv.PVCurve();

	var data = ventilator.ventilate(lung).timeData;

	fx = function(d){return d.Palv};
	fy2 = function(d){return d.Vt};


	var graph = gs.quickGraph( "#svg1{{ page.id | replace: "/", "" }}", data, fx, fy2)
		.setidx("Pressure")
		.setidy("Volume");

</script>
