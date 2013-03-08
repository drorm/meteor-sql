
//An SQL database table
Devwik.SQL.Table = function(name) {
	var self = this;
	self.name = name;
	self.cols = [];
	var future = new Future();
	//Get the structure for a table
	Devwik.SQL.connection.query('describe ' + name, function(err, rows, fields) {
		if (err) throw err;
		self.hasAutoIncrement = false; //Use key, not autoIncrement
		_.each(rows, function(row){
			var col = new Devwik.SQL.Column(row);
			if(col.autoIncrement) {
				self.autoIncrement = col.autoIncrement;
			}
			self.cols.push(col);
		});
		if(!self.autoIncrement) {
			console.log('NO AUTO INCREMENT in:' + self.name);
		}
		future.ret();
	}, self);
	future.wait();

	if (self.autoIncrement) {
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
	self.autoIncrement = false;
	if (props.Extra === 'auto_increment') {
		self.autoIncrement = props.Field;
	}
	self.name = props.Field;
	self.type = props.Type;
	self.Null = props.Null === 'YES'? true : false;//null is reserved so capitalize
	self.Default = props.Default;//default is reserved word so capitalize
};

	Devwik.SQL.Table.prototype.createTriggers = function() {
		var self = this;
		if (self.autoIncrement) {
			//Insert Trigger
			var insertTriggerName = self.name + 'Insert' + triggerSuffix,
			dropInsertTrigger = "DROP TRIGGER " + insertTriggerName, 
			insertTrigger = "CREATE TRIGGER " + insertTriggerName + " AFTER INSERT ON " + self.name + 
				" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
				"(tableName, rowId, type) VALUES('" + self.name +"'," + 
				"new."+ self.autoIncrement +"," + " 'INSERT'); END;";

			Devwik.SQL.execStatement(dropInsertTrigger, true);
			Devwik.SQL.execStatement(insertTrigger, true);

			//Update Trigger
			var updateTriggerName = self.name + 'Update' + triggerSuffix,
			dropUpdateTrigger = "DROP TRIGGER " + updateTriggerName, 
			updateTrigger = "CREATE TRIGGER " + updateTriggerName + " AFTER Update ON " + self.name + 
				" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
				"(tableName, rowId, type) VALUES('" + self.name +"'," + 
				"new."+ self.autoIncrement +"," + " 'UPDATE'); END;";
			Devwik.SQL.execStatement(dropUpdateTrigger, true);
			Devwik.SQL.execStatement(updateTrigger, true);

			//Delete Trigger
			var deleteTriggerName = self.name + 'Delete' + triggerSuffix,
			dropDeleteTrigger = "DROP TRIGGER " + deleteTriggerName, 
			deleteTrigger = "CREATE TRIGGER " + deleteTriggerName + " AFTER Delete ON " + self.name + 
				" FOR EACH ROW BEGIN INSERT INTO " + dbChanges + 
				"(tableName, rowId, type) VALUES('" + self.name +"'," + 
				"old."+ self.autoIncrement +"," + " 'DELETE'); END;";
			Devwik.SQL.execStatement(dropDeleteTrigger, true);
			Devwik.SQL.execStatement(deleteTrigger, true);

		}
		};

		Devwik.SQL.Table.prototype.setPublish = function() {
			var table = this;
			var fut = new Future();
			console.log('publish');
			// server: publish the table as a collection
			// TODO: Should be wrapped in future, but hangs at this point
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
				fut.ret();
				statement = "select * from " + table.name;
				query = Devwik.SQL.connection.query(statement, function(err, result) {
					if (err) {
						throw err;
					}
					_.each(result, function(row){
						self.added(table.name, row[table.autoIncrement], row);
					});
					self.ready();//indicate that the initial rows are ready
				});
			});
		return fut.wait();
		};
