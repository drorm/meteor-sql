/*
 * A select statemet
 * * @param {String} statement: the actual select statment
 */

//An SQL select statement
Devwik.SQL.Select = function(statement) {
	var self = this;
	self.statement = statement;
	self.cols = [];
	var future = new Future();
	//Get the structure for a table
	Devwik.SQL.connection.query(statement, function(err, rows) {
		if (err) throw err;
		_.each(rows, function(row){
			if(self.cols.length === 0) {
				self.setCols(row);
				console.log(row);
			}
		});
		future.ret();
	}, self);
	future.wait();

		//this.setPublish();
	return;
};


Devwik.SQL.Select.prototype.setCols = function(row) {
	var self = this;
		_.each(row, function(value, name){
	var col = {};
			col[name] = value;
			self.cols.push(col);
			console.log(col);
		});
};
