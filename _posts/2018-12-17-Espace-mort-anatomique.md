---
title: Epace mort anatomique (méthode de Fowler)
---

<script>
	var lung = new sv.SimpleLung();
	var vent = new sv.PressureControler();
	vent.nbcycles = 1;
	vent.Tsampl = .001;
	var data = vent.ventilate(lung);
	data = data.timeData.filter(function(d){return d.time < vent.Ti + vent.Te});

	fx = function(d){return d.Vte * 1000};
	fy2 = function(d){return d.PCO2};


	var graph = new gs.quickGraph( null, data, fx, fy2)
		.setidx("Volume expiré (ml)")
		.setidy("PCO₂ (mmHg)")
		.plagex(0, lung.Vdaw * 1000, "Espace mort", 20)
		.pointx(lung.Vdaw * 1000);
</script>
