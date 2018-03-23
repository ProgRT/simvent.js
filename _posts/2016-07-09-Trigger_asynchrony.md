---
title: Trigger asynchrony
---
<svg id="svg1{{ page.id | replace: "/", "" }}" class="graphcurve surface"></svg>
<svg id="svg2{{ page.id | replace: "/", "" }}" class="graphcurve surface"></svg>

<script>

	var lung = new sv.SptLung();
	lung.Raw = 25;
	lung.Pmax=4;
	lung.Fspt=40;

	var ventilator = new sv.PressureAssistor();
	ventilator.nbcycles=3;
	ventilator.Cycling=30;
	ventilator.Passist=15;
	ventilator.Ftrig=0.05;	

	var data = ventilator.ventilate(lung).timeData;

	fx = function(d){return d.time};
	fy1 = function(d){return d.Flung};
	fy2 = function(d){return d.PCO2};

	var graph1 = gs.quickGraph( "#svg1{{ page.id | replace: "/", "" }}", data, fx, fy1)
		.setidx("Time")
		.setidy("Flung");

	var graph2 = gs.quickGraph( "#svg2{{ page.id | replace: "/", "" }}", data, fx, fy2)
		.setidx("Time")
		.setidy("PCO₂");
</script>
