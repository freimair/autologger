//var IE = document.all&&!window.opera;


//Variable fürs ein- und ausklappen
var autoKlappe = 1;
//Variable ausklappen ende

//Variable für die Statusmeldung
//var statMess = "";
//Variable Statusmeldung ende

//Variable für das JSON und ob eine Verbindung zum Autologger Server besteht
var jason = {inhalt: 0, "position": [47.066666667, 15.45, 0, 0], "status": {"anlegen": 1, "antrieb": 0, "pob": 0}, "user": {"id": 0, "status": 0, "log": 0}, "verbindung": 0};
/*Daten, die vom Server kommen müssen

Inhalt: welche Daten wurden gesendet als int, Format: 0 = positionArray, 1 = statusObjekt, 2 = userObjekt, 3 = ein spezielles JSON, das auf den String INIT das userObjekt schickt, bei dem die Variable 'id' die Anzahl der am Server gespeicherten User beinhaltet
Position und SOG/COG (als Dezimalgrad, Süd und West negativ), Format: "position": [DecDeg, DecDeg, Knoten, deg}
Status (als Int), Format: "status": {"anlegen": int, "antrieb": int, "pob": int}
  anlegen: 0 = nicht angelegt, 1 = im Hafen angelegt, 2 = vor Anker, 3 = an der boje
  antrieb: 0 = kein Antrieb, 1 = Maschinenantrieb, 2 = Segelantrieb
  pob: 0 = POB inaktiv, 1 = POB aktiv
User (als Int), Format: "user": {"id": int, "status": int, "log": int}
  id: wird vom Server vergeben, wenn der User registriert ist. 0 = nicht registriert, int > 0: Registrierungsnummer
  status: Welchen Status an Bord hat der User. 0 = kein Status/keine Berechtigung für Logbuch, 1 = Skipper, 2 = Crew
  log: Wenn ein Logbuch aktiv ist, wird die ID hier angezeigt.
Verbindung zum Server (wenn keine Verbindung besteht hat User keine Auswirkung), Format: verbindung: int
//  Eine Nachricht vom Server darf erst gesendet werden, wenn ein INIT Signal vom Client kommt - erst dann ist der Client bereit zu empfangen*/
//
////Positionsarray um die Veränderung der Position berechnen zu können
////var posi = new Array(2);
//posi[0] = 200;
//posi[1] = 200;
//
///*
// * #############################################################################
// * #################################### Map ####################################
// * #############################################################################
// */
////Variable fürs Drag
//var currentObj = "";
//var currentObjX = 0;
//var currentObjY = 0;
//var startX = 0;
//var startY = 0;
//var nowObjX = 0;
//var nowObjY = 0;
//var fensterBreite = 0;
//var fensterHohe = 0;
//var inJason = 0;
//
//document.onmousemove = doDrag;
//document.onmouseup = stopDrag;
////Variable Drag ende
//
////Dragfunktionen
//// TODO make available only when in desktop mode!
//function startDrag(obj)
//{
//   currentObj = obj;
//   var x = $(obj).offset();
//   startX = currentObjX - x.left;
//   startY = currentObjY - x.top;
//}
//function doDrag(ereignis)
//{
//
//  currentObjX = (IE) ? window.event.clientX : ereignis.pageX;
//  currentObjY = (IE) ? window.event.clientY : ereignis.pageY;
//
//  if (currentObj != "")
//  {
//    //currentObj.style.left = (currentObjX - startX) + "px";
//    //currentObj.style.top = (currentObjY - startY) + "px";
//    $(currentObj).css('left', (currentObjX - startX) + "px");
//    $(currentObj).css('top', (currentObjY - startY) + "px");
//    nowObjX = currentObjX - startX;
//    nowObjY = currentObjY - startY;
//  }
//}
//function stopDrag(ereignis)
//{
//  currentObj = "";
//}
////Positionsfunktion
//function showPosition(position)
//{
//  var lat = position.coords.latitude;
//  var lon = position.coords.longitude;
//  var cog = Math.round(position.coords.heading);
//  var sog = (Math.round((position.coords.speed / 0.514) * 10)) / 10;
//  var lath = "N";
//  var lonh = "E";
//
//  if(lat < 0)
//  {
//    lath = "S";
//    lat = lat * -1;
//  }
//  if(lon < 0)
//  {
//    lonh = "W";
//    lon = lon * -1;
//  }
//  var latb = Math.floor(lat);
//  var latm = (Math.round((lat - latb) * 600)) / 10;
//  var lonb = Math.floor(lon);
//  var lonm = (Math.round((lon - lonb) * 600)) / 10;
//
//  $('.dataPos').html(latb + "°" + latm + "'" + lath + "<br>" + lonb + "°" + lonm + "'" + lonh);
//  $('.dataCog').html(cog + "°");
//  $('.dataSog').html(sog + " kts");
//  jumpTo(lon, lat, 10);
//  addMarker(layer_markers, lon, lat, " ");
//}
//
//
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
	  jason.verbindung = 0;
	  $('#fehler').html('<br><br>Die Verbindung zum Server wurde unterbrochen<br><br>');
	  window.location = "#fehlerpage";
	};
	webSocket.onopen = function()
	{
	  jason.verbindung = 1;
	  senden({"get": "tail"});
	  window.location = "#wahlpage";
	}
	webSocket.onclose = function() {
	  window.location = "#loaderpage";
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
  if(jason.verbindung == 1) {
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
      $('#logbookList').append('<li data-icon="carat-r"><a name="' + item.id + '">' + item.title + "</a></li>");
    });
    $('#logbookList').listview().listview("refresh");
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
    if(json.logline.message) {
      tmp = json.logline.message;
      json.logline.message = tmp.subject + ' <button onclick="$(\'#popup-title\').text(\'' + tmp.subject + '\'); $(\'#popup-content\').html(decodeURI(\'' + encodeURI(tmp.content) + '\')); $(\'#popup\').show()" >Show</button>';
    }
    window.table.row.add(json.logline).draw();
    if(json.logline.SoG) {
      window.chart_SoG.data.labels.push(json.logline.DateTime);
      window.chart_SoG.data.datasets[0].data.push(json.logline.SoG);
      window.chart_SoG.update();
    }
    if(json.logline.AirTemperature && json.logline.AirPressure) {
      window.chart_weather.data.labels.push(json.logline.DateTime);
      window.chart_weather.data.datasets[0].data.push(json.logline.AirTemperature);
      window.chart_weather.data.datasets[1].data.push(json.logline.AirPressure);
      window.chart_weather.update();
    }
    if(json.logline.Windspeed && json.logline.WindAngle) {
      window.chart_wind.data.labels.push(json.logline.DateTime);
      window.chart_wind.data.datasets[0].data.push(json.logline.Windspeed);
      window.chart_wind.data.datasets[1].data.push(json.logline.WindAngle);
      window.chart_wind.update();
    }
    if(json.logline.Latitude & json.logline.Longitude) {
      var newPosition = L.latLng([json.logline.Latitude, json.logline.Longitude]);
      if(boatMarker) {
        if(window.track) {
          window.track.getLatLngs().push(newPosition);
        } else {
          var latlngs = [
            boatMarker.getLatLng(),
            newPosition
          ];

          // TODO do not draw a line every time but wait for a min distance
          // TODO memorize and delete these polylines sometime
          window.track = L.polyline(latlngs, {color: 'red'}).addTo(window.map);
        }
        boatMarker.setLatLng(newPosition);
      } else
        boatMarker = L.marker([json.logline.Latitude, json.logline.Longitude]).addTo(window.map);
      window.map.panTo(newPosition);

    }
  }
}

