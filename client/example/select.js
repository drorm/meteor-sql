var notDone = true;
var Select = new Meteor.Select('empsCities');


	Template.devwikSelects.selects = function () {
		return Select.find({});
	};

