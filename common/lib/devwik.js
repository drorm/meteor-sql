if (typeof Devwik == 'undefined') {
	 Devwik = function() {};
 }

 //based on http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 Devwik.toType = function(obj) {
	 return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
 };
