var helper = {
	client:null,
	request:require('request'),
	register:function(client, done)
	{
		try
		{
			this.client = client;
			console.log('posting registration');
			console.log(client);
			
			this.request.post({url:'http://' + client.serverIP + ':' + client.serverPort + '/register', json:client}, function(e, response, responseBody){
				if (e)
				{
					done(e);
				}
				else
				{
					done(null, responseBody);
				}
			});
		}
		catch(e)
		{
			done(e);
		}

	},
	getLocalAddress:function(done)
	{
		var os=require('os');
		var ifaces=os.networkInterfaces();
		var address = null;
		var addressFound = false;
		for (var dev in ifaces) {
		  var alias=0;
		  ifaces[dev].forEach(function(details){
		    if (details.family=='IPv4' && details.address != '127.0.0.1' && !addressFound) {
		      
		      address = details.address;
		      addressFound = true;
		    }
		    ++alias;
		  });
		}
		
		done(address);
	},
	processStep:function(process, key, done)
	{
		
		console.log('processing step with key ' + key);
		console.log(process);
		
		var step = process.steps[key];
		var plugin = require('./plugins/' + step.plugin);
		var currentStep = null;
		
		console.log(step);
		
		plugin.execute(step, process, function(e, process_out){
			
			if (!e)
			{
				console.log('plugin processed OK');
				console.log(step);
				
				this.notifyHub(step, 'Step ran OK', function(e){
					
					if (e)
						console.log('Couldnt notify the hub: ' + e);
					else
					{
						if (step['steps'] != null && step.steps.length > 0)
						{
							var nextStep = process.steps[step.steps[0]];
							
							console.log('nextStep');
							console.log(nextStep);
							console.log(step.steps);
							
							if (nextStep.key == key)
							{
								//bad - we cannot run with circular references
								this.notifyHub(step, 'Step run Failed: Circular reference with step: ' + nextStep.key, function(e){
									
									if (e)
										console.log(e);
									
								});
							}
							else
								shared_helper.callStep(nextStep, process_out, done);
						}
						else
						{
							//means the process has come to an end
							this.notifyHub(process_out, 'Process complete', function(e){
								
								if (e)
									console.log(e);
								
							});
						}
					}
					
				}.bind(this));
			}
			else
			{
				console.log('plugin processed failure');
				console.log('Error executing step plugin ' + step.plugin + ':' + e);
				
				//bad - we cannot run with circular references
				this.notifyHub(step, 'Step run Failed: ' + e, function(e){
					
					if (e)
						console.log(e);
					
				});
				
			}
		}.bind(this));
		
	},
	notifyHub:function(data, message, done)
	{
		try
		{
			this.request.post({url:'http://' + this.client.serverIP + ':' + this.client.serverPort + '/step_notify', json:{data:data, message:message}}, function(e, response, responseBody){
				if (e)
				{
					done(e);
				}
				else
				{
					done(null, responseBody);
				}
			});
		}
		catch(e)
		{
			done(e);
		}
	}
}

module.exports = helper;