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
//Empfangenes JSON auswerten
function jasonAuswerten(was) {
  var json = JSON.parse(was);

  /*
   * if we get a status update, we display the appropriate screen
   * 
   * note that currently, this client itself does not change the screen by itself. It waits for a status update from the server. lets see how this works out.
   * TODO maybe include a response timeout in case the server does not answer a status update report? so the user gets informed that something is wrong?
   */ 
  if(json.status != undefined) {
    gotoScreen(json.status);
  }

  /*
   * if we subscribe to the "logline" feed, we receive a list of the past X loglines.
   * TODO that is sleazy. mostly for demonstration purpose. think again!
   */
  if(json.logbooks != undefined) {
    $('#logbookList').empty();
    json.logbooks.forEach(function(item) {
      $('#logbookList').append('<li data-icon="carat-r"><a onclick="senden({\'load\':' + item.id + '})">' + item.title + "</a></li>");
    });
  }

  /*
   * initially, we ask the server for the last status. It might happen that we are the first one to connect to a fresh setup and thus,
   * there is no logbook at the server. We get an error and react by redirecting to the createLogbook page.
   * 
   * TODO since this situation is VERY rare, we eventually should think about another strategy to handle these corner cases. As it is now, we have to
   * re-show the .homeButton every time we display the "createLogbook" GUI. Alas, creating logbooks is quite rare as well...
   */
  if(json.error != undefined) {
    if(json.error == "noLogbook") {
      $('.homeButton').hide();
      window.location = '#createLogbookPage';
    }
  }

  /*
   * if we receive a logline because we are subscribed to the logline feed, we append the line to the table.
   */
  if(json.logline != undefined) {
    window.table.add(json.logline);
    window.chart.add(json.logline);
    window.map.add(json.logline);
    window.hud.add(json.logline);
  }
}

$(document).ready(function()
{
  // connect to server
  connect();
});