---
title: Capnogramme pression-temps
---

<script>

	var lung = new sv.SimpleLung();
	lung.Raw = 10;

	var ventilator = new sv.FlowControler();
	ventilator.Ti = 2;
	var data = ventilator.ventilate(lung).timeData;

	fx = function(d){return d.time};
	fy1 = function(d){return d.PCO2};
	fy2 = function(d){return d.Flung};

	var graph1 = gs.quickGraph( null, data, fx, fy1)
		.setidx("Time")
		.setidy("PCO2");

	var graph2 = gs.quickGraph( null, data, fx, fy2)
		.setidx("Time")
		.setidy("Flung");
</script>
