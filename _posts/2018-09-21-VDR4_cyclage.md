---
title: Cyclage haute et basse fréquence du ventilateur VDR-4
---

<script>

var conf = {
padH: .5,
padPlage: 1,
class: 'thinPath'
};
var lung = new sv.SimpleLung();
var vent = new sv.VDR();
var data = vent.ventilate(lung).timeData;

fx = function(d){return d.time};
fy = function(d){return d.Pao};


var tStart = 2;
var ply = 40;

var gr1 = gs.quickGraph( null, data, fx, fy, conf)
		  .setidx("Temps (s)")
		  .setidy("Pression (cmH₂O)")
		  .plagex(tStart, tStart + vent.Tic, 'Ti', ply)
		  .plagex(tStart + vent.Tic, tStart + vent.Tic + vent.Tec, 'Te', ply)
		  ;

var f = function(d){
	return d.time > 3 && d.time < 4 ;
}

var tStart = 3.285;
var ply = 40;

var gr2 = gs.quickGraph( null, data.filter(f), fx, fy, conf)
		  .setidx("Temps (s)")
		  .setidy("Pression (cmH₂O)")
		  .plagex(tStart, tStart + vent.Tip, 'Ti', ply)
		  .plagex(tStart + vent.Tip, tStart + vent.Tip + vent.Tep, 'Te', ply)
		  ;

</script>
