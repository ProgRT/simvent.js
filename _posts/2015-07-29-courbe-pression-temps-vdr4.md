---
title: Courbe pression-temps du ventilateur VDR-4
---

<script>

	var lung = new sv.SimpleLung();
	var ventilator = new sv.VDR();
	ventilator.CPR=0;
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.time};
	fy2 = function(d){return d.Pao};


	var graph = gs.quickGraph( null, data.timeData, fx, fy2).setidx("Time").setidy("Presure");

</script>
