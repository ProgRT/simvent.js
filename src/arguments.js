var a = location.search.substring(1).split('&');7
var args = {};
for(var string of a){
		  var bi = string.split('=');
		  args[bi[0]] = bi[1];
}
