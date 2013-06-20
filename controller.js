
exports.execute_get = function(req, res, done){
	try
	{
		var method = req.params.controller_method;
		
		if (method == "up")
		{
			console.log('my status was checked and it is up!');
			res.send({status:'up'});
		}
	}
	catch(e)
	{
		
		console.log('error happened: ' + e.toString());
	}
}

exports.execute_post = function(req, res, done){
	try
	{
		var method = req.params.controller_method;
		
		console.log('received post ' + method);
		
		if (method == "register")
		{
			//HUB METHOD
			var client = req.body;
			client.ip = req.connection.remoteAddress;
			server_helper.registerClient(client, function(e, response){
				
				if (!e)
					res.send(getResponse('success', 'Registration successful', response));
				else
					res.send(getResponse('error', e, null));
				
			});
		}
		
		if (method == "process")
		{
			//PROCESSOR METHOD
			var process = req.body;
			var stepKey = req.query['step_key'];
			
			client_helper.processStep(process, stepKey, function(e){
				if (!e)
					console.log('process step complete');
				else
					console.log('process step failed: ' + e);
			});
			
			res.send({status:'processing'});
		}
		
		if (method == "step_notify")
		{
			//HUB METHOD
			console.log('step notify happened');
			console.log(req.body);
			var notification = req.body;
			
			server_helper.emitStepMessage(notification.data, notification.message, function(e){
				
				if (e)
				{
					res.send({status:'notify failed: ' + e});
					console.log(e);
				}
				else
				{
					es.send({status:'notify OK'});
				}
			});
		}
	}
	catch(e)
	{
		
		console.log('error happened: ' + e.toString());
	}
}

function getResponse(status, message, data)
{
	return {'status':status, 'message':message, 'data':data}
}
