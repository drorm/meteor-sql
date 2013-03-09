//Database properites
//TODO: Namespace everything in here
var database ='meteor',
	user ='meteor',
	host ='localhost',
	password = '43b27d6bf68d30';
var dbConfig = {
		host     : host,
		database : database,
		user     : user,
		password : password
};

var triggerSuffix = 'MeteorTrigger',
	pollInterval = 100, //How often in ms we poll for changes in the db
	dbPrefix= 'meteor_',//Prefix for Meteor's tables
	tableCollection = dbPrefix + 'tables', //where we keep the table sctruture
	dbChanges = dbPrefix + 'dbchanges';//Table that keeps track of changes
