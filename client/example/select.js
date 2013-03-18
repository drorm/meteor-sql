var empCity = new Meteor.Table('empCity');


	Template.devwikSelects.selects = function () {
		return empCity.find({}, {sort: {employeeNumber: -1}});
	};

