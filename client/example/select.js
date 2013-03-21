var empCities = new Meteor.Select('empsPerCity');
console.log(empCities);


	Template.devwikSelects.selects = function () {
		console.log('selects');
		return empCities.find({}, {sort: {employeeNumber: -1}});
	};

