// TODO, func for .deny, for counters, check, ctime/mtime

// Modified from http://stackoverflow.com/a/3806596/1839099
var getCallerLine = function() {
	try { throw Error('') } catch(err) {
		var caller_line = err.stack.split("\n")[4];
		var index = caller_line.indexOf("at ");
		return caller_line.slice(index+3, caller_line.length);
	}
}

baseDb = Class.extend({
	init: function(obj) {
		if (!obj)
			obj = {};
		this.ctime = obj.ctime || new Date().getTime();
		this.updatedDbFields = {};
		if (!this.dbFields)
			this.dbFields = [];
		// need a local time for sorting; rather validate time on server
//		if (Meteor.isServer)
			this.dbFields.push('ctime');
		// this.dep = new Deps.Dependency();

		this.initDbFields(obj);
	},
	loadObj: function(obj) {
		if (!_.isObject(obj)) {
			obj = this.collection.findOne({_id: obj});
			if (!obj) obj = {};
		}
		this._id = obj._id;

		return obj;
	},
	initDbFields: function(initData) {
		if (!this.dbFields)
			this.dbFields = [];
		if (!this.schema)
			return;
		if (!_.isObject(initData))
			initData = this.collection.findOne({_id: initData});
		if (!initData)
			initData = {};
		if (initData._id)
			this._id = initData._id;

		var data;
		for (name in this.schema) {
			data = this.schema[name];
			this.dbFields.push(name);
			this[name] = typeof(initData[name]) != 'undefined' ? initData[name]
				: typeof(data.defaultValue) != 'undefined' ? data.defaultValue
				: data.type == 'object' ? {}
				: data.type == 'array' ? []
				: data.type == 'int' ? 0
				: ''; 
		}
	},
	save: function() {
		if (this._id && this.updatedDbFields.length == 0)
			return false;
		if (Meteor.isServer)
			this.update('mtime', new Date().getTime());
		if (this._id) {
			// this.collection.update(this._id, _.pick(this, this.dbFields));
			console.log({$set: this.updatedDbFields});
			this.collection.update(this._id, { $set: this.updatedDbFields } );
		} else {
			console.log(_.pick(this, this.dbFields));
			this._id = this.collection.insert(_.pick(this, this.dbFields));
		}
		this.updatedDbFields = [];
		return true;
	},
	/**
	  * Update: marks a field as updated and optionally updates field with new value.
	  *
	  *   .update(field, [value]);
	  *   .update({field: value, field: value});
	  *   .update([field, field, field]);
	  */
	update: function(field, value) {
		// TODO, add support for validators
		// TODO, validate HTML from wysihtml5
		if (_.isArray(field)) {
			console.log('Update fields: ' + field.join(','));
			var _this = this;
			_.each(field, function(key) {
				_this.updatedDbFields[field] = _this[field];
			});
		} else if (_.isObject(field)) {
			console.log('Update fields: ' + JSON.stringify(field));
			var _this = this;
			_.each(field, function(value, key, list) {
				_this.updatedDbFields[key] = _this[key] = value;
			});
		} else {
			console.log('Updated field "' + field + '"' + 
				(typeof value != 'undefined' ? ' to "' + value + '"' : ''));
			if (typeof value != 'undefined')
				this.updatedDbFields[field] = this[field] = value;
			else
				this.updatedDbFields[field] = this[field];
		}
		return true;
	},
	updateDbField: function(field, value) {
		console.log('Deprected updateDbField call from ' + getCallerLine());
		console.log('Update "' + field + "'");
		if (typeof(value) != 'undefiend')
			this[field] = value;
		this.updatedDbFields[field] = this[field];
		return true;
	},
	id: function() {
		return this._id;
	},
	dbObj: function() {
		return _.pick(this, this.dbFields);
	}
});

baseDb.defaultInsertDeny = function(user_id, doc) {
	// create time (createdAt) and modify time (updatedAt)
	doc.ctime = doc.mtime = new Date().getTime();

	// insert an author_id if no author_id/user_id set
	if (!(doc.author_id == user_id || doc.user_id == user_id))
		doc.author_id = user_id;

	return false;
}

baseDb.defaultUpdateDeny = function(user_id, doc) {
	doc.mtime = new Date().getTime();
	// don't allow change of user_id unless admin
	// maybe better to do per document/type
	return false;
}
