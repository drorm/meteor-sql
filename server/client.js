/*
 * Handle calls from the client
 */
Meteor.methods({
		//TODO: Remember Bobby, need to sanitize all the data
		SQLinsert: function (table, args) {
			try {
				var statement = 'insert into ' + table + ' (',
				values = ' VALUES (',
				comma = '';
				_.each(args, function(value, key) {
					statement += comma + key;
					values += comma + value;
					comma = ', ';
				});
				values += ') ';
				statement += ') ' + values;

				console.log(statement);
				var id = Devwik.SQL.execStatement(statement);
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(id.insertId);
		},
		SQLupdate: function (table, criteria) {
			try {
				var statement = 'update ' + table + ' ' +  criteria;
				console.log(statement);
				var id = Devwik.SQL.execStatement(statement);
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(id.insertId);
		},
		SQLremove: function (table, criteria) {
			try {
				var statement = 'delete from ' + table + ' ' +  criteria;
				console.log(statement);
				var id = Devwik.SQL.execStatement(statement);
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(id.insertId);
		}
});
