"use strict";
/**
 * Devwik.Utils: Various utility functions
 */
var Devwik = function() {};
Devwik.Utils = function() {};

/**
 * Devwik.Utils.clickButton: 
 * Typical use:
 *
 * @param {HTML} selection
 * @param {Function} Action on click
 */

Devwik.Utils.clickButton = function(selector, func) {
		$(selector).on("click", function(event){
			func(event);
			return(false);//prevent default button behavior
		});
};

/**
 * Devwik.Utils.callback: 
 * A generic callback to a Meteor action that is used to let the user know when there's an error
 *
 * @param {Object} error
 */

Devwik.Utils.callback = function(error) {
	if (error) {
		alert(_.values(error));
		console.log(_.values(error));
	} 
};

Devwik.Utils.getURLParameter = function(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
};


/**
 * Devwik Message: a message that displays around the toolbar to let the user know something happened
 * Similar to message in gmail when you archive a message
 * 
 * @param {String} message: the message you want to show
 * @param {int} time: the time in milliseconds before hiding the message
 */

Devwik.Utils.message = function(message, time) {

	$('#currentMessage').remove();//remove previous one if any
	var element = $('<span id="currentMessage" class="alert alert-success"></span>');
	element.append(message);
	$('body').append(element);
	element.show('fast');
	if(time) { //if we've got a time, remove after that time
		Meteor.setTimeout(function(){
			$(element).fadeOut("slow", function () {
				$(element).remove();
			});
		}, time);
	}
	};

	/**
	 * Devwik Dialog: display a message in a centered dialog
	 * 
	 * @param {String} message: the message you want to show
	 * @param {boolean} animate: animate the text?
	 */
	Devwik.Utils.dialog = function(message, animate) {
		var divId = Meteor.uuid();
		var div = $('<div class="devwikDialog" id="' + divId + '">'  + message + ' </div>');
		console.log('dialog');
		dialog = div.dialog({
			width: 400,
			height: 300
		});//show the dialog
		//Animate the message
		var element = $('#' + divId);

			function animateMessage() {
				element.show("slow").animate({"fontSize":"30px"},2000).animate({"fontSize":"50px"},2000);
				Meteor.setTimeout(animateMessage, 200);
			}
			if (animate) {

				animateMessage();
				return dialog;
			}
		};

		/**
		 * Devwik Link: create a clickable element
		 * 
		 * @param {String} text: the text you want to show
		 * @param {function} func: the function to call on click
		 */
		Devwik.Utils.link = function(text, func) {
			var element = '<a href="#">'  + text + ' </a>';
			$('body').on('click', $(element), func);
			return(element);
		};

		
/*
 * http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
 * By default Enter submits the form
 */
/* need jquery-ui for this
$(function() {
	$.extend($.ui.dialog.prototype.options, { 
			open: function() {
				var $this = $(this);

				// focus first button and bind enter to it
				//$this.parent().find('.ui-dialog-buttonpane button:first').focus();
				//When Enter is hit, submit the form with the first button
				$this.keypress(function(e) {
					if( e.keyCode == $.ui.keyCode.ENTER ) {
						$this.parent().find('.ui-dialog-buttonpane button:first').click();
						return false;
					}
				});
			} 
	});
});
*/
