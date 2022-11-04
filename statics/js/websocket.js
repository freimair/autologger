var connected = 0;

///*
// * ##############################################################################
// * ################################# Connection #################################
// * ##############################################################################
// */

var webSocket;

/*
 * connect to the websocket of the logbook application
 * 
 * does reconnect on a lost connection.
 * TODO limit reconnection tries in case our server is gone for good
 *  - insert dynamic timeouts: start with immediate reconnect and increase the time until reconnection with every failed reconnect
 *  - limit number of tries. If max number of tries is reached, ask user to reload.
 */ 
function connect() {
	window.webSocket = new WebSocket('ws://' + window.location.host + '/logbook/ws');

	webSocket.onerror = function(event)
	{
	  connected = 0;
	  $('#fehler').html('<br><br>Die Verbindung zum Server wurde unterbrochen<br><br>');
	  gotoScreen('fehler');
	};
	webSocket.onopen = function()
	{
	  connected = 1;
	  window.table.clear();
	  window.chart.clear();
	  window.map.clear();
	  senden({"get": "tail"});
	  senden({"get": "last"});
	  gotoScreen('home');
	}
	webSocket.onclose = function() {
	  gotoScreen('loaderpage');
	  setTimeout(connect, 2000);
	}
	webSocket.onmessage = function(event)
	{
		jasonAuswerten(event.data);
	};
};

//Steuerfunktionen
//Sendefunktion
function senden(was) {
  if(connected == 1) {
    was = JSON.stringify(was);
    webSocket.send(was);
  }
}