---
title: 'VDR-4: Pression motrice'
---

<script>

	var lung = new sv.SimpleLung();
	var vent = new sv.VDR();
	var data = vent.ventilate(lung).timeData.filter(function(d){return d.time > 1 && d.time < 9});

	fx = function(d){return d.time};
	fy = function(d){return d.Pao};

	var meani = d3.mean(data.filter(d=>d.time>3 && d.time<4), fy);
	var meane = d3.mean(data.filter(d=>d.time>5 && d.time<6), fy);
	var vectx = 5.54;

	var graph = gs.quickGraph( null, data, fx, fy, {class: 'thinPath'})
	.setidx("Temps")
	.setidy("Pression")
	.pointy(meani)
	.pointy(meane)
	.vecteur(vectx, meane, vectx, meani)
	.etiquette(5, meane + (meani - meane)/2, 'Pmotrice')
	;


</script>
