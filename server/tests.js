Devwik.SQL.runTests = function() {
//Example of a select with a join
	var select = new Devwik.SQL.Select('empsCities', 'select employees.*, offices.city from employees, offices where offices.officeCode = employees.officecode');
};
