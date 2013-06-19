var processor = {
	execute:function(step, process, done)
	{
		try
		{
			
			setTimeout(function(){
				
				console.log('standard plugin is running');
				console.log(step);
				
				if (process['payload'] == null)
					process['payload'] = [];
				
				process['payload'].push({timestamp:new Date(), message:'Step with name ' + step.name + ' hands on!'});
				done(null, process);
				
			}.bind(this), 1000);
			
		}
		catch(e)
		{
			done(e, process);
		}
	}
}

module.exports = processor;