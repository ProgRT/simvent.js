---
---
<script src="{{ "/lib/jquery.min.js" | prepend: site.baseurl}}"></script>
<script src="{{ "/lib/dygraph-combined.js" | prepend: site.baseurl}}"></script>
<script src="{{ "/lib/synchronizer.js" | prepend: site.baseurl}}"></script>
<script src="{{ "/src/frontPanel.js" | prepend: site.baseurl}}"></script>
<script src="{{ "/src/dict.js" | prepend: site.baseurl}}"></script>
<div id="panel"></div>
<script>
fp.waveformContainerID = "#content";
fp.init();
</script>
