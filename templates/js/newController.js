//Variable fürs Drag
var currentObj = "";
var currentObjX = 0;
var currentObjY = 0;
var startX = 0;
var startY = 0;
var nowObjX = 0;
var nowObjY = 0;
var fensterBreite = 0;
var fensterHohe = 0;
var inJason = 0;

var IE = document.all&&!window.opera;

document.onmousemove = doDrag;
document.onmouseup = stopDrag;
//Variable Drag ende

//Variable fürs ein- und ausklappen
var autoKlappe = 1;
//Variable ausklappen ende

//Variable für die Statusmeldung
var statMess = "";
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
  Eine Nachricht vom Server darf erst gesendet werden, wenn ein INIT Signal vom Client kommt - erst dann ist der Client bereit zu empfangen*/

//Positionsarray um die Veränderung der Position berechnen zu können
var posi = new Array(2);
posi[0] = 200;
posi[1] = 200;

// Cookie Einstellungen
$.cookie.json = true;

//Einzelvariable mit Event Listner, um eine automatische Verarbeitung auszulösen
var position =
{
  aInternal: 0,
  aListener: function(val){},
  set a(val)
  {
    this.aInternal = val;
    this.aListener(val);
  },
  get a()
  {
    return this.aInternal;
  },
  registerListener: function(listener)
  {
    this.aListener = listener;
  }
};
var anlegen =
{
  aInternal: 0,
  aListener: function(val){},
  set a(val)
  {
    this.aInternal = val;
    this.aListener(val);
  },
  get a()
  {
    return this.aInternal;
  },
  registerListener: function(listener)
  {
    this.aListener = listener;
  }
};
var antrieb =
{
  aInternal: 0,
  aListener: function(val){},
  set a(val)
  {
    this.aInternal = val;
    this.aListener(val);
  },
  get a()
  {
    return this.aInternal;
  },
  registerListener: function(listener)
  {
    this.aListener = listener;
  }
};
var pob =
{
  aInternal: 0,
  aListener: function(val){},
  set a(val)
  {
    this.aInternal = val;
    this.aListener(val);
  },
  get a()
  {
    return this.aInternal;
  },
  registerListener: function(listener)
  {
    this.aListener = listener;
  }
};
var logID =
{
  aInternal: 0,
  aListener: function(val){},
  set a(val)
  {
    this.aInternal = val;
    this.aListener(val);
  },
  get a()
  {
    return this.aInternal;
  },
  registerListener: function(listener)
  {
    this.aListener = listener;
  }
};
//Registrierung der einzelnen listener
var webSocket = new WebSocket('ws://' + window.location.host + '/logbook/ws');
webSocket.onerror = function(event)
{
  jason.verbindung = 0;
  $('#fehler').html('<br><br>Die Verbindung zum Server wurde unterbrochen<br><br>');
  window.location = "#fehlerpage";
};
webSocket.onopen = function()
{
  jason.verbindung = 1;
  senden('INIT');
}
webSocket.onmessage = function(event)
{
    jasonAuswerten(event.data);
};
anlegen.registerListener(function(val)
{
  var an = jason.status.anlegen;
  $('#anlegenButton').removeClass('ui-icon-boje');
  $('#anlegenButton').removeClass('ui-icon-anker');
  $('#anlegenButton').removeClass('ui-icon-poller');

  $('#antriebButton').removeClass('ui-icon-delete');
  $('#antriebButton').removeClass('ui-icon-boat');
  $('#antriebButton').removeClass('ui-icon-engine');

  $('#motorButton').removeClass('ui-icon-delete');
  $('#motorButton').removeClass('ui-icon-boat');
  $('#motorButton').removeClass('ui-icon-engine');

  $('#segelButton').removeClass('ui-icon-delete');
  $('#segelButton').removeClass('ui-icon-boat');
  $('#segelButton').removeClass('ui-icon-engine');

  $('#antriebButton').hide();
  $('#pobButton').hide();
  $('#backButton0').hide();
  if(an == 0)
  {
    if(jason.status.antrieb == 1)
    {
      $('.dataAntrieb').html('unter Maschine');
      $('#motorButton').html('Maschine aus');
      $('#segelButton').html('Maschine aus / Segel setzen');
      $('#anlegenButton').html('Anlegen');

      $('#antriebButton').addClass('ui-icon-engine');
      $('#anlegenButton').addClass('ui-icon-anker');
      $('#motorButton').addClass('ui-icon-delete');
      $('#segelButton').addClass('ui-icon-boat');

      $('#antriebButton').show();
      $('#pobButton').show();
    }
    else if(jason.status.antrieb == 2)
    {
      $('.dataAntrieb').html('unter Segel');
      $('#motorButton').html('Segel bergen');
      $('#segelButton').html('Segel bergen / Maschine an');
      $('#anlegenButton').html('Anlegen');

      $('#antriebButton').addClass('ui-icon-boat');
      $('#anlegenButton').addClass('ui-icon-anker');
      $('#motorButton').addClass('ui-icon-delete');
      $('#segelButton').addClass('ui-icon-engine');

      $('#antriebButton').show();
      $('#pobButton').show();
    }
    else
    {
      $('.dataAntrieb').html('kein Antrieb');
      $('#motorButton').html('Maschine an');
      $('#segelButton').html('Segel setzen');
      $('#anlegenButton').html('Anlegen');

      $('#antriebButton').addClass('ui-icon-delete');
      $('#anlegenButton').addClass('ui-icon-anker');
      $('#motorButton').addClass('ui-icon-engine');
      $('#segelButton').addClass('ui-icon-boat');

      $('#antriebButton').show();
      $('#pobButton').show();
    }
  }
  else if(an == 1)
  {
    $('.dataAntrieb').html('im Hafen');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');
    $('#anlegenButton').html('Ablegen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#anlegenButton').addClass('ui-icon-poller');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');

    $('#backButton0').show();
  }
  else if(an == 2)
  {
    $('.dataAntrieb').html('vor Anker');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');
    $('#anlegenButton').html('Ablegen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#anlegenButton').addClass('ui-icon-anker');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');

    $('#backButton0').show();
  }
  else if(an == 3)
  {
    $('.dataAntrieb').html('an der Boje');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');
    $('#anlegenButton').html('Ablegen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#anlegenButton').addClass('ui-icon-boje');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');

    $('#backButton0').show();
  }
  else
  {
    $('.dataAntrieb').html('unbekannt');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');
    $('#anlegenButton').html('Ablegen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#anlegenButton').addClass('ui-icon-delete');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');

    $('#backButton0').show();
  }
  window.location = "#wahlpage";
});
antrieb.registerListener(function(val)
{
  var an = jason.status.antrieb;
  $('#antriebButton').removeClass('ui-icon-delete');
  $('#antriebButton').removeClass('ui-icon-boat');
  $('#antriebButton').removeClass('ui-icon-engine');

  $('#motorButton').removeClass('ui-icon-delete');
  $('#motorButton').removeClass('ui-icon-boat');
  $('#motorButton').removeClass('ui-icon-engine');

  $('#segelButton').removeClass('ui-icon-delete');
  $('#segelButton').removeClass('ui-icon-boat');
  $('#segelButton').removeClass('ui-icon-engine');

  if(an == 0)
  {
    $('.dataAntrieb').html('kein Antrieb');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');
  }
  else if(an == 1)
  {
    $('.dataAntrieb').html('unter Maschine');
    $('#motorButton').html('Maschine aus');
    $('#segelButton').html('Maschine aus / Segel setzen');

    $('#antriebButton').addClass('ui-icon-engine');
    $('#motorButton').addClass('ui-icon-delete');
    $('#segelButton').addClass('ui-icon-boat');
  }
  else if(an == 2)
  {
    $('.dataAntrieb').html('unter Segel');
    $('#motorButton').html('Segel bergen');
    $('#segelButton').html('Segel bergen / Maschine an');

    $('#antriebButton').addClass('ui-icon-boat');
    $('#motorButton').addClass('ui-icon-delete');
    $('#segelButton').addClass('ui-icon-engine');
  }
  else
  {
    $('.dataAntrieb').html('unbekannt');
    $('#motorButton').html('Maschine an');
    $('#segelButton').html('Segel setzen');

    $('#antriebButton').addClass('ui-icon-delete');
    $('#motorButton').addClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');
  }
  window.location = "#wahlpage";
});
pob.registerListener(function(val)
{
  if(jason.status.pob == 1)
  {
    $('.dataAntrieb').html('Person über Bord');
  }
  else
  {
    if(jason.status.antrieb == 1)
    {
      $('.dataAntrieb').html('unter Maschine');
    }
    else
    {
      $('.dataAntrieb').html('unter Segel');
    }
  }
});
position.registerListener(function(val)
{

});
logID.registerListener(function(val)
{

});
function toggle(was)
{
  if(was == 0)
  {
    return 1;
  }
  else
  {
    return 0;
  }
}

