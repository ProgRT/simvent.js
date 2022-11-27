---
title: Courbe débit-temps d'une ventilation en débit contrôlé
---

<script>

	var lung = new sv.SimpleLung();
	lung.Raw = 10;

	var ventilator = new sv.FlowControler();
	var data = ventilator.ventilate(lung).timeData;

	fx = function(d){return d.time};
	fy1 = function(d){return d.Flung};

	var graph1 = gs.quickGraph( null, data, fx, fy1)
		.setidx("Time")
		.setidy("Flung");

</script>
