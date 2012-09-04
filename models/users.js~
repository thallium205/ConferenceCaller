var sqlite3 = require('sqlite3').verbose();
var https = require('https');
var http = require("http");

var User = module.exports = 
{
	save: function(googleId, accessToken, refreshToken, callback)
	{
		var db = new sqlite3.Database('db.sql');
		var save = db.prepare('INSERT OR REPLACE INTO User VALUES (?, ?, ?)');
		save.run(googleId, accessToken, refreshToken, function(err)
		{
			if (err)
			{
				console.log('Users.save: ' + err);
			}

			return callback(err);

		});
	},

	get: function(googleId, callback)
	{
		var db = new sqlite3.Database('db.sql');
		db.each('SELECT googleId, accessToken, refreshToken FROM User WHERE googleId = (?) LIMIT 1', googleId, function(err, row)
		{
			if (err)
			{
				console.log('Users.get: ' + err);
				return callback(err);
			}
			
			callback(null, row);
		});
	},

	// Given a Google Access Token, this will return the first 500 contacts from their Contacts
	contacts: function(accessToken, callback)
	{	
		var options = 
		{
			host: 'www.google.com',
			port: 443,
			path: '/m8/feeds/contacts/default/full?max-results=500&alt=json',
			method: 'GET',
			headers: 
			{
				Authorization: 'OAuth ' + accessToken
			}
		};

		getJSON(options, function(statusCode, result)
		{
			callback(result.feed.entry)
		});		
	}
}

function getJSON(options, onResult)
{
	var prot = options.port == 443 ? https : http;
	var req = prot.request(options, function(res)
	{
		var output = '';
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
		    output += chunk;
	});

		res.on('end', function() {
		    var obj = JSON.parse(output);
		    onResult(res.statusCode, obj);
		});
	});

	req.on('error', function(err) 
	{
		console.log('Users.getJSON: ' + err);
	});

	req.end();
};