/*
 * ##############################################################################
 * ######################### Controls GUI State machine #########################
 * ##############################################################################
 */

var lastGuiScreen = "";
var guiScreen = "landed";

function gotoScreen(screen) {

	$('#controls').children().hide();
	
	switch(screen) {
	case "landing":
		$('#hafenButton').show();
		$('#ankerButton').show();
		$('#bojeButton').show();
		$('#backButton').show();
		break;
	case "landed":
		$('#ablegenButton').show();
		$('#sonstigesButton').show();
		break;
	case "leaving":
		$('#segelButton').show();
		$('#reffButton').show();
		$('#motorButton').show();
		$('#backButton').show();
		break;
	case "sailing":
		$('#reffButton').show();
		$('#motorButton').show();
		$('#anlegenButton').show();
		$('#sonstigesButton').show();
		$('#pobButton').show();
		break;
	case "reef":
		$('#unreefButton').show();
		$('#motorButton').show();
		$('#anlegenButton').show();
		$('#sonstigesButton').show();
		$('#pobButton').show();
		break;
	case "motoring":
		$('#segelButton').show();
		$('#reffButton').show();
		$('#anlegenButton').show();
		$('#sonstigesButton').show();
		$('#pobButton').show();
		break;
	case "custom":
		$('#sonstigesArea').show();
		$('#speichernButton').show();
		$('#backButton').show();
		break;
	}
	
	guiScreen = screen;
}

let safetyBriefing = `<h3>Befehlskette</h3>
<input type="checkbox" checked> im Zweifel alles melden

<h3>Bewegung an Bord</h3>
<br /><input type="checkbox"> Außerhalb von Cockpit nur auf Anweisung
<br /><input type="checkbox"> Schuhe
<br /><input type="checkbox"> nicht laufen, nicht springen
<br /><input type="checkbox"> Ordnung halten
<br /><input type="checkbox"> alles Schwimmer?

<h3>Gefahren durch</h3>
<br /><input type="checkbox"> Großbaum
<br /><input type="checkbox"> Winschen
<br /><input type="checkbox"> Klampen/Klemmen
<br /><input type="checkbox"> Leinen
<br /><input type="checkbox"> Kollisionsvermeidung
<br /><input type="checkbox"> Niedergang
<br /><input type="checkbox"> Stolperfallen
<br /><input type="checkbox"> Nächtliches Strullern
<br /><input type="checkbox"> SmartPhone

<h3>Maßnahmen</h3>
<br /><input type="checkbox"> Rettungswesten und Lifebelt
<br /><input type="checkbox"> Man over board: MOB-Taste drücken, Alarm, hinzeigen
<br /><input type="checkbox"> Feuerlöscher/-decke
<br /><input type="checkbox"> Distress-Taste
<br /><input type="checkbox"> Verbandskasten
<br /><input type="checkbox"> Grab-Bag
<br /><input type="checkbox"> Motor Bedienung
`

