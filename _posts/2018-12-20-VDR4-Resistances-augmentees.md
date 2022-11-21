---
title: 'Ventilateur VDR-4: Augmentation des résistances'
---

<figure style='display: inline-block; width:49%'>
    <script>
        var gr1 = new gs.graph(null);
    </script>
    <figcaption>Raw = 5 cmH₂O/l/s</figcaption>
</figure>


<figure style='display: inline-block; width:49%'>
    <script>
        var gr2 = new gs.graph( null);
    </script>
    <figcaption>Raw = 15 cmH₂O/l/s</figcaption>
</figure>

<script>
	var vent = new sv.VDR();
	vent.Fiph = 1.0;
	vent.CPR=0;
	vent.Tvent = 6;
	vent.lpop = 6;
    vent.Fperc = 300;

	var lung1 = new sv.SimpleLung();

	var lung2 = new sv.SimpleLung();
	lung2.Raw = 15;

	var d1 = vent.ventilate(lung1).timeData;

	vent.time = 0;
	var d2 = vent.ventilate(lung2).timeData;

	fx = function(d){return d.time};
	fy = function(d){return d.Pao};

    for(let gr of [gr1, gr2]){
        gr.nticksX = 5;
        gr.setscale(d2, fx, fy)
            .setidx("Temps (s)")
            .setidy("Pression (cmH₂O)");
    }

	gr2.tracer(d2, fx, fy);
	gr1.tracer(d1, fx, fy);
</script>
