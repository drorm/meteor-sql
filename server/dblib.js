/*
 * Misc database library functions
 */

/*
 * Execute an SQL statement. This can be both DML (queries) or DDL (create/alter)
 * @param {String} statement : The statement to run
 * @param {Boolean} throwException : If true, throw exception on error. Default:false
 * @returns {array} rows:The rows, if any returned by the query
 */
Devwik.SQL.execStatement = function(statement, transaction) {
	var future = new Future();
	if(transaction) {
		console.log('tranaction');
		if(transaction.cancelled) {
			console.log('tranaction cancelled');
			//not doing anything in this transaction
			return([]);
		}
	}
	query = Devwik.SQL.connection.query(statement, function(err, result) {
		if (err) {
			if(transaction) {
				transaction.cancelled = true;
			}
			console.log(err);
			console.log(err.stack);
		}
		future.ret(result);
	});
	return(future.wait());
};


/*
 * Escape an SQL statement to try and catch SQL injections
 */
Devwik.SQL.escape = function(statement) {
	statement = statement.toString();//For consistency let's convert to string
	statement = Devwik.SQL.connection.escape(statement).toString();
	statement = statement.substring(1, statement.length-1);
	return(statement);
};


/*
 * Wrap a function in an SQL Transaction
 * @param {Function} func: the function that performs the SQL operations
 * @param {Function} errFunc: optional function to call on error
 *    
 */

Devwik.SQL.Transaction = function(){
	var connection = Devwik.SQL.connection;
	if(!connection) {
		console.log ("No database connection");
		return null;
	}
	connection.query('START TRANSACTION');
	return(this);
};


Devwik.SQL.Transaction.prototype.end = function() {
	var self = this;
	var connection = Devwik.SQL.connection;
	if(self.cancelled) {
	console.log('rollback');
	connection.query('ROLLBACK');
	} else {
	console.log('commit');
	connection.query('COMMIT');
	}
};

Devwik.SQL.Transaction.prototype.commit = function() {
	Devwik.SQL.connection.query('COMMIT');
};

Devwik.SQL.Transaction.prototype.rollback = function() {
	Devwik.SQL.connection.query('ROLLBACK');
};
