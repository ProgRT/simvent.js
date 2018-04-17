---
title: Capnogramme volumétrique
---

<svg id="svg{{ page.id | replace: "/", "" }}"></svg>
<script>
	var lung = new sv.SimpleLung();
	var vent = new sv.PressureControler();
	vent.nbcycles = 1;
	vent.Tsampl = .001;
	var data = vent.ventilate(lung);
	data = data.timeData.filter(function(d){return d.time < vent.Ti + vent.Te});

	fx = function(d){return d.Vte};
	fy2 = function(d){return d.PCO2};


	var graph = new gs.quickGraph( "#svg{{ page.id | replace: "/", "" }}", data, fx, fy2)
		.setidx("Vte")
		.setidy("PCO₂");
</script>
