var doneOnce = false;
Template.devwikTab.rendered = function() {
	var self = this;
	var button = this.find('button');
	$(button).on("click", function(event){
		var name = $(this).text();
		$('#devwikTableName').html(name);
		var table = new Meteor.Table(name);
		new Devwik.CollectionUi({
				collection: table,
				grid: {
					element: 'devwikTableUi'
				}
		});
		return(false);//prevent default button behavior
	});


};

Template.devwikProducts.rendered = function() {

};

Template.devwikProducts.devwikTables = function () {
	return Tables.find({});
};

