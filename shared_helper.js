var helper = {
		request:require('request'),
		callStep:function(step, process, done)
		{
			try
			{
				this.isClientUp(step.ip, step.port, function(e){
					
					if (!e)
					{
						this.request.post({url:'http://' + step.ip + ':' + step.port + '/process?step_key=' + step.key, json:process}, function(e, response, body){
							if (e)
							{
								
								done(e);

							}
							else
							{
								done(null);

							}
						}.bind(this));
					}
					
					
				}.bind(this));
				
			}
			catch(e)
			{
				done(e);
			}
		},
		isClientUp:function(ip, port, done)
		{
			try
			{
				
					console.log('checking if up...' + ip + ' ' + port);
					this.request.get({url:'http://' + ip + ':' + port + '/up'}, function(e, response, body){
						if (e)
						{
							console.log('client is not up');
							done(e);
						}
						else
						{
							console.log('client is up');
							done(null, body);
						}
					}.bind(this));

			}
			catch(e)
			{
				console.log('up check failed: ' + e);
				done(e);
			}
		}
}

module.exports = helper;