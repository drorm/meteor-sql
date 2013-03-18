/*
 * Misc database library functions
 */

Devwik.SQL.escape = function(statement) {
	statement = Devwik.SQL.connection.escape(statement).toString();
	statement = statement.substring(1, statement.length-1);
	return(statement);
};
