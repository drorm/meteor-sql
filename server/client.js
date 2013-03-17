/*
 * Handle calls from the client
 */
Meteor.methods({
		SQLinsert: function (table, args) {
			try {
				var statement = squel.insert().into(table);
				_.each(args, function(value, key) {
					value = Devwik.SQL.escape(value);
					statement.set(key, value);
				});

				console.log(statement.toString());
				var id = Devwik.SQL.execStatement(statement.toString());
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(id.insertId);
		},
		SQLupdate: function (table, args, where) {
			try {
				var statement = squel.update().table(table);
				_.each(args, function(value, key) {
					value = Devwik.SQL.escape(value);
					statement.set(key, value);
				});
				statement.where(where);
				console.log(statement.toString());
				var ret = Devwik.SQL.execStatement(statement.toString());
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(ret);
		},
		SQLremove: function (table, criteria) {
			try {
				criteria = Devwik.SQL.escape(criteria);
				var statement = 'delete from ' + table + ' ' +  criteria;
				console.log(statement);
				var ret = Devwik.SQL.execStatement(statement);
			} catch (err) {
				console.log("Caught error:" + err);
				throw new Meteor.Error(err.message);
			}
			return(ret);
		}
});
