var Meetings = require('../models/meetings');

// GET /mettings/:id
exports.list = function(req, res, next)
{
	Meetings.get(req.user.id, function (err, meetings)
	{
		if (err)
		{
			console.log('route.meetings.get: ' + err);
			return next(err);
		}

		res.send(200, {meetings: meetings});
	});
}

// POST /meetings/:id
exports.create = function(req, res, next)
{
	// Save meeting in datastore
	Meetings.create(req.body.name, req.body.organizerPhone, req.body.date, req.body.time, JSON.stringify(req.body.people), req.user.id, function (err, id)
	{
		if (err)
		{
			console.log('route.meetings.create: ' + err);
			return next(err);
		}

		Meetings.schedule(id, cli, function(err, stat)
		{
			if (err)
			{
				console.log('route.meetings.create: ' + err);
				return next(err)
			}
			
			console.log(stat);

			// Email the participants TODO

			res.send(200, {meeting: id});
		});
		
	});	
}

// DELETE /meetings/:id
exports.del = function (req, res, next)
{
	Meetings.del(req.user.id, req.params.id, function (err)
	{
		if (err)
		{
			console.log('route.meetings.del: ' + err);
			return next(err);
		}

		// Email the participants TODO

		res.send(200, {});
	});	
}
