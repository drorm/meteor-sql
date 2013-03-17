/*
 * Configuration of the Meteor SQL Driver
 */
//Database properties. Change to match your site
Devwik.SQL.Config ={};
Devwik.SQL.Config.database ='meteor';
Devwik.SQL.Config.user ='meteor';
Devwik.SQL.Config.host ='localhost';
Devwik.SQL.Config.password = '43b27d6bf68d30';
Devwik.SQL.Config.dbConfig = {
	host     : Devwik.SQL.Config.host,
	database : Devwik.SQL.Config.database,
	user     : Devwik.SQL.Config.user,
	password : Devwik.SQL.Config.password
};

Devwik.SQL.Config.triggerSuffix = 'MeteorTrigger';
Devwik.SQL.Config.pollInterval = 100; //How often in ms we poll for changes in the db
Devwik.SQL.Config.dbPrefix= 'meteor_';//Prefix for Meteor's tables
Devwik.SQL.Config.tableCollection = Devwik.SQL.Config.dbPrefix + 'tables'; //where we keep the table sctruture
Devwik.SQL.Config.dbChanges = Devwik.SQL.Config.dbPrefix + 'dbchanges';//Table that keeps track of changes
