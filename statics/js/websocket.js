var connected = 0;

///*
// * ##############################################################################
// * ################################# Connection #################################
// * ##############################################################################
// */
class Connection {
	static webSocket;

	/*
	* connect to the websocket of the logbook application
	* 
	* does reconnect on a lost connection.
	* TODO limit reconnection tries in case our server is gone for good
	*  - insert dynamic timeouts: start with immediate reconnect and increase the time until reconnection with every failed reconnect
	*  - limit number of tries. If max number of tries is reached, ask user to reload.
	*/ 
	static connect() {
		if(Connection.webSocket && Connection.webSocket.readyState === Connection.webSocket.OPEN)
			return;

		Connection.webSocket = new WebSocket((window.location.protocol == 'https:' ? 'wss' : 'ws') + '://' + window.location.host + window.location.pathname + '/ws');

		Connection.webSocket.onerror = function(event)
		{
			connected = 0;
			WindowManager.update();
			$('#fehler').html('<br><br>Die Verbindung zum Server wurde unterbrochen<br><br>');
			gotoScreen('fehler');
		};

		Connection.webSocket.onopen = function()
		{
			connected = 1;
			Controller.clear();
			Connection.send({"get": "tail"});
			Connection.send({"get": "last"});
			gotoScreen('home');
			WindowManager.update();
		}

		Connection.webSocket.onclose = function() {
			connected = 0;
			WindowManager.update();
			gotoScreen('loaderpage');
			setTimeout(Connection.connect, 2000);
		}

		Connection.webSocket.onmessage = function(event)
		{
			Controller.incoming(event.data);
		};
	};

	static send(was) {
		if(connected == 1) {
			was = JSON.stringify(was);
			Connection.webSocket.send(was);
		}
	}

	static close() {
		Connection.webSocket.close();
	}
}