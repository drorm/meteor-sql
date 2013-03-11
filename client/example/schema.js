//This is not a real table. Just information about the database
//schema
Template.devwikTables.rendered = function () {
};

Template.devwikTables.tables = function () {
	return Tables.find({});
};
