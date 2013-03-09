var require = __meteor_bootstrap__.require,
Future = require('fibers/future'),
//Using https://github.com/felixge/node-mysql
mysql = require('mysql');

start = new Date();
console.log('\n----------' + new Date() + ' SQL Driver Starting --------');


//Create the connection pool using the config info in dbconfig.js
var pool = mysql.createPool(dbConfig);

//Get the connection
pool.getConnection(function(err, connection) {
	var query;
	if (err) throw err;
	Devwik.SQL.connection = connection;//provide global access to the connection

	//Get the list of tables in the db
	query = connection.query('show tables', function(err, result) {
		if (err) throw err;
		Fiber(function() {
			Devwik.SQL.dbChanges();
			Devwik.SQL.Poll();
			Devwik.SQL.tables = {};
			_.each(result, function(row){ //For each table in the db
				if(!(row.Tables_in_meteor === dbChanges)) {
					//Get the info about the table and its columns
					var table = new Devwik.SQL.Table(row.Tables_in_meteor); 
					Devwik.SQL.tables[table.name] = table;
					console.log('loading:' + table.name);
				}
			});
			Devwik.SQL.publishTables();
			var elapsed = new Date() - start;
			console.log('----------' + new Date() + ' SQL Driver ready:' + elapsed + '--------');
		}).run();

	});


	connection.end();
});

//Create the table that tracks the changes
Devwik.SQL.dbChanges = function() {
	//type is INSERT, UPDATE or DELETE
	var createStatement = "\
	CREATE TABLE IF NOT EXISTS `"+ dbChanges +"` (\
	`cid` int not NULL AUTO_INCREMENT,\
	`tableName` varchar(255) not NULL,\
	`rowId` int(11) not NULL,\
	`type` varchar(16) not NULL,\
	`ts` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\
	PRIMARY KEY (cid)\
) ENGINE=INNODB;";

Devwik.SQL.execStatement(createStatement, false);
Devwik.SQL.execStatement('drop index dbchangesIndex on ' + dbChanges, true);
var createIndex = 'create index dbchangesIndex on ' + dbChanges + '(ts)';
Devwik.SQL.execStatement(createIndex, true);
var statement = squel.remove().from(dbChanges);
Devwik.SQL.execStatement(statement.toString());
};

/*
 * Execute an SQL statement. This can be both DML (queries) or DDL (create/alter)
 * @param {String} statement : The statement to run
 * @param {Boolean} ignoreErr -- optional. By default, we throw an exception on error
 * This makes us ignore the error. 
 * @returns {Array} result. The rows, if any returned by the query
 * TODO: We actually should no throw an error as a rule.
 */
Devwik.SQL.execStatement = function(statement, ignoreErr) {
	var future = new Future();
	query = Devwik.SQL.connection.query(statement, function(err, result) {
		//console.log(statement); //TODO: provide a way to show
		if (err) {
			if(ignoreErr) {
				console.log('Ignoring:' + err.message); 
			} else {
				throw err;
			}
		}
		future.ret(result);
	});
	return(future.wait());
};

