if (typeof Devwik == 'undefined') {
	/**
	 * @ignore 
	 */
	Devwik = function() {};
}

Devwik.Field = function(field, name) {
	this.name = name;
	this.type = Devwik.toType(field);
	console.log('field:' + name + + " type:" + this.type);
};

//based on http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
Devwik.toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

Devwik.testTypes = function() {
	console.log(Devwik.toType({a: 4})); //"object"
	console.log(Devwik.toType([1, 2, 3])); //"array"
	(function() {console.log(Devwik.toType(arguments));})(); //arguments
	console.log(Devwik.toType(new ReferenceError)); //"error"
	console.log(Devwik.toType(new Date)); //"date"
	console.log(Devwik.toType(/a-z/)); //"regexp"
	console.log(Devwik.toType(Math)); //"math"
	console.log(Devwik.toType(JSON)); //"json"
	console.log(Devwik.toType(new Number(4))); //"number"
	console.log(Devwik.toType(new String("abc"))); //"string"
	console.log(Devwik.toType(new Boolean(true))); //"boolean"
	var a = 'foo'/0;
	console.log(Devwik.toType(a)); //"number"
	console.log(Devwik.toType(null)); //"null"
};

/**
 * @param {object} cursor: a Meteor cursor returned from Collection.find()
 * If fields are specified, only include these fields.
 * Always include _id
 */

Devwik.Cursor = function(cursor, fields) {
		self=this;
		self.cols = new Array();//Array to store the column names
	if(Devwik.toType(cursor) === 'array') {//Devwik list of fields
				_.each(cursor, function(f) { //save the keys
						var field = new Object();
						field.name = f.name;
						field.type = f.type;
						self.cols.push(field);
				});
				console.log(self.cols);
	} else { //Meteor cursor
		this.name = cursor.collection_name;
		//We need to fetch the first row to figure out the structure
		try {
			cursor.forEach(function(row) {
				var arrayKeys = _.keys(row); //All the keys/fields in the cursor
				_.each(arrayKeys, function(key) { //save the keys
					if(key == '_id' || !fields || _.contains(fields, key)) {//If fields are specified, filter
						var field = new Object();
						field.value = row[key];
						field.name = key;
						field.type = Devwik.toType(field.value);
						self.cols.push(field);
						//console.log('name:' + field.name + " val:" + field.value + ' type:' + field.type);
					}
				});
				throw('Devwik done');//done looking
			}, self.cols);
		} catch(err) {
			//do nothing since we threw the error.
		}
	}
};

	/* 
	 * Static function
	 */
	Devwik.Cursor.Fields = function(row) {
		cols = new Array();//Array to store the column names
		var arrayKeys = _.keys(row); //All the keys/fields in the cursor
		_.each(arrayKeys, function(key) { //save the keys
			var field = new Object();
			field.value = row[key];
			field.name = key;
			field.type = Devwik.toType(field.value);
			cols.push(field);
			//console.log('name:' + field.name + " val:" + field.value + ' type:' + field.type);
		});
		return(cols);
	};

	Devwik.Cursor.prototype.toString = function() {
		return JSON.stringify(this.cols);
	};
