"use strict";
var Devwik = function() {}; //Provide a name space
Devwik.SQL = function() {};
Devwik.SQL.tableList = {};//Keep track of the ones we already opened


Meteor.Table = function(name) {
	if(Devwik.SQL.tableList[name]) {
		return(Devwik.SQL.tableList[name]);
	}

	Meteor.subscribe(name);
	var myCollection = new Meteor.Collection(name);

	myCollection.insert = function (args, callback) {
		Meteor.call('SQLinsert', this._name, args, callback);
	};

	myCollection.update = function (id, args, callback) {
		console.log(args);
		try {
		Meteor.call('SQLupdate', this._name, args, id, callback);
		} catch (err) {
			console.log(err);
		}
	};

	myCollection.remove = function (id, callback) {
		try {
		Meteor.call('SQLremove', this._name, id, callback);
		} catch (err) {
			console.log(err);
		}
	};

	Devwik.SQL.tableList[name] = myCollection;
	return(myCollection);
};

