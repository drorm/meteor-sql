
/*
 * An SQL database table
 * * @param {String} name: the name of the table
 */

//An SQL database table
Devwik.SQL.Table = function(name) {
	var self = this;
	self.name = name;
	self.cols = [];
	self.views = []; //Views that depend on this table
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
			//Is it a view?
			if(Devwik.SQL.View.list[self.name]) {
				self.view = new Devwik.SQL.View(self.name, self);
				console.log(self.name + ' is a view');
			} else {
				console.log('NO Key in:' + self.name);
			}
		}
		future.ret();
	}, self);
	future.wait();

	if (self.dbKey) {
		self.createTriggers();
		self.setPublish();
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
		var insertTriggerName = self.name + 'Insert' + Devwik.SQL.Config.triggerSuffix,
		dropInsertTrigger = "DROP TRIGGER " + insertTriggerName, 
		insertTrigger = "CREATE TRIGGER " + insertTriggerName + " AFTER INSERT ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + Devwik.SQL.Config.dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"new."+ self.dbKey +"," + " 'INSERT'); END;";

		Devwik.SQL.execStatement(dropInsertTrigger);
		Devwik.SQL.execStatement(insertTrigger);

		//Update Trigger
		var updateTriggerName = self.name + 'Update' + Devwik.SQL.Config.triggerSuffix,
		dropUpdateTrigger = "DROP TRIGGER " + updateTriggerName, 
		updateTrigger = "CREATE TRIGGER " + updateTriggerName + " AFTER Update ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + Devwik.SQL.Config.dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"new."+ self.dbKey +"," + " 'UPDATE'); END;";
		Devwik.SQL.execStatement(dropUpdateTrigger);
		Devwik.SQL.execStatement(updateTrigger);

		//Delete Trigger
		var deleteTriggerName = self.name + 'Delete' + Devwik.SQL.Config.triggerSuffix,
		dropDeleteTrigger = "DROP TRIGGER " + deleteTriggerName, 
		deleteTrigger = "CREATE TRIGGER " + deleteTriggerName + " AFTER Delete ON " + self.name + 
			" FOR EACH ROW BEGIN INSERT INTO " + Devwik.SQL.Config.dbChanges + 
			"(tableName, rowId, type) VALUES('" + self.name +"'," + 
			"old."+ self.dbKey +"," + " 'DELETE'); END;";
		Devwik.SQL.execStatement(dropDeleteTrigger);
		Devwik.SQL.execStatement(deleteTrigger);

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
				console.log('added:' + name);
			if(!table.view) {
				self.added(name, id, data);
			} else {
				console.log('adding');
				var compositeKey = table.view.createKey(data);
				console.log(compositeKey);
				self.added(table.name, compositeKey, data);
			}
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
				if(!table.view) {
					self.added(table.name, row[table.dbKey], row);
				} else {
					//Concatenate the different keys for the view 
					var compositeKey = table.view.createKey(row);
					self.added(table.name, compositeKey, row);
				}
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
	Meteor.publish(Devwik.SQL.Config.tableCollection, function () {
		var self = this;
		_.each(Devwik.SQL.tables, function(table, name){
			var tableProps = {};
			tableProps.cols = table.cols;
			tableProps.dbKey = table.dbKey;
			tableProps.name = table.name;
			tableProps.type = table.type;
			tableProps.Null = table.Null;
			tableProps.Default = table.Default;
			self.added(Devwik.SQL.Config.tableCollection, name, tableProps);
		});
		self.ready();//indicate that the initial rows are ready
	});
};
