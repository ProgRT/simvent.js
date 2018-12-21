---
title: 'Ventilateur VDR-4: Augmentation des résistances'
---

<figure style='display: inline-block; width:49%'>
<script>

	var lung1 = new sv.SimpleLung();
	var vent = new sv.VDR();
	vent.Fiph = 1.0;
	vent.CPR=0;
	vent.Tvent = 6;
	vent.lpop = 6;
  vent.Fperc = 300;

	var d1 = vent.ventilate(lung1);

	fx = function(d){return d.time};
	fy2 = function(d){return d.Pao};


	var gr1 = new gs.graph(null);

</script>
<figcaption>Raw = 5 cmH₂O/l/s</figcaption>
</figure>

<figure style='display: inline-block; width:49%'>
<script>

	var lung = new sv.SimpleLung();
	lung.Raw = 15;
	vent.time = 0;
	var data = vent.ventilate(lung);

	var gr2 = new gs.graph( null);
	gr2.setscale(data.timeData, fx, fy2)
	.tracer(data.timeData, fx, fy2)
	.setidx("Temps (s)")
	.setidy("Pression (cmH₂O)");

</script>
<figcaption>Raw = 15 cmH₂O/l/s</figcaption>
</figure>

<script>
	  gr1.setscale(data.timeData, fx, fy2)
	  .tracer(d1.timeData, fx, fy2)
		.setidx("Temps (s)")
		.setidy("Pression (cmH₂O)");
</script>
