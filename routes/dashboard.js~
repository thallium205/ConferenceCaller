var User = require('../models/users');

exports.index = function(req, res)
{
	User.get(req.user.id, function(err, user)
	{
		if (err)
		{
			console.log('dashboard.User.get: ' + err);
			return next(err);
		}

		User.contacts(user.accessToken, function(contacts)
		{			
			res.render('dashboard', {user: req.user, contacts: contacts});
		});
	});	
};

