"use strict";
Meteor.Table = function(name) {
	Meteor.subscribe(name);
	var myCollection = new Meteor.Collection(name);

	myCollection.insert = function (args, callback) {
		Meteor.call('SQLinsert', this._name, args, callback);
	};

	myCollection.update = function (args, criteria, callback) {
		try {
		Meteor.call('SQLupdate', this._name, args, criteria, callback);
			console.log('after update');
		} catch (err) {
			console.log(err);
		}
	};

	myCollection.remove = function (criteria, callback) {
		try {
		Meteor.call('SQLremove', this._name, criteria, callback);
		} catch (err) {
			console.log(err);
		}
	};
	return(myCollection);
};

