var notDone = true;
var Employee = new Meteor.Table('employees');
Meteor.subscribe('meteor_tables');
var Tables = new Meteor.Collection('meteor_tables');

Template.devwikEmployees.rendered = function () {
	if (notDone) {//do it once
		notDone = false;
		Devwik.Utils.clickButton('#insert', function(event) {
			var insert = {};
			insert.firstName  = $('#inputFirst').val();
			insert.lastName = $('#inputLast').val();
			insert.email = $('#inputEmail').val();
			insert.jobTitle  = $('#inputTitle').val();
			console.log(insert);
			Employee.insert(insert, function(err, value) {
				if (err) {
					alert(_.values(err));
				} else {
					$('#insertResult').html('Inserted:' + value);
					console.log(value);
				}
			});
		});

		Devwik.Utils.clickButton('#update', function(event) {
			var id= $('#updateId').val();
			 update = {};
			update.firstName  = $('#updateFirst').val();
			update.lastName = $('#updateLast').val();
			update.email = $('#updateEmail').val();
			update.jobTitle  = $('#updateTitle').val();
			Employee.update(update, id, function(err, value) {
				if (err) {
					alert(_.values(err));
				} else {
					console.log(value);
				}
			});
			return(false);
		});

		Devwik.Utils.clickButton('#remove', function(event) {
			var remove= $('#fieldRemove').val();
			console.log(remove);
			Employee.remove(remove, function(err, value) {
				if (err) {
					alert(_.values(err));
				} else {
					$('#deleteResult').html('Deleted:' + value.affectedRows);
					console.log(value);
				}
			});
		});

	}
	};

	Template.employeeRows.employees = function () {
		return Employee.find({}, {sort: {employeeNumber: -1}});
	};

	Template.devwikEmployees.eSelects = function () {
		return Employee.find({}, {sort: {employeeNumber: -1}});
	};


	function deleteEmployee(number) {
		console.log('remove:' + number);
		Employee.remove(number, function(err, value) {
			if (err) {
				alert(_.values(err));
			}
		});
		}
