/*
 * A select statemet
 * * @param {String} statement: the actual select statment
 */

//An SQL select statement
Devwik.SQL.Select = function(name, statement) {
	var self = this;
	self.name = name;
	self.statement = statement;
	self.cols = [];
	var future = new Future();
	//Get the structure for a select
	Devwik.SQL.connection.query(statement, function(err, rows) {
		if (err) throw err;
		_.each(rows, function(row){
			if(self.cols.length === 0) {
				self.setCols(row);
			}
		});
		future.ret();
	}, self);
	future.wait();

	this.setPublish();
	return;
};


Devwik.SQL.Select.prototype.setCols = function(row) {
	var self = this;
		_.each(row, function(value, name){
	var col = {};
			col.name = name;
			col.type = Devwik.toType(value);
			self.cols.push(col);
		});
};

/*
 * Publish the Select to the client
 */

	Devwik.SQL.Select.prototype.setPublish = function() {
		var select = this;
		Meteor.publish(select.name, function () {
			var self = this;
			/*
			 * Set up the callbacks
			 */
			select.added = function(name, id, data) {
				self.added(name, id, data);
			};
			select.changed = function(name, id, data) {
				self.changed(name, id, data);
			};
			select.removed = function(name, id) {
				self.removed(name, id);
			};
			//fut.ret();
			query = Devwik.SQL.connection.query(select.statement, function(err, result) {
				if (err) {
					throw err;
				}
				_.each(result, function(row){
					self.added(select.name, new Meteor.Collection.ObjectID(), row);
				});
				self.ready();//indicate that the initial rows are ready
			});
		});
	};
