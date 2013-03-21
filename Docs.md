##Full server side DB access

You have full access to all SQL statements on the server: Select, inserts, updates, create table, etc.

## Selects
Run Devwik.SQL.execStatement. You iterate over the array it returns.
```
var rows = Devwik.SQL.execStatement('select * from employees');
_.each(rows, function(row){ //For each table in the db
	//now use row.firstName, row.lastName ...
});
```

## Other statements

Same as selects except no data is returned.
```
Devwik.SQL.execStatement('update employees set officeCode = 7 where officeCode = 6');
```

## Using squel
Squel, http://hiddentao.github.com/squel, is supported making construction of query strings less error prone than having to  concatenate them.
```
squel.select().from('employees').where(key  + " = '" + id + "'");
```

## Escaping user input

Use Devwik.SQL.escape() to escape user input to protect from SQL injections.
The following code demonstrates combining the use of squel and escaping.
```
var statement = squel.insert().into(tableName);
_.each(args, function(value, key) {
		value = Devwik.SQL.escape(value);
		statement.set(key, value);
		});
```


##Tables
*Tables need to have a unique id* so that the driver can identify rows that are sent to the client. Tables without a unique id are ignored.

On startup the driver automatically finds out the tables you have in the db and creates a Table object for each one, and publishes them to the client. 

##Client Side
Subscribe to a table's data by declaring it client side. 
```
var Employee = new Meteor.Table('employees');
```
###Viewing data: find()
Use the standard Meteor client side Mongo API, http://docs.meteor.com/#find, to fetch data or use it in templates.

##Insert

Insert takes two arguments: an object with the data to insert and a callback function that gets passed and err and value params. Value contains the row id of the inserted row if any.
```
Employee.insert(insert, function(err, value) {
		...
		});
```
##Update
Insert takes three arguments: an object with the data to insert, the id of the row to update, and a callback function that gets passed and err and value params. 
```
update = {};
update.firstName  = $('#updateFirst').val();
update.lastName = $('#updateLast').val();
update.email = $('#updateEmail').val();
update.jobTitle  = $('#updateTitle').val();
Employee.update(update, id, function(err, value) {
	...
}
```

## delete
Delete takes two arguments: id of the row to update, and a callback function that gets passed and err and value params. 
```
Employee.remove(id, function(err, value) {
	...
}
```

#Views

##Limitations
Currently you can only use simple views that include the keys from the original tables.
		So 
```
create view bar as select firstName, lastName, email, jobTitle, employees.officeCode, city, addressLine1, state, country from offices, employees 
where employees.officeCode = offices.officeCode limit 3;
```
works fine. It gives us employee and office info for each employee and includes keys in each table.
On the other hand the following view:
```
create view empOffice as select count(*) empNumber,  offices.* from employees, offices where offices.officeCode = employees.officecode group by officeCode;
```
Aggregates the number of employees in the first column. When a new employee record is inserted, there's no obvious way to tell which rows in this view changed. At this point, this kind of view is not supported.
*Updatable views are not supported.* You can't insert, update or delete from a view.

##Usage
Once you create a view in the DB, subject to the above limitations, you use it the same as you would a table. The driver creates the objects server side, and you create a Table object using the view name. 


#Selects

Unlike views, there are not limitations to what's included in a select statement. Selects, however *are not reactive*. This means that changes to rows shown in a resultset from a select will not change until the user reloads the page.

## Server
You create selects on the server using the following syntax. The first argument is the name of the select, and the second is the statement. 
```
Devwik.SQL.Select('empsCities', 'select employees.*, offices.city from employees, offices where offices.officeCode = employees.officecode');
```

##Client
Just define which select you're using
```
var Select = new Meteor.Select('empsCities');
Select.find({}, {sort: {employeeNumber: -1}});
```

#Transactions

## Engine
You need to use an engine that supports transaction such as *innodb*, otherwise all transaction related statements are ignored.

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

*Do not use Exception handling to catch SQL errors.* node.js exceptions don't work correctly.
