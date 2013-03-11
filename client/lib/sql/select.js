"use strict";
Meteor.Select = function(name) {
	Meteor.subscribe(name);
	var myCollection = new Meteor.Collection(name);

	return(myCollection);
};

