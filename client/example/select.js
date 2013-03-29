var empCities = new Meteor.Select('empsPerCity');


	Template.devwikSelects.selects = function () {
		return empCities.find({}, {sort: {employeeNumber: -1}});
	};

