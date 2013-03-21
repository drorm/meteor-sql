Devwik.SQL.runTests = function() {
	//Example of a select with a join
	var select = new Devwik.SQL.Select('empsPerCity', 'select count(*) empNumber,  offices.* from employees, offices where offices.officeCode = employees.officecode group by officeCode');
	//Devwik.SQL.Tests.transactions();
};

Devwik.SQL.Tests = {};

Devwik.SQL.Tests.transactions = function() {
	var transaction = new Devwik.SQL.Transaction(); 
	if(transaction) {
		console.log(Devwik.SQL.execStatement('select count(*) from employees', 
		transaction)[0]);
//employeeNumber is a unique key at least one of these should fail
Devwik.SQL.execStatement("INSERT INTO employees (employeeNumber,firstName, lastName, email, jobTitle) VALUES (1759, 'aaaa', 'bbb', 'ddd', 'ccc')", transaction);
Devwik.SQL.execStatement("INSERT INTO employees (employeeNumber,firstName, lastName, email, jobTitle) VALUES (1759, 'aaaa', 'bbb', 'ddd', 'ccc')", transaction);
	transaction.end(); 
	}
console.log(Devwik.SQL.execStatement('select count(*) from employees')[0]);
};
