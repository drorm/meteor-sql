
/*
 * An SQL database view
 * * @param {String} name: the name of the view
 * * @param {Object} name: the table object for the view
 *
 * Views and table have a complicated relationship:
 * 1. A view is a kind of table. So it's both a table object and a View object.
 * The table object points to the view object: table.view and vice versa, the
 * view object points to the table object view.table.
 * 2. The View object has a link of the tables that the view depends on in 
 * view.tables. Whenever one of these tables changes the view changes too.
 * 3. Each table that's not a view has a list of views that are affected by
 * it. This list could be empty. Thi is the reverse of 2 above.
 */

//An SQL database view
Devwik.SQL.View = function(name, table) {
	var self = this,
	row = Devwik.SQL.View.list[name];
	self.name = name;
	self.table = table;
	self.tables = []; //List of tables this view depends on
	self.dbKeys = []; //List of keys this view depends on
	self.updatable = row.IS_UPDATABLE;
	self.query = row.VIEW_DEFINITION;

	Fiber(function() {
		//Now let's find the list of tables affected
		var explain = 'explain ' + self.query;
		var infoRows = Devwik.SQL.execStatement(explain);
		_.each(infoRows, function(infoRow){ //For each table in the db
			self.tables.push(infoRow.table);
		});
	}).run();

	Devwik.SQL.views[name] = self;
};

Devwik.SQL.View.list = {};

/*
 * Add rows to a view. Doesn't add any data to the db. Just
 * Queries the view to figure out which rows have been added to it.
 */
Devwik.SQL.View.prototype.add = function(tableName, key, id) {
	var self = this;
	var statement = squel.select().from(this.name).where(key  + " = '" + id + "'").toString();
	var table = self.table;
	rows = Devwik.SQL.execStatement(statement);
	_.each(rows, function(row){ //For each row affected
		_.each(table.handles, function (handle) {//Each client listening
			var key = self.createKey(row);
			handle.added(table.name, key, row);
		});
	});
};

/*
 * Create a composite key based on the individual keys in the table
 */
Devwik.SQL.View.prototype.createKey = function(row) {
	var self = this;
	var compositeKey = '';
	var separator = '';
	_.each(self.dbKeys, function(key){
		compositeKey += separator + row[key];
		separator = '-';
	});
	return (compositeKey);
};

	/*
	 * Tell tables which views depend on them
	 */
	Devwik.SQL.View.tableDependencies = function() {
		//For each views, find the tables
		_.each(Devwik.SQL.views, function(view) {
			//For each table
			_.each(view.tables, function(table) {
				var currTable = Devwik.SQL.tables[table];
				currTable.views.push(view.name);
				var keyName = Devwik.SQL.tables[table].dbKey;
				view.dbKeys.push(keyName);
			});
			view.table.setPublish();
			console.log(view.dbKeys);
		});
	};

	/*
	 * Get the list of views from the db
	 */
	Devwik.SQL.View.getViews = function(name) {
		var statement = squel.select().from('INFORMATION_SCHEMA.VIEWS').toString();
		var rows = Devwik.SQL.execStatement(statement);
		_.each(rows, function(row){ //For each table in the db
			Devwik.SQL.View.list[row.TABLE_NAME] = row;
		});
	};

