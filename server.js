var express = require('express'), 
controller = require('./controller');


var isServer = true;
var name = null;
var listenPort = 3333;
var serverPort = null;
var serverIP = null;
var clientIP = null;
var processorPlugin = null;

//these guys are global (as they will contain cached info) and will need to be available throughout the system scope
client_helper = require('./client_helper');
server_helper = require('./server_helper');
shared_helper = require('./shared_helper');

process.argv.forEach(function (val, index, array) {
	
	if (val.toLowerCase() == 'mode=server')
		isServer = true;
	
	if (val.toLowerCase() == 'mode=client')
		isServer = false;
	
	if (val.toLowerCase().substring(0, 4) == 'name')
		name = val.toLowerCase().split('=')[1];
	
	if (val.toLowerCase().substring(0, 4) == 'port')
		listenPort = val.toLowerCase().split('=')[1];
	
	if (val.toLowerCase().substring(0, 11) == 'server_port')
		serverPort = val.toLowerCase().split('=')[1];
	
	if (val.toLowerCase().substring(0, 9) == 'server_ip')
		serverIP = val.toLowerCase().split('=')[1];
	
	if (val.toLowerCase().substring(0, 9) == 'client_ip')
		clientIP = val.toLowerCase().split('=')[1];
	
	if (val.toLowerCase().substring(0, 6) == 'plugin')
		processorPlugin = val.toLowerCase().split('=')[1];
	
});

//SOME VALIDATION

if (isServer == false && serverPort == null)
{
	console.log('please include the server_port= parameter');
	process.exit(1);
}

if (isServer == false && processorPlugin == null)
{
	processorPlugin = 'standard';
}

//check if our plugin exists
if (isServer == false)
{
	try
	{
		var testPlugin = require('./plugins/' + processorPlugin);
		
	}
	catch(e)
	{
		console.log('No plugin file with the name ' + processorPlugin + ' exists');
		process.exit(1);
	}
}

if (isServer == false && serverIP == null)
{
	console.log('please include the server_ip= parameter');
	process.exit(1);
}

if (name == null)
{
	console.log('please include the name= parameter');
	process.exit(1);
}

var app = express();

//we need this to parse the body of the http request
app.use(express.bodyParser());

//do we want to use cookies
app.use(express.cookieParser());

//__dirname - global path to the directory the app is running in, so we can share our landing page
app.use(express.static(__dirname+'/public'));

// - we set up a route that catches all incoming posts and pass it to the controller
app.post('/:controller_method', controller.execute_post);
app.get('/:controller_method', controller.execute_get);

server = require('http').createServer(app);

server.listen(listenPort);
console.log('Hub node listening on port ' + listenPort);

var ip = server.address();
console.log('address: ' + ip);
console.log(ip);

if (isServer)
{
	
	var io = require('socket.io').listen(server);
	console.log('running as a server, socket.io is up');
	
	io.sockets.on('connection', function (socket) {
		  server_helper.initializeSocket(socket);
		});

}
else
{
	
	var loadClient = function(address){
		try
		{
			//we are running in client mode - lets register with the server
			console.log('System in client mode - registering with server: ' + serverIP + ' over port ' + serverPort);
			client_helper.register({name:name, port: listenPort, serverIP:serverIP, serverPort:serverPort, plugin:processorPlugin}, function(e, response){
				
				if (!e)
					console.log('registration successful');
				else
					console.log('registration failed: ' + e);
				
			});
		}
		catch(e)
		{
			console.log('Client registration failed: ' + e);
		}
		
	}
	
	if (clientIP == null)
	client_helper.getLocalAddress(function(address){
		loadClient(address);
	});
	else
		loadClient(clientIP);
	
}

console.log('System started');