Devwik = function() {}; //Provide a name space
Devwik.SQL = function() {};

Future = Npm.require('fibers/future');
//Using the node.js MYSQL driver from https://github.com/felixge/node-mysql
Fiber = Npm.require('fibers');
mysql = Npm.require('mysql');
mysql = Npm.require('mysql');
//based on http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
Devwik.toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};
