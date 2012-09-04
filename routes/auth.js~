var passport = require('passport');

exports.login = passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.google.com/m8/feeds'] }),
	function (req, res)
	{
		// This function will not be called
	};

exports.logout = function(req, res)
{
	req.logout();
	res.redirect('/');
}

