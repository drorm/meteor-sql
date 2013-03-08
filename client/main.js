var notDone = true;
var Foo = Meteor.Table('foo');

Template.show.rendered = function () {
	if (notDone) {
		notDone = false;
		Devwik.Utils.clickButton('#insert', function(event) {
			var insert = $('#fieldInsert').val();
			console.log(insert);
			Foo.insert({b:insert}, function(err, value) {
				$('#insertResult').html('Inserted:' + value);
				console.log(value);
			});
		});

		Devwik.Utils.clickButton('#update', function(event) {
			var update= $('#fieldUpdate').val();
			console.log(update);
			Foo.udpate(udpate, function(err, value) {
				$('#updateResult').html('Updated:' + value);
				console.log(value);
			});
		});

		Devwik.Utils.clickButton('#remove', function(event) {
			var remove= $('#fieldRemove').val();
			console.log(remove);
			Foo.remove(remove, function(err, value) {
				$('#updateResult').html('Deleted:' + value);
				console.log(value);
			});
		});
	}
};

Template.show.rows = function () {
	return Foo.find({}, {sort: {a: -1}});
};
