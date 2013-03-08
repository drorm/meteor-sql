
/*
 * Set up polling the db for changes
 */
Devwik.SQL.Poll = function() {
	Devwik.SQL.Poll.lastChangeId = 0;//Id of the most recent change
	//Clear the log of changes since we're starting fresh, and reading all 
	//the tables from scratch
	Devwik.SQL.execStatement("delete from " + dbChanges); 
	Devwik.SQL.doPoll();
};

//poll the db for changes
Devwik.SQL.doPoll = function() {
	var table, statement, row,
	changes = Devwik.SQL.execStatement("select * from " + dbChanges + 
			" where cid > '" + Devwik.SQL.Poll.lastChangeId + "'"); 
		try {
			_.each(changes, function(change) {
				Devwik.SQL.Poll.lastChangeId = change.cid;//Id of the most recent change
				table = Devwik.SQL.tables[change.tableName];
				switch (change.type) {
				case 'INSERT':
				case 'UPDATE':
					statement = 'select * from ' + change.tableName + ' where ' + 
						table.autoIncrement + ' = ' + change.rowId;
					row = Devwik.SQL.execStatement(statement)[0];
					if (row) {//Could have been deleted before we apply the insert/update
						if(change.type == 'INSERT') {
							table.added(table.name, row[table.autoIncrement], row);
						} else {
							table.changed(table.name, row[table.autoIncrement], row);
						}
					}
					break;
				case 'DELETE': //TODO: Fix race condition with inserts
					table.removed(table.name, change.rowId);
					break;
				default:
					break;
				}
			});
		} catch (err) {
			//console.log(table);
			console.log(err);
		}
		Meteor.setTimeout(Devwik.SQL.doPoll, pollInterval);
	};
