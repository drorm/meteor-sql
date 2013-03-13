
/*
 * An SQL database table
 * * @param {String} name: the name of the table
 */

//An SQL database table
Devwik.SQL.Table = function(name) {
	var self = this;
	self.name = name;
	self.cols = [];
	var future = new Future();
	//Get the structure for a table
	Devwik.SQL.connection.query('describe ' + name, function(err, rows) {
		if (err) throw err;
		_.each(rows, function(row){
			var col = new Devwik.SQL.Column(row);
			if(col.dbKey) {
				self.dbKey = col.dbKey;
			}
			self.cols.push(col);
		});
		if(!self.dbKey) {
			console.log('NO Key in:' + self.name);
		}
		future.ret();
	}, self);
	future.wait();

	if (self.dbKey) {
		this.createTriggers();
		this.setPublish();
	}

	return;
};


/*
 * A database column
 * @param {Objectl} prpos: the properties of the column that the driver gives us
 * Sample field from the driver
 * { Field: 'a',
 * Type: 'bigint(20) unsigned',
 * Null: 'NO',
 * Key: 'PRI',
 * Default: null,
 * Extra: 'auto_increment' }
 * Convert it into a more javascript friendly structure
 */

Devwik.SQL.Column = function(props) {
	var self = this;
	self.sqlProps = props;
	self.dbKey = false;
	if (props.Extra === 'auto_increment') {
		self.dbKey = props.Field;
} else if (props.Key === 'PRI') {
	self.dbKey = props.Field;
}
self.name = props.Field;
self.type = props.Type;
self.Null = props.Null === 'YES'? true : false;//null is reserved so capitalize
self.Default = props.Default;//default is reserved word so capitalize
};

/*
 * Create the triggers for the table that insert a row on INSERT, UPDATE, DELETE
 */

Devwik.SQL.Table.prototype.createTriggers = function() {
	var self = this;
	if (self.dbKey) {
		//Insert Trigger
		var insertTriggerName = self.name + 'Insert' + triggerSuffix,
		dropInsertTrigger = "DROP TRIGGER " + insertTriggerName, 
		insertTrigger = "CREATE TRIGGER " + insertTriggerName + " AFTER INSERT ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"new."+ self.dbKey +"," + " 'INSERT'); END;";

		Devwik.SQL.execStatement(dropInsertTrigger, true);
		Devwik.SQL.execStatement(insertTrigger, true);

		//Update Trigger
		var updateTriggerName = self.name + 'Update' + triggerSuffix,
		dropUpdateTrigger = "DROP TRIGGER " + updateTriggerName, 
		updateTrigger = "CREATE TRIGGER " + updateTriggerName + " AFTER Update ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"new."+ self.dbKey +"," + " 'UPDATE'); END;";
		Devwik.SQL.execStatement(dropUpdateTrigger, true);
		Devwik.SQL.execStatement(updateTrigger, true);

		//Delete Trigger
		var deleteTriggerName = self.name + 'Delete' + triggerSuffix,
		dropDeleteTrigger = "DROP TRIGGER " + deleteTriggerName, 
		deleteTrigger = "CREATE TRIGGER " + deleteTriggerName + " AFTER Delete ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"old."+ self.dbKey +"," + " 'DELETE'); END;";
		Devwik.SQL.execStatement(dropDeleteTrigger, true);
		Devwik.SQL.execStatement(deleteTrigger, true);

	}
	};

	/*
	 * Publish the table to the client
	 */

	Devwik.SQL.Table.prototype.setPublish = function() {
		var table = this;
		table.handles = [];
		// TODO: Should be wrapped in future, but hangs at this point
		//var fut = new Future();
		// server: publish the table as a collection
		Meteor.publish(table.name, function () {
			var self = this;
			if (_.indexOf(table.handles, self) === -1) {//Haven't seen this one yet
				table.handles.push(self); //add it
			}

			self.onStop(function () {//TODO test more
				table.handles = _.without(table.handles, self);
			});
			/*
			 * Set up the callbacks
			 */
			table.added = function(name, id, data) {
				self.added(name, id, data);
			};
			table.changed = function(name, id, data) {
				self.changed(name, id, data);
			};
			table.removed = function(name, id) {
				self.removed(name, id);
			};

 
			//fut.ret();
			statement = "select * from " + table.name;
			query = Devwik.SQL.connection.query(statement, function(err, result) {
				if (err) {
					throw err;
				}
				_.each(result, function(row){
					self.added(table.name, row[table.dbKey], row);
				});
				self.ready();//indicate that the initial rows are ready
			});
		});
		//return fut.wait();
	};

	/*
	 * Create a collection of the Meta data of all the tables
	 */
	Devwik.SQL.publishTables = function() {
		Meteor.publish(tableCollection, function () {
			var self = this;
			_.each(Devwik.SQL.tables, function(table, name){
				self.added(tableCollection, name, table);
			});
			self.ready();//indicate that the initial rows are ready
		});
		};
