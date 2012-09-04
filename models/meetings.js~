var sqlite3 = require('sqlite3').verbose()
  , cronJob = require('cron').CronJob;

var Meeting = module.exports = 
{
	create: function(name, organizerPhone, date, time, people, userId, callback)
	{
		var db = new sqlite3.Database('db.sql');
		var save = db.prepare('INSERT INTO Meeting VALUES (?, ?, ?, ?, ?, ?, ?)');
		save.run(null, name, organizerPhone, date, time, people, userId, function(err, id)
		{
			if (err)
			{
				console.log('Meeting.save: ' + err);
				return callback(err);
			}

			db.each('SELECT last_insert_rowid() AS id', function (err, row)
			{
				if (err)
				{
					console.log('Meeting.save: ' + err);
					return callback(err);
				}	

				return callback(null, row.id);
			});	
		});
	},

	get: function(userId, callback)
	{
		var db = new sqlite3.Database('db.sql');
		db.all('SELECT id, name, organizerPhone, date, time, people, User_googleId FROM Meeting WHERE User_googleId = (?)', userId, function(err, rows)
		{
			if (err)
			{
				console.log('Meeting.get: ' + err);
				return callback(err);
			}
			
			return callback(null, rows);
		});
	},

	del: function(userId, meetingId, callback)
	{
		var db = new sqlite3.Database('db.sql');
		db.run('DELETE FROM Meeting WHERE id = (?) AND User_googleId = (?)', meetingId, userId, function(err)
		{
			if (err)
			{
				console.log('Meeting.del: ' + err);
			}

			return callback(err);
		});
	},

	schedule: function(meetingId, cli, callback)
	{
		// Get the meeting		
		var db = new sqlite3.Database('db.sql');
		db.all('SELECT id, name, organizerPhone, date, time, people, User_googleId FROM Meeting WHERE id = (?) LIMIT 1', meetingId, function(err, rows)
		{
			if (err)
			{
				console.log('Meeting.schedule: ' + err);
				return callback(err);
			}
			
			if (rows.length === 0)
			{
				return callback('The meeting was cancelled by the user.');
			}

			// Schedule the meeting
			var dateArr = rows[0].date.split('-');
			var timeArr = rows[0].time.split(':');
			var date = new Date(dateArr[2], parseInt(dateArr[0], 10) - 1, dateArr[1], timeArr[1].charAt(3) === 'P' ? parseInt(timeArr[0], 10) + 12 : timeArr[0], timeArr[1].charAt(0) + timeArr[1].charAt(1));

			console.log('Meeting scheduled on: ' + date);
			try
			{
				var job = new cronJob(			

				date,

				function()
				{
					cli.account.getApplication('AP5c087037ed02747a1f048b2c9174225e', function(err, app)
					{						
						console.log('Calling Organizer: ' + rows[0].organizerPhone);
						
						app.register();
						// Call the organizer
						app.makeCall("+17752374594", rows[0].organizerPhone, function(err, call) 
						{
							if (err)
							{
								console.log('Meeting.schedule.makeCall: ' + err);
								return callback(err);
							}

							call.on('connected', function(status) 
							{
								call.say('Hello.  You scheduled the conference call ' +  rows[0].name + ' at this time and will be transfered to a conference room.  You will be put on hold until at least one other participant joins.');
								call.joinConference(rows[0].id, {}, function (call, status)
								{
									console.log(status);
								});
							});

							// Unregsiter the application when the organizer of the conference call hangs up (maybe?)
							call.on('ended', function(status, duration)
							{
								// app.unregister();
							});
						});

						// Call the participants
						if (rows[0].people !== null)
						{							
							var participants = JSON.parse(rows[0].people);
							for (i = 0; i < participants.length; i++)
							{
								if (participants[i].phone !== undefined)
								{
									console.log('Calling participant: ' + participants[i].name + ' at ' + participants[i].phone); 
									app.makeCall("+17752374594", participants[i].phone, function(err, call) 
									{
										if (err)
										{
											console.log('Meeting.schedule.makeCall: ' + err);
											return callback(err);
										}

										call.on('connected', function(status) 
										{
											call.say('Hello.  You have been schedule to a conference call.  Connecting you now, please wait.');
											call.joinConference(rows[0].id, {}, function (call, status)
											{
												console.log(status);
											});
										});
									});
								}

								else
								{
									console.log('This person who was invited did not provide a phone number.');
								}							
							}
		
							console.log('Calling participants completed.');
						}
						
						else
						{
							console.log('No other people were invited to this meeting.');
						}
										
					})				
				},

				function()
				{
					console.log('Job Completed');
				},

				true,

				'America/Los_Angeles');				
			}
		
			catch (ex)
			{
				console.log('Meeting.schedule: ' + err);
				return callback(ex);
			}

			return callback(null, job);
		});
	},
}
