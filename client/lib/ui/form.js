if (typeof Devwik == 'undefined') {
	/**
	 * @ignore 
	 */
	Devwik = function() {};
}
"use strict";
Devwik.FormList = {}; //Object to store the list of forms

/**
 * Devwik.Form: 
 * Typical use:
 * new Devwik.Grid({cursor:Customers.find(), element:'customers'});
 * 
 * @constructor
 * @param {object} args configuration
 * The Constructor recognizes the following properties 
 *      property name   | type         | description
 *-------------------------------------------------------------------------------------------------
 *  @param    [object]  cursor  --  A Meteor Cursor: Collection.find(args ...)
 *  @param    [object]  collecti--  A Meteor Collection
 *  @param    [Dom Element]  element -- Where the form is going to be located on a page $('#elementId')
 *  @param    [Boolean] showId  --  By default we don't show the id. Set to true to show it
 *  @param    [String]  style   --  options horizontal or inline form, based on Boostrap's defnition of these
 *  @param    [String]  showEg  --  Show something like "e.g joe" in the field. The value is fetched from the first row in results
 */


Devwik.Form = function(args) {
	var self = this;
	_.extend(self, args);//Copy all the args into this/self
	this.collection = args.collection;
	this.configured = false; //Initial configuration hasn't been done
	this.doModal = false; 
	this.templateArgs = new Object(); //things we need to pass to the template
	var styles = {
		inline: " form-inline span3 ",
		horizontal:" form-horizontal span5 "
	};
	if (!args.style || !styles[args.style] ) {//not passed in, or we don't recognize it
		args.style = 'horizontal';
	} 
	self.templateArgs.style = styles[args.style];
	self.templateArgs.element = self.element;
	if(!self.element) {
		self.element = Meteor.uuid();
		self.doModal = true;
	}
	Devwik.FormList[self.element] = self; //So we can retrieve it later by id
	Session.set('currentElement', self.element);//TODO won't work with multiple forms

	if (self.dCursor) {
				self.create();
	} else {
	self.handle = self.cursor.observe({
			added: function (row) {
				self.create(row);
			}
	});
	}
};


Devwik.Form.prototype.create = function(row) {
	var self=this;
	var tabId = 'tab-' + self.element;//Tab's element
	if (self.dCursor) {
		self.cols = self.dCursor.cols; //Get the info about the columns
	} else {
		self.cols = Devwik.Cursor.Fields(row); //Get the info about the columns
	}
	//console.log('id:' + self.cols);
	//this.handle.stop();// Once we get the first row, don't need to get more
	if (self.configured === false) {
		var inputId = self.element + 'devwikInputs';
		self.insertId = self.element + 'DevwikInsert';
		self.modalId = self.element + 'Modal';
		Session.set('modalId', self.modalId);
		self.templateArgs.inputId = inputId;
		self.templateArgs.insertId = self.insertId;
		self.templateArgs.element = self.element;
		Session.set('templateArgs', self.templateArgs);
		self.configured = true;
	}
};

/*
 * Show the update form
 * @param {string} id of the document
 */
Devwik.Form.prototype.update = function(id) {
	var self=this;
	self.currentRow = id;
	console.log('Update:' + self.element + " :" + id);
	if (self.doModal) {//we haven't displayed it yet
		$('#' + self.modalId).modal('show');
	}

	$('#' + self.insertId).text('Update');//Can't do it with Meteor templating
	self.templateArgs.insertUpdate = 'Update';

	//populate the form with the values
	var row = self.collection.findOne(id);
	_.each(self.cols, function(field) { //set the values
		if ((field.name != '_id') || self.showId) { //by default don't show the _id
			var id =	self.element + 'Devwik' + field.name ;
			$('#' + id).val(row[field.name]);
		}
	});
};

/*
 * Show the insert form
 */
Devwik.Form.prototype.insert = function() {
	var self=this;
	Session.set('insertUpdate', 'Insert');
	self.templateArgs.insertUpdate = 'Insert';
	Session.set('templateArgs', self.templateArgs);
	$('#' + self.modalId).modal('show');
};

/*
 * Clear the form from data
 */
Devwik.Form.prototype.clear = function() {
	var self=this;
	_.each(self.cols, function(field) { //get the values
		if ((field.name != '_id') || self.showId) { //by default don't show the _id
			id =	self.element + 'Devwik' + field.name ;
			$('#' + id).val('');//clear the field
		} 
	});
};

//Helpers for the modal 
Template.modalTemplate.modalId = function () {
	return(Session.get('modalId'));
};

//Indicates if it's an insert or update
Template.modalTemplate.insertUpdate = function () {
	return(Session.get('insertUpdate'));
};


Template.formTemplate.helpers({
		args: function () {
			//var type = Session.get("currentField");
			return Session.get("templateArgs");
		}
});

Template.formTemplate.formFields = function () {
	var cols =[];
	var id = Session.get('currentElement');
	if (id) {
	var self = Devwik.FormList[id];
	if (self && self.cols) {
	_.each(self.cols, function(field) { //get the values  TODO: need to generalize this
		if ((field.name != '_id') || self.showId) { //by default don't show the _id
			field.element = self.element;
			switch(field.type) {
			case 'string':
				field.htmlType = 'text';
				break;
			case 'boolean':
				field.htmlType = 'checkbox';
				break;
			default:
				field.htmlType = field.type;
				break;
			}
			cols.push(field);
		} 
	});
	}
	}
	return(cols);
};

Template.formTemplate.rendered = function () {
	var inputId = $(this.find('.formFields')).attr('id');
	var id = inputId.replace(/devwikInputs/, "");//get the pure id
	var self = Devwik.FormList[id];

		if(self) {
			$('#' + self.insertId ).unbind();//We're handling the click
			$('#' + self.insertId ).on("click", function(event){ //insert a row
				var updateId = null;
				var object = new Object(); //our insert object
				_.each(self.cols, function(field) { //get the values
					if ((field.name != '_id') || self.showId) { //by default don't show the _id
						id =	self.element + 'Devwik' + field.name ;
						object[field.name] = $('#' + id).val();
					} 
				});
				var action = $('#' + self.insertId).html();//Can be Insert or Update
				if(action == 'Insert') {
					self.collection.insert(object);
				} else { //update
				self.collection.update(self.currentRow, object);

				}
				if (self.doModal) {
					$('#' + self.modalId).modal('hide');
				}
				self.clear();
				return(false);
			});
		}
};