//Steuerfunktionen
//Sendefunktion
function senden(was)
{
  if(jason.verbindung == 1)
  {
    webSocket.send(was);
  }
}
//Empfangenes JSON auswerten
function jasonAuswerten(was)
{
  var json = JSON.parse(was);
  if(json.inhalt == 0)
  {

  }
  else if(json.inhalt == 1)
  {

  }
  else if(json.inhalt == 2)
  {

  }
  else if(json.inhalt == 3)
  {
    if($.cookie('user'))
    {
      senden($.cookie('user'));
    }
    else
    {
      window.location="#userpage";
    }
  }
}
//Dragfunktionen
function startDrag(obj)
{
   currentObj = obj;
   var x = $(obj).offset();
   startX = currentObjX - x.left;
   startY = currentObjY - x.top;
}
function doDrag(ereignis)
{

  currentObjX = (IE) ? window.event.clientX : ereignis.pageX;
  currentObjY = (IE) ? window.event.clientY : ereignis.pageY;

  if (currentObj != "")
  {
    //currentObj.style.left = (currentObjX - startX) + "px";
    //currentObj.style.top = (currentObjY - startY) + "px";
    $(currentObj).css('left', (currentObjX - startX) + "px");
    $(currentObj).css('top', (currentObjY - startY) + "px");
    nowObjX = currentObjX - startX;
    nowObjY = currentObjY - startY;
  }
}
function stopDrag(ereignis)
{
  currentObj = "";
}
//Positionsfunktion
function showPosition(position)
{
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var cog = Math.round(position.coords.heading);
  var sog = (Math.round((position.coords.speed / 0.514) * 10)) / 10;
  var lath = "N";
  var lonh = "E";

  if(lat < 0)
  {
    lath = "S";
    lat = lat * -1;
  }
  if(lon < 0)
  {
    lonh = "W";
    lon = lon * -1;
  }
  var latb = Math.floor(lat);
  var latm = (Math.round((lat - latb) * 600)) / 10;
  var lonb = Math.floor(lon);
  var lonm = (Math.round((lon - lonb) * 600)) / 10;

  $('.dataPos').html(latb + "°" + latm + "'" + lath + "<br>" + lonb + "°" + lonm + "'" + lonh);
  $('.dataCog').html(cog + "°");
  $('.dataSog').html(sog + " kts");
  jumpTo(lon, lat, 10);
  addMarker(layer_markers, lon, lat, " ");
}


