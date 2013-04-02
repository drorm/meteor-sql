if (typeof Devwik == 'undefined') {
	/**
	 * @ignore 
	 */
	Devwik = function() {};
}
"use strict";

/**
 * Devwik.Grid: Create an in browser grid based on http://datatables.net/index
 * Typical use:
 * new Devwik.Grid({cursor:Customers.find(), element:'customers'});
 * 
 * @constructor
 * @param {object} args configuration
 * <pre><code>
 *
 * The Constructor recognizes the following properties 
 *      property name  | type    | description
 *-------------------------------------------------------------------------------------------------
 *      cursor       | [object]     | A Meteor Cursor: Collection.find(args ...)
 *      showId       | [Boolean]    | By default we don't show the id. Set to true to show it
 *      dom          | [String]     | HTML to pass to the datatable about how to layout things
 *      element      | [DOM element]| where the grid is going to be located on a page $('#elementId')
 *      deleteButton | [Boolean]    | Provide delete button in the grid?
 *      editoButton  | [Boolean]    | Provide edit button in the grid?
 *      updateCallBack |function]   | Called when the row is clicked for an update.
 *      onRender     | [function]   | Callback after the grid id rendered. Typically to add/change layout
 *      buttons      | [Object]     | Buttons to include in the grid: 
 *       deleteButton| [boolean]    | Inlucde a delete button in the grid
 *       editButton  | [boolean]    | Inlucde an edit button in the grid
 *       fields      | [array]      | Only display these fields
 * </code></pre>
 */


Devwik.Grid = function(args) {
	var self = this;
	_.extend(self, args);//Copy all the args into this/self

	this.table = null;
	this.tabId = 'tab-' + this.element;//Tab's element
	if(self.dCursor) {
		self.init();
	}

	var handle = this.cursor.observe({
			added: function (row) {
				self.add(row);
			},
			removed: function (row) {
				self.remove(row);
			},
			changed: function (doc, index) {
			console.log("Changing");
				self.change(doc);
			}

	});

};

Devwik.Grid.prototype.init = function() {
	var self = this;
		if (!this.dCursor) {
			this.dCursor = new Devwik.Cursor(this.cursor, this.fields);//Provides us with all the info about this collection
		}

		var cols = new Array();//Array to store the column names
		_.each(this.dCursor.cols, function(field) { //save the column name
			if ((field.name != '_id')|| this.showId) { //by default don't show the _id
				cols.push({sTitle: field.name}); //simple case
				//console.log(field.name + " :" + showId);
			} else if (field.name == '_id') {
				cols.push({sTitle: field.name,
						"bSearchable": false,
						"bVisible":    false }
				);
			}
		});

		if (self.deleteButton) {//If we have a delete button in the grid, blank header for it
			cols.push({sTitle: ''});
		}

		if (self.editButton) {//If we have an edit button in the grid, blank header for it
			cols.push({sTitle: ''});
		}

		//And now create the empty grid
		$('#' + this.element).html( //TODO: provide an override
			'<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" id="' + self.tabId + '"></table>' );
		var gridDom = "<'row'<'span4'l><'span4'f>r>t<'row'<'span3'i><'span3'p>>"; //This is the default
		if (self.dom) {
			gridDom = self.dom;
		}

		//This creates the datatable grid
		self.table = $('#' + self.tabId).dataTable( {
				"aoColumns": cols, //the column titles
				"sDom": gridDom
		} );	

		if(self.onRender) {
			self.onRender();//call back when we've rendered the grid
		}

};

/**
 * Add a row to the grid. 
 * This is where we also draw the grid since based on the first document we know which fields we have.
 */

