Package.describe({
    summary: "dbObj, useful wrapper for using db JSON objects in Meteor with Mongo"
});

Package.on_use(function (api) {
	api.add_files(['ejohn-inheritance.js', 'dbObj.js'], ['client', 'server']);
	if (api.export)
		api.export('baseDb', ['client', 'server']);
});
