---
title: Capnogramme volumétrique
---

<svg id="svg{{ page.id | replace: "/", "" }}"></svg>
<script>
	var lung = new sv.SimpleLung();
	var ventilator = new sv.PressureControler();
	ventilator.nbcycles = 1;
	ventilator.Tsampl = .001;
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.Vte};
	fy2 = function(d){return d.PCO2};


	var graph = new gs.quickGraph( "#svg{{ page.id | replace: "/", "" }}", data.timeData, fx, fy2)
		.setidx("Vte")
		.setidy("PCO2");
</script>
