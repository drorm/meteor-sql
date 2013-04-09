/*
 * Meteor SQL Driver main file. Initializes the driver and sets up all the tables.
 */

start = new Date();
console.log('\n----------' + new Date() + ' SQL Driver Starting --------');


//Create the connection pool using the config info in dbconfig.js
var pool = mysql.createPool(Devwik.SQL.Config.dbConfig);

//Get the connection
pool.getConnection(function(err, connection) {
	var query;
	if (err) throw err;
	Devwik.SQL.connection = connection;//provide global access to the connection

	//Get the list of tables in the db
	query = connection.query('show tables', function(err, result) {
		if (err) throw err;
		Fiber(function() {

			//Get the list of views in the db
			Devwik.SQL.View.getViews();

			//Set up the table where we track changes to the db
			Devwik.SQL.dbChanges();

			// Poll the table with changes
			Devwik.SQL.Poll();
			Devwik.SQL.tables = {};
			Devwik.SQL.views = {};
			_.each(result, function(row){ //For each table in the db
				if(!(row.Tables_in_meteor === Devwik.SQL.Config.dbChanges)) {
					//Get the info about the table and its columns
					var table = new Devwik.SQL.Table(row.Tables_in_meteor); 
					Devwik.SQL.tables[table.name] = table;
					console.log('loaded:' + table.name);
				}
			});

			//Tell tables which views depend on them
			Devwik.SQL.View.tableDependencies();

			Devwik.SQL.runTests();
			//Meteor.publish the tables to the client
			Devwik.SQL.publishTables();
			var elapsed = new Date() - start;
			console.log('----------' + new Date() + ' SQL Driver ready:' + elapsed + '--------');
		}).run();

	});


});

//Create the table that tracks the changes
Devwik.SQL.dbChanges = function() {
	//type is INSERT, UPDATE or DELETE
	var createStatement = "\
	CREATE TABLE IF NOT EXISTS `"+ Devwik.SQL.Config.dbChanges +"` (\
	`cid` int not NULL AUTO_INCREMENT,\
	`tableName` varchar(255) not NULL,\
	`rowId` int(11) not NULL,\
	`type` varchar(16) not NULL,\
	`ts` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,\
	PRIMARY KEY (cid)\
) ENGINE=INNODB;";

Devwik.SQL.execStatement(createStatement);
Devwik.SQL.execStatement('drop index dbchangesIndex on ' + Devwik.SQL.Config.dbChanges);
var createIndex = 'create index dbchangesIndex on ' + Devwik.SQL.Config.dbChanges + '(ts)';
Devwik.SQL.execStatement(createIndex);
var statement = squel.remove().from(Devwik.SQL.Config.dbChanges);
Devwik.SQL.execStatement(statement.toString());
};

