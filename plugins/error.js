var processor = {
	execute:function(step, process, done)
	{
		try
		{
			
			throw 'This is a test exception';
			
		}
		catch(e)
		{
			done(e, process);
		}
	}
}

module.exports = processor;