var express = require('express')  
  , http = require('http')
  , path = require('path')
  , sqlite3 = require('sqlite3').verbose()
  , passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy  
  , User = require('./models/users')
  , twilioAPI = require('twilio-api')
  , routes = require('./routes');


// Setup database - we either create a new one or open an existing one
var db;
path.exists('./db.sql', function(exists)
{
	if (!exists)
	{
		db = new sqlite3.Database('db.sql');		
		db.run('CREATE TABLE User (googleId TEXT, accessToken TEXT, refreshToken TEXT, PRIMARY KEY(googleId))');	
		db.run('CREATE TABLE Meeting (id INTEGER, name TEXT, organizerPhone TEXT, date TEXT, time TEXT, people BLOB, User_googleId TEXT, PRIMARY KEY(id), FOREIGN KEY (User_googleId) REFERENCES User(googleId))');		
	}

	else
	{
		db = new sqlite3.Database('db.sql');
	}
});


// Setup passport
passport.serializeUser(function(user, done)
{
	done(null, user);
});

passport.deserializeUser(function(obj, done) 
{
	done(null, obj);
});

passport.use(new GoogleStrategy(
	{
		clientID: '128348422060.apps.googleusercontent.com',
		clientSecret: '6ohU7GILYZURhrleZVyBfx8P',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	function(accessToken, refreshToken, profile, done) 
	{
		process.nextTick(function () 
		{	
			User.save(profile.id, accessToken, refreshToken, function (err)
			{
				if (err)
				{
					console.log(err); // CLEANUP TODO
				}
			});

			return done(null, profile);
		});
	}
));

// Setup singleton application
app = module.exports = express();
app.configure(function()
{
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// Configure application
app.configure('development', function()
{
	app.use(express.errorHandler());
});

// Setup singleton Twilio (and its middleware)
cli = new twilioAPI.Client('AC29cbb024f148997bd24b61b2f195f2e9', 'b758297555c0ed59ce7548eda1c8e94e');
app.use(cli.middleware());

// Define routes
app.get('/', routes.site.index);
app.get('/dashboard', isAuth, routes.dashboard.index);

app.get('/meetings', isAuth, routes.meetings.list);
app.post('/meetings/:id', isAuth, routes.meetings.create);
app.del('/meetings/:id', isAuth, routes.meetings.del);

app.get('/auth/google', routes.auth.login);
app.get('/auth/logout', routes.auth.logout);
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {res.redirect('/dashboard');});

// Start service
http.createServer(app).listen(app.get('port'), function()
{
	console.log("Express server listening on port " + app.get('port'));
});

// Auth middleware
function isAuth(req, res, next) 
{
	if (req.isAuthenticated())
	{
		return next(); 
	}

	res.redirect('/');
}
