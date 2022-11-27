---
---
<style>
iframe: {
width: 80%;
height: 400px;
}
</style>
```{html}
<!DOCTYPE html>
<style>
    .gs {
    width: 100%;
    height: 100%;
    }
</style>
    
<script src="./lib/d3.v3.min.js"> </script>
Allo, le monde !
<script type='module'>
    import {SimpleLung} from "https://progrt.github.io/simvent.js/src/simvent-lungs.js";
    import {PressureControler} from "https://progrt.github.io/simvent.js/src/simvent-ventilators.js";
    import {quickGraph} from "https://progrt.github.io/graphsimple.js/graphsimple.js";

    const v = new PressureControler();
    const l = new SimpleLung();
    const d = v.ventilate(l).timeData;

    const g = new quickGraph(null, d, d=>d.time, d=>d.Flung);
</script>
```
<script>
const codes = document.querySelectorAll('pre');

for(let p of pres){
    const frame = document.createElement('iframe');
    p.insertAdjacentElement('afterend', frame);
    let content = p.firstChild.innerHTML
    content = content.replace("&lt;", "<")
    .replace("&gt;", ">");
    console.log(content);

    frame.srcdoc = content;
}
</script>