$(document).ready(function()
{
  drawmap();

  if (navigator.geolocation)
  {
    navigator.geolocation.watchPosition(showPosition);
  }
  else
  {
    $('.dataPos').html('kein GPS');
  }
  //anlegen.a = 1;

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
  $('#anlegenButton').click(function()
  {
    if(jason.status.anlegen == 0)
    {
      window.location = "#anlegepage";
    }
    else
    {
      window.location = "#antriebpage";
    }
  });
  $('#motorButton').click(function()
  {
    if(jason.status.antrieb == 0)
    {
      jason.status.antrieb = 1;
      senden('Maschine an');
    }
    else if(jason.status.antrieb == 1)
    {
      jason.status.antrieb = 0;
      senden('Maschine aus');
    }
    else if(jason.status.antrieb == 2)
    {
      jason.status.antrieb = 0;
      senden('Segel bergen');
    }
    else
    {
      jason.status.antrieb = 3;
    }
    if(jason.status.anlegen == 0)
    {
      antrieb.a = toggle(antrieb.a);
    }
    else
    {
      if(jason.status.anlegen == 1)
      {
        senden('vom Hafen abgelegt');
      }
      else if(jason.status.anlegen == 2)
      {
        senden('Anker geborgen');
      }
      else if(jason.status.anlegen == 3)
      {
        senden('von der Boje abgelegt');
      }
      jason.status.anlegen = 0;
      anlegen.a = toggle(anlegen.a);
    }
  });
  $('#segelButton').click(function()
  {
    if(jason.status.antrieb == 0)
    {
      jason.status.antrieb = 2;
      senden('Segel setzen');
    }
    else if(jason.status.antrieb == 1)
    {
      jason.status.antrieb = 2;
      senden('Maschine aus');
      senden('Segel setzen');
    }
    else if(jason.status.antrieb == 2)
    {
      jason.status.antrieb = 1;
      senden('Segel bergen');
      senden('Maschine an');
    }
    else
    {
      jason.status.antrieb = 3;
    }
    if(jason.status.anlegen == 0)
    {
      antrieb.a = toggle(antrieb.a);
    }
    else
    {
      if(jason.status.anlegen == 1)
      {
        senden('vom Hafen abgelegt');
      }
      else if(jason.status.anlegen == 2)
      {
        senden('Anker geborgen');
      }
      else if(jason.status.anlegen == 3)
      {
        senden('von der Boje abgelegt');
      }
      jason.status.anlegen = 0;
      anlegen.a = toggle(anlegen.a);
    }
  });
  $('#hafenButton').click(function()
  {
    senden('im Hafen angelegt');
    jason.status.anlegen = 1;
    jason.status.antrieb = 0;

    if(jason.status.antrieb == 1)
    {
      senden('Maschine aus');
    }
    else
    {
      senden('Segel bergen');
    }
    anlegen.a = toggle(anlegen.a);
  });
  $('#ankerButton').click(function()
  {
    senden('vor Anker gegangen');
    jason.status.anlegen = 2;
    jason.status.antrieb = 0;

    if(jason.status.antrieb == 1)
    {
      senden('Maschine aus');
    }
    else
    {
      senden('Segel bergen');
    }
    anlegen.a = toggle(anlegen.a);
  });
  $('#bojeButton').click(function()
  {
    senden('an der Boje angelegt');
    jason.status.anlegen = 3;
    jason.status.antrieb = 0;

    if(jason.status.antrieb == 1)
    {
      senden('Maschine aus');
    }
    else
    {
      senden('Segel bergen');
    }
    anlegen.a = toggle(anlegen.a);
  });
  $('#antriebButton').click(function(){window.location = "#antriebpage";});
  $('#sonstigesButton').click(function(){window.location = "#sonstigespage";});
  $('#anlegeBack').click(function(){window.location = "#wahlpage";});
  $('#speichernButton').click(function()
  {
    senden($('#sonstigesArea').val());
    window.location = "#wahlpage";
  });
  $('#speicherUser').click(function(){window.location = "#wahlpage"});
  $('#sonstigesBack').click(function(){window.location = "#wahlpage";});
  $('#antriebBack').click(function(){window.location = "#wahlpage";});
  $('#pobButton').click(function()
  {
    if(jason.status.pob == 0)
    {
      senden('Person über Bord');
      jason.status.pob = 1;
    }
    else
    {
      jason.status.pob = 0;
      senden('Person wieder an Bord, Notfall beendet');
    }
    pob.a = toggle(pob.a);
  });
  $('#fehlerBack').click(function()
  {
    //Nur zum Testen
      jasonAuswerten('{"inhalt": 3, "user": {"id": 0}}');
    //Test ende



    //window.location = '#startpage';
  });






});