let note = `<textarea></textarea>`

var map;
var boatMarker;
var track;

$(document).ready(function()
{
window.map = L.map('map').setView([44, 15.5], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>'
}).addTo(map);

  // connect to server
  connect();

  //drawmap();
//
//  if (navigator.geolocation)
//  {
//    navigator.geolocation.watchPosition(showPosition);
//  }
//  else
//  {
//    $('.dataPos').html('kein GPS');
//  }
//
  $('.einklappen').click(function()
  {

    if(autoKlappe == 0)
    {
      $('.klappe1u').hide();
      $('.klappe1d').show();
      $('#eingabefeld').animate({height: '480px'});
      autoKlappe = 1;
    }
    else
    {
      $('.klappe1u').show();
      $('.klappe1d').hide();
      $('#eingabefeld').animate({height: '50px'});
      autoKlappe = 0;
    }
  });
  
  /*
   * ##############################################################################
   * ## Logbook Status Controls ###################################################
   * ##############################################################################
   */
  $('#anlegenButton').click(function() {
    lastGuiScreen = guiScreen;
    gotoScreen("landing");
  });
  $('#ablegenButton').click(function() {
    lastGuiScreen = guiScreen;
    gotoScreen("leaving");
  });
  $('#backButton').click(function() {
    gotoScreen(lastGuiScreen);
  });
  
  $('#motorButton').click(function() {
    senden({status: "motoring"});
  });
  $('#segelButton, #unreefButton').click(function() {
    senden({status: "sailing"});
  });
  $('#reffButton').click(function() {
    senden({status: "reef"});
  });
  $('#hafenButton').click(function() {
    senden({status: "landed-harbor"});
  });
  $('#ankerButton').click(function() {
    senden({status: "landed-anchor"});
  });
  $('#bojeButton').click(function() {
    senden({status: "landed-buoy"});
  });
  $('#safetyBriefingButton').click(function(){
    lastGuiScreen = guiScreen;
    $("#sonstigesSubject").html("Sicherheitseinweisung")
    $("#sonstigesContent").html(safetyBriefing);
    gotoScreen("custom");
  });
  $('#sonstigesButton').click(function(){
    lastGuiScreen = guiScreen;
    $("#sonstigesSubject").html("Notiz")
    $("#sonstigesContent").html(note);
    gotoScreen("custom");
  });
  $('#speichernButton').click(function()
  {
    // persist checkboxes
    $('#sonstigesContent input:checkbox').each(function(index, value) {
      if(value.checked)
        value.setAttribute("checked", "checked");
      else
        value.removeAttribute("checked");
    });

    // persist textarea
    $('#sonstigesContent textarea').each(function(index, value) {
      value.innerText = $(value).val();
    });

    senden({message: {subject: $('#sonstigesSubject').html(), content: $('#sonstigesContent').html()}});
    gotoScreen(lastGuiScreen);
  });
  //$('#speicherUser').click(function(){window.location = "#wahlpage"});
  $('#pobButton').click(function() {
      senden({message: "MOB"});
  });
  $('#fehlerBack').click(function()
  {
    //window.location = '#startpage';
  });
  $('#popup-close').click(function()
  {
    $('#popup').hide();
  })

  /*
   * ##############################################################################
   * ## 'more' menu controls ######################################################
   * ##############################################################################
   */
  $('#createLogbookButton').click(function() {
      window.location = '#createLogbookPage';
  });
  $('#loadLogbookButton').click(function() {
      senden({'get':'logbooks'})
      window.location = '#loadLogbookPage';
  });
  $('#exportLogbookButton').click(function() {
      window.location = '/logbook/logbook.csv';
  });
  $('#exportGpxButton').click(function() {
      window.location = '/logbook/track.gpx';
  });
  $('#settingsButton').click(function() {
      window.location = '#settingsPage';
  });
  $('#quitButton').click(function() {
      window.location = window.location.origin;
  });

  /*
   * ##############################################################################
   * ## create/edit/load logbook controls #########################################
   * ##############################################################################
   */
  $('#saveLogbookButton').click(function() {
       senden({'save':{'id':0, 'title':$('#logbookTitle').val(), 'description':$('#logbookDescription').val()}})
       window.location = '#wahlpage';
       $('.homeButton').show(); // in case we had no logbook available before
  });
  $('.homeButton').click(function() {
       window.location = '#wahlpage';
  });

//   // IE helper
//  function getEventTarget(e) {
//      e = e || window.event;
//      return e.target || e.srcElement; 
//  }

  $('#logbookList').click(function(event) {
      var target = getEventTarget(event);
      senden({"load":target.name});
      window.location = '#wahlpage';
  });
});
