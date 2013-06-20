var helper = {
		request:require('request'),
		clients:{},
		dashboardSocket:null,
		initializeSocket:function(socket){
			socket.on('start process', function (process) {
				  console.log('start process called...');
				   this.startProcess(process, function(e, processId){
					   if (!e)
					   {
						   this.emitMessage('Client start succeeded for process with id: ' + process.id + ", step name " + process.initialStep.name, "success");
					   }
					   else
					   {
						   this.emitMessage('Process start failed: ' + e, 'error');
					   }
					   
				   }.bind(this));
				  }.bind(this));
			 dashboardSocket = socket;
		},
		registerClient:function(client, done)
		{
			try
			{
				console.log('registering client');
				console.log(client);
				
				var clientKey = client.name + client.ip.replace(/\./g,'') + client.port.toString();
	
				this.clients[clientKey] = client;
				
				client.key = clientKey;
				
				console.log('emitting registration');
				dashboardSocket.emit('client register result', { status: 'OK', 'client':client});
				
				done(null);
			}
			catch(e)
			{
				console.log('error happened registering client');
				console.log(e);
				done(e);
			}
		},
		startProcess:function(process, done)
		{
			try
			{
				
				//We generate a random id for the new process
				var uuid = require('node-uuid').v4();
				process.id = uuid;
				
				shared_helper.callStep(process.initialStep, process, function(e){
					
					if (!e)
						done(null, process.id);
					else
						done(e);
					
				}.bind(this));
				
			}
			catch(e)
			{
				done(e);
			}
		},
		emitMessage: function(message, type, done)
		{
			try
			{
				dashboardSocket.emit('message', { 'message': message, 'type':type });
				
				if (done)
				done();
			}
			catch(e)
			{
				if (done)
					done(e);
				else
					console.log(e);
			}
		},
		emitStepMessage: function(data, message, done)
		{
			try
			{
				dashboardSocket.emit('step message', {'data':data, 'message': message });
				
				if (done)
				done();
			}
			catch(e)
			{
				if (done)
					done(e);
				else
					console.log(e);
			}
		}
}

module.exports = helper;