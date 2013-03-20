#Tables
The driver needs  *tables to have a unique id* so that it can identify rows that are sent to the client. Tables without a unique id are ignored.

##Full server side DB access

Select, inserts, updates, create table, etc, you can do it all on the server.
### Selects
Run Devwik.SQL.execStatement. You iterate over the array it returns.
```
	var rows = Devwik.SQL.execStatement('select * from employees');
	_.each(rows, function(row){ //For each table in the db
		//now use row.firstName, row.lastName ...
	});
```

### Other statements

Same as selects except no data is returned.
```
Devwik.SQL.execStatement('update employees set officeCode = 7 where officeCode = 6');
```

##Tables
##Server Side
On startup the driver automatically finds out the tables you have in the db and creates a Table object for each one, and publishes them to the client. 

##Client Side
Subscribe to a table's data by declaring it client side. 
```
var Employee = new Meteor.Table('employees');
```
##Viewing data: find()
Use the standard Meteor client side Mongo API, http://docs.meteor.com/#find, to fetch data or use it in templates.

##Insert,update, delete
TODO

##Views


#Transactions

## Engine
You need to use an engine that supports transaction such as innodb, otherwise all transaction related statements are ignored.

## Usage

### Automatic COMMIT OR ROLLBACK
The following code demonstrates how to put multiple statements in a transaction.
1. You create a transaction object using new Devwik.SQL.Transaction.
2. You pass the transaction object to each execStatement you call.
3. You call end() on the object when you're done with the transaction.
```
var transaction = new Devwik.SQL.Transaction();
if(transaction) {
	//employeeNumber is a unique key at least one of these should fail
	Devwik.SQL.execStatement("INSERT INTO employees (employeeNumber,firstName, lastName, email, jobTitle) VALUES (1759, 'aaaa', 'bbb', 'ddd', 'ccc')", transaction);
	Devwik.SQL.execStatement("INSERT INTO employees (employeeNumber,firstName, lastName, email, jobTitle) VALUES (1759, 'aaaa', 'bbb', 'ddd', 'ccc')", transaction);
	transaction.end();
}
```
If any of the statements fail, the rest the transaction is rolled back. Otherwise, the transaction is committed.


### Manual COMMIT OR ROLLBACK
You can create and manage transactions manually
```
var transaction = new Devwik.SQL.Transaction();//Create the transaction
if(transaction) {
	...
	if(/* good stuff */) {
		transaction.commit();
	} else {
		transaction.rollback();
	}
}
```

*Do not use Exception handling to catch SQL errors.* 
