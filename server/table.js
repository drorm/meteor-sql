

//An SQL database table
Devwik.SQL.Table = function(name) {
	var self = this;
	self.name = name;
	self.cols = [];
	var future = new Future();
	//Get the structure for a table
	Devwik.SQL.connection.query('describe ' + name, function(err, rows, fields) {
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


//Info about a database column
Devwik.SQL.Column = function(props) {
	var self = this;
	self.sqlProps = props;
	/*
	 * Sample field from the driver
	 * { Field: 'a',
	 * Type: 'bigint(20) unsigned',
	 * Null: 'NO',
	 * Key: 'PRI',
	 * Default: null,
	 * Extra: 'auto_increment' }
	 * Convert it into a more javascript friendly structure
	 */
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

Devwik.SQL.Table.prototype.setPublish = function() {
	var table = this;
	// TODO: Should be wrapped in future, but hangs at this point
	//var fut = new Future();
	// server: publish the table as a collection
	Meteor.publish(table.name, function () {
		var self = this;
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
 * Create a collection of all the tables
 */
Devwik.SQL.publishTables = function() {
	Meteor.publish(tableCollection, function () {
	console.log('publish:' + tableCollection);
			console.log(Devwik.SQL.tables);
			var self = this;
		_.each(Devwik.SQL.tables, function(table, name){
			console.log('added:' + name);
			console.log(table);
			self.added(tableCollection, name, table);
		});
		self.ready();//indicate that the initial rows are ready
	});
};