Devwik.Grid.prototype.add = function(row) {
	var self = this;
	if (!self.table) {
		self.init();
	}

	//Now get the actual data
	var data = new Array();
	_.each(this.dCursor.cols, function(col) {
		var value = row[col.name];
		data.push(Devwik.Grid.colDisplay(col, value, row._id));
	});

	if (self.deleteButton) {
		var delId = 'del-' + row._id;
		data.push('<i id="' + delId +'" class="icon-trash"></i>');
	}

	if (self.editButton) {
		var editId = 'edit-' + row._id;
		data.push('<i id="' + editId +'" class="icon-pencil"></i>');
	}


	$(document).data(self.tabId,self.table);
	$('#' + self.tabId).dataTable().fnAddData(data);

	$('#' + self.tabId + ' tbody td').unbind();//we're handling the click
	$('#' + self.tabId + ' tbody td').click( function (event) {//When a cell is clicked
		var id;
		if (event.target.id) {
			if (event.target.id.match(/^del-/, "")) {//delete button in the grid
				id  = event.target.id.replace(/^del-/, "");//get the pure id
				self.collection.remove(id);//delete from the db
				if ( $(this).length !== 0 ) {
					self.table.fnDeleteRow( $(this)[0] );
				}
			} else { //update button in the grid
			id  = event.target.id.replace(/^edit-/, "");//get the pure id
			self.updateCallBack((id));//Call the callback with the row id
			}
		} else { // not a specific button, default to update
		var tableId = $(this).closest("table").attr("id");
		var oTable = $(document).data(self.tabId);
		// Get the position of the current data from the node

		var aPos = oTable.fnGetPosition( this );

		// Get the data array for this row
		var aData = oTable.fnGetData( aPos[0] );
		console.log(aData[0]);
		self.currentRow = aData[0];
		var row = $(this).closest("tr");
		console.log(row);
		if(self.buttons && self.buttons.update) {//Just highlight the row for update or delete
			if ( $(row).hasClass('success') ) {//Bootstrap class. That's our indication that the row
				$(row).removeClass('success');   //was seletec
			} else {
				oTable.$('tr.success').removeClass('success');
				$(row).addClass('success');
			}
		} else {//When a row is clicked, we call the update callback
		console.log(self.buttons);
		self.updateCallBack((aData[0]));//Call the callback with the row id when clicked
		}
		}
	} );
};

/**
 * Document was removed from the collection.
 * Now remove a row from the grid. 
 * Can happen because of a local or a remote action.
 */

Devwik.Grid.prototype.remove = function(row) {
	self = this;
	var rowPos = this.findRow(row._id);
	if (rowPos == -1) {
		console.error("Can't find in the grid id:" + row._id);
	} else {
		this.table.fnDeleteRow(rowPos);
	}
};

/**
 * Document was changed in the collection.
 * Now update the row in the grid. 
 * Can happen because of a local or a remote action.
 */
Devwik.Grid.prototype.change = function(row) {
	self = this;
	var rowPos = this.findRow(row._id);
	if (rowPos == -1) {
		console.error("Can't find in the grid id:" + row._id);
	} else {
		//Now set the actual data
		var ii = 0;
		_.each(this.dCursor.cols, function(col) {//For each column in the ohdocument
			var value = row[col.name];
			var display = Devwik.Grid.colDisplay(col, value, row._id);
			self.table.fnUpdate( display, rowPos, ii );//Update the col in the grid
			ii++;
		});

	}
};

/**
 * Find a row in the grid using its Meteor ID
 */
Devwik.Grid.prototype.findRow = function(id) {
	var data = this.table.fnGetData();
	for(var ii = 0; ii < data.length; ii++) {
		var row = data[ii];
		//console.log('id ' +  row[0]);//ID is in position 0 TODO can we rely on this?
		if(id == row[0]) {
			return(ii);
		}
	}
	return(-1);//didn't find it
};

Devwik.Grid.prototype.getCurrentRow = function() {
	return (this.currentRow);
};

/**
 * Delete the previously chosen row from the collection. 
 */
Devwik.Grid.prototype.delCurrentRow = function() {
	//return (this.currentRow);
	//delete from the db. We're observing the collection it will cause it to be remove in the grid as well.
	this.collection.remove(this.currentRow);
};

/**
 * Convert the data for the col from the db represenation to grid represenatation
 */
Devwik.Grid.colDisplay = function(col, value, id) {
	var display;
	switch (col.type) {
	case 'array':
	case 'object':
		var target = id + col.name;
		var string = '<pre><code>'+ JSON.stringify(value, null, '  ') + '</code></pre>';
		var collapsable = '<button type="button" class="btn " data-toggle="collapse"\
		data-target="#' + target + '"> Show </button>\
		<div id="' + target + '" class="collapse">' + string + '</div>';
		display = collapsable;
		break;
	default:
		display = value;
		break;
	}
	return(display);
};
