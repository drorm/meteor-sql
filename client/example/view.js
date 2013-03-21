var empCity = new Meteor.Table('empCity');


	Template.devwikView.viewRows = function () {
		return empCity.find({}, {sort: {employeeNumber: -1}});
	};

