/*
 * Misc database library functions
 */

/*
 * Escape an SQL statement to try and catch SQL injections
 */
Devwik.SQL.escape = function(statement) {
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
