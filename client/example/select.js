var notDone = true;
var Select = new Meteor.Table('empsCities');


	Template.devwikSelect.selects = function () {
		return Select.find({});
	};

