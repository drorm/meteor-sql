
/*
 * Set up polling the db for changes.  Create a trigger that inserts a row into the
 * dbChanges table for each each INSERT, UPDATE and DELETE
 */
Devwik.SQL.Poll = function() {
	Devwik.SQL.Poll.lastChangeId = 0;//Id of the most recent change
	//Clear the log of changes since we're starting fresh, and reading all 
	//the tables from scratch
	Devwik.SQL.execStatement(squel.remove().from(Devwik.SQL.Config.dbChanges).toString()); 
	Devwik.SQL.doPoll();
};

//poll the db for changes
Devwik.SQL.doPoll = function() {
	var table, statement, row,
	changesStatement = squel.select().from(Devwik.SQL.Config.dbChanges).where("cid > '" + Devwik.SQL.Poll.lastChangeId + "'").toString(); 
	//TODO: Explore failure mode. Since we're polling a lot,  what happens when we fail?
	var changes = Devwik.SQL.execStatement(changesStatement);
		try {
			_.each(changes, function(change) {
				Devwik.SQL.Poll.lastChangeId = change.cid;//Id of the most recent change
				table = Devwik.SQL.tables[change.tableName];
				switch (change.type) {
				case 'INSERT':
				case 'UPDATE':
					statement = 'select * from ' + change.tableName + ' where ' + 
						table.dbKey + ' = ' + change.rowId;
					row = Devwik.SQL.execStatement(statement)[0];
					if (row) {//Could have been deleted before we apply the insert/update
						if(change.type == 'INSERT') {
							_.each(table.handles, function (handle) {
								handle.added(table.name, row[table.dbKey], row);
							});
							_.each(table.views, function (view) {
								Devwik.SQL.views[view].add(table.name, table.dbKey, row[table.dbKey]);
							});
						} else {
							_.each(table.handles, function (handle) {
								handle.changed(table.name, row[table.dbKey], row);
							});
							_.each(table.views, function (view) {
								Devwik.SQL.views[view].change(table.name, table.dbKey, row[table.dbKey]);
							});
						}
					}
					break;
				case 'DELETE': //TODO: Fix race condition with inserts
					_.each(table.handles, function (handle) {
						handle.removed(table.name, change.rowId);
					});
					_.each(table.views, function (view) {
						Devwik.SQL.views[view].remove(table.name, table.dbKey, change.rowId);
					});
					break;
				default:
					break;
				}
			});
		} catch (err) {
			//console.log(table);
			console.log(err);
		}
		Meteor.setTimeout(Devwik.SQL.doPoll, Devwik.SQL.Config.pollInterval);
};
