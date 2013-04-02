if (typeof Devwik == 'undefined') {
	/**
	 * @ignore
	 */
	Devwik = function() {};
}
"use strict";

/**
 * Devwik.CollectionUi: UI to list, add, update documents in a collection
 * Typical use:
 * 
 * @constructor
 * @param {object} args configuration
 * The Constructor recognizes the following properties 
 * <pre><code>
 *      property name  | type    | description
 *-------------------------------------------------------------------------------------------------
 *      collection  | [object]     | A Meteor Collection
 *      cursor      | [object]     | A Meteor Cursor
 *      cursor      | [object]     | A Devwik Cursor. Provides info about fields for an empty collection
 *      element     | [DOM element]| where the form is going to be located on a page $('#elementId')
 *      grid        | [Object]     | Arguments for the grid
 *      buttons     | [Object]     | Insert, Update, Delete buttons
 *      		
 * </code></pre>
 */


Devwik.CollectionUi = function(args) {
	var self = this;
	var showId = this.showId = args.showId; //by default we don't show the ID
	this.formElement = args.formElement;
	this.cursor = args.cursor;
	this.collection = args.collection;//TODO: required.
	if(args.cursor) {
		this.cursor = args.cursor;
	} else {
		this.cursor = this.collection.find();//Default, all rows
	}

	var formArgs = {collection:this.collection, cursor:this.cursor, element:this.formElement, style:'horizontal'};
	var gridArgs = args.grid;//Arguments passed for the grid
	if(args.dCursor) { //pass this to the grid and form
		gridArgs.dCursor = args.dCursor;
		formArgs.dCursor = args.dCursor; 
	}

	var form = new Devwik.Form(formArgs);

	var updateCallBack = function (id) {//when the row in the grid is clicked.
		form.update(id);
	};

	gridArgs.cursor = self.cursor;
	gridArgs.collection = self.collection;
	gridArgs.updateCallBack = updateCallBack;
	if (args.buttons) {
		gridArgs.buttons = args.buttons;
	} else {
		//use the default buttons
		gridArgs.buttons = {
			insert: gridArgs.element + 'Insert',
			update: gridArgs.element + 'Update',
			del: gridArgs.element + 'Delete'
			//Callback to bind the buttons in the page to the grid
		};
		gridArgs.dom="<'row'<'span4'l><'devwikGridButtons'><'span4'f>r>t<'row'<'span6'i><'span6'p>>";
		/* 
		 * The grid uses the above HTML to render.
		 * Once it's rendered it'll call the callback which will replace the devwikGridButtons DIV
		 * with the HTML of th ebuttons that have the id devwikDefaultButtons
		 */
		function displayButtons() {
			var frag = Meteor.render(function () {
					return Template.devwikCUIButtons({});//Display the buttons
			});
			$('.devwikGridButtons').replaceWith($(frag));
			//TODO won't work with passed buttons

			//Set the ids for thebuttons
	$('#devwikDefaultInsert').attr("id", gridArgs.buttons.insert);
	$('#devwikDefaultUpdate').attr("id", gridArgs.buttons.update);
	$('#devwikDefaultDelete').attr("id", gridArgs.buttons.del);

	//Handle update button
	if(gridArgs.buttons && gridArgs.buttons.update) {//update button external to the grid
		$("#" + gridArgs.buttons.update).on("click", function(event){
			var currentRow = self.grid.currentRow;
			//console.log('update:' + currentRow);
			if(Devwik.CollectionUi.checkCurrentRow(this, currentRow)) {
				form.update(currentRow);
			}
		});
	}

	//Handle del button
	if(gridArgs.buttons && gridArgs.buttons.del) {//del button 
		$("#" + gridArgs.buttons.del).on("click", function(event){
			var currentRow = self.grid.currentRow;
			//console.log('delete:' + currentRow);
			if(Devwik.CollectionUi.checkCurrentRow(this, self.grid.currentRow)) {
				self.grid.delCurrentRow();
			}
		});
	}

	//Handle insert button
	if(gridArgs.buttons && gridArgs.buttons.insert) {//insert button 
		$("#" + gridArgs.buttons.insert).on("click", function(event){
			console.log('insert:');
			form.insert();
		});
	}

		}
		if(!gridArgs.onRender) {
			gridArgs.onRender = displayButtons;
		}
	}

	self.grid = new Devwik.Grid(gridArgs);



};


	//Need to click on a row before update or delete
Devwik.CollectionUi.checkCurrentRow = function(element, currentRow) {
		if (currentRow) {
			$(element).popover('hide');
			return(true);
		} else {
			$(element).popover({trigger:'manual',placement:'bottom', title:'Click on a row first'});
			$(element).popover('show');
			return(false);
		}
};
