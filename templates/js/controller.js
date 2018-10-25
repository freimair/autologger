var statMess = "";
var anlegen =
{
  aInternal: 1,
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
var webSocket = new WebSocket('ws://' + window.location.host + '/ws');
webSocket.onerror = function(event)
{
  //alert(event.data);
};
anlegen.registerListener(function(val)
{
    if(anlegen.a == 1)
    {
      $('.dataAntrieb').html("Im Hafen");
      $('#antriebButton').removeClass('ui-icon-delete');
      $('#antriebButton').removeClass('ui-icon-boat');
      $('#antriebButton').removeClass('ui-icon-engine');
      $('#antriebButton').addClass('ui-icon-delete');

      $('#anlegenButton').removeClass('ui-icon-boje');
      $('#anlegenButton').removeClass('ui-icon-anker');
      $('#anlegenButton').removeClass('ui-icon-poller');
      $('#anlegenButton').addClass('ui-icon-poller');

    }
    else if(anlegen.a == 2)
    {
      $('.dataAntrieb').html("Vor Anker");
      $('#antriebButton').removeClass('ui-icon-delete');
      $('#antriebButton').removeClass('ui-icon-boat');
      $('#antriebButton').removeClass('ui-icon-engine');
      $('#antriebButton').addClass('ui-icon-delete');

      $('#anlegenButton').removeClass('ui-icon-boje');
      $('#anlegenButton').removeClass('ui-icon-anker');
      $('#anlegenButton').removeClass('ui-icon-poller');
      $('#anlegenButton').addClass('ui-icon-anker');
    }
    else if(anlegen.a == 3)
    {
      $('.dataAntrieb').html("An der Boje");
      $('#antriebButton').removeClass('ui-icon-delete');
      $('#antriebButton').removeClass('ui-icon-boat');
      $('#antriebButton').removeClass('ui-icon-engine');
      $('#antriebButton').addClass('ui-icon-delete');

      $('#anlegenButton').removeClass('ui-icon-boje');
      $('#anlegenButton').removeClass('ui-icon-anker');
      $('#anlegenButton').removeClass('ui-icon-poller');
      $('#anlegenButton').addClass('ui-icon-boje');
    }
    else if(anlegen.a == 0)
    {
      if(antrieb.a == 1)
      {
        $('.dataAntrieb').html("Unter Maschine");
        $('#antriebButton').removeClass('ui-icon-delete');
        $('#antriebButton').removeClass('ui-icon-boat');
        $('#antriebButton').removeClass('ui-icon-engine');
        $('#antriebButton').addClass('ui-icon-engine');
      }
      else if(antrieb.a == 2)
      {
        $('.dataAntrieb').html("Unter Segel");
        $('#antriebButton').removeClass('ui-icon-boat');
        $('#antriebButton').removeClass('ui-icon-delete');
        $('#antriebButton').removeClass('ui-icon-engine');
        $('#antriebButton').addClass('ui-icon-boat');
      }
      $('#anlegenButton').removeClass('ui-icon-boje');
      $('#anlegenButton').removeClass('ui-icon-anker');
      $('#anlegenButton').removeClass('ui-icon-poller');
      $('#anlegenButton').addClass('ui-icon-anker');
    }
});
antrieb.registerListener(function(val)
{
    if(anlegen.a == 0)
    {
      if(antrieb.a == 1)
      {
        $('.dataAntrieb').html("Unter Maschine");
        $('#antriebButton').removeClass('ui-icon-boat');
        $('#antriebButton').removeClass('ui-icon-engine');
        $('#antriebButton').addClass('ui-icon-engine');
      }
      else if(antrieb.a == 2)
      {
        $('.dataAntrieb').html("Unter Segel");
        $('#antriebButton').removeClass('ui-icon-boat');
        $('#antriebButton').removeClass('ui-icon-engine');
        $('#antriebButton').addClass('ui-icon-boat');
      }
      else if(antrieb.a == 0)
      {
        $('.dataAntrieb').html("Kein Antrieb");
        $('#antriebButton').removeClass('ui-icon-delete');
        $('#antriebButton').removeClass('ui-icon-boat');
        $('#antriebButton').removeClass('ui-icon-engine');
        $('#antriebButton').addClass('ui-icon-delete');

      }
    }
});
pob.registerListener(function(val)
{
  if(statMess == "")
  {
    statMess = $('.dataAntrieb').html();
    $('.dataAntrieb').html("Person über Bord");
    senden("Person über Bord");
  }
  else
  {
    $('.dataAntrieb').html(statMess);
    statMess = "";
    senden("Person wieder an Bord");
  }
});
$(document).ready(function(){
  $('.dataAntrieb').html("Im Hafen");
  drawmap();
  anlegenFunktion(2);
  antriebFunktion(0);
  if (navigator.geolocation)
  {
    navigator.geolocation.watchPosition(showPosition);
  }
  else
  {
    $('.dataPos').html('kein GPS');
  }
  $('#anlegenButton').click(function(){
    anlegenFunktion(0);

    if (anlegen.a > 0)
    {
      //senden("anlegen", 0);
      anlegen.a = -1;
      $('#antriebHeader').html('Ablegen');
    }
    anlegenFunktion(1);

  });
  $('#hafenButton').click(function(){
    anlegenFunktion(0);

    if (anlegen.a == 0)
    {
      senden('Im Hafen angelegt');
      if(antrieb.a == 1)
      {
        senden("Maschine aus");
      }
      else if(antrieb.a == 2)
      {
        senden('Segel bergen');
      }
      anlegen.a = 1;
    }
    anlegenFunktion(1);

  });
  $('#ankerButton').click(function(){
    anlegenFunktion(0);

    if (anlegen.a == 0)
    {
      senden('Anker fallen');
      if(antrieb.a == 1)
      {
        senden("Maschine aus");
      }
      else if(antrieb.a == 2)
      {
        senden('Segel bergen');
      }
      anlegen.a = 2;
    }
    anlegenFunktion(1);

  });
  $('#bojeButton').click(function(){
    anlegenFunktion(0);

    if (anlegen.a == 0)
    {
      senden('An Boje angelegt');
      if(antrieb.a == 1)
      {
        senden("Maschine aus");
      }
      else if(antrieb.a == 2)
      {
        senden('Segel bergen');
      }
      anlegen.a = 3;
    }
    anlegenFunktion(1);

  });
  $('#motorButton').click(function(){antriebFunktion(1);});
  $('#segelButton').click(function(){antriebFunktion(2);});
  $('#speichernButton').click(function(){
    //alert($('#sonstigesArea').val());
    //alert(document.getElementById('sonstigesArea').value);
    senden($('#sonstigesArea').val());
    $('#sonstigesArea').val("");
  });
  $('#sonstigesButton').click(function(){$('#sonstigesArea').val("");});
  $('#antriebButton').click(function(){$('#antriebHeader').html('Antrieb');});
  $('#antriebBack').click(function(){
    if($('#antriebHeader').html() == 'Ablegen')
    {
      anlegen.a = 1;
      anlegenFunktion(2);
    }
  });
  $('#pobButton').click(function()
  {
    if(pob.a == 0)
    {
      pob.a = 1;
    }
    else
    {
      pob.a = 0;
    }
  });

});
function anlegenFunktion(was)
{
  if(anlegen.a > 0)
  {
    if(was == 0 || was == 2)
    {
      $("#anlegenButton").attr("href", "#antriebpage");
    }
    if(was == 1 || was == 2)
    {
      $("#anlegenButton").html("Ablegen");
    }
    $('#antriebButton').hide();
    $('#pobButton').hide();
    $('#backButton0').show();
    antriebFunktion(0);
  }
  else
  {
    if(was == 0 || was == 2)
    {
      $("#anlegenButton").attr("href", "#anlegepage");
    }
    if(was == 1 || was == 2)
    {
      $("#anlegenButton").html("Anlegen");
    }
    $('#antriebButton').show();
    $('#pobButton').show();
    $('#backButton0').hide();
  }
}
function antriebFunktion(was)
{
  var zantrieb = "";
  var but1 = "";
  var but2 = "";
  if(was == 0)
  {
    antrieb.a = 0;
    zantrieb = 'kein';
    but1 = "Maschine an";
    but2 = "Segel setzen";
    $('#motorButton').removeClass('ui-icon-delete');
    $('#motorButton').removeClass('ui-icon-boat');
    $('#motorButton').removeClass('ui-icon-engine');
    $('#motorButton').addClass('ui-icon-engine');

    $('#segelButton').removeClass('ui-icon-delete');
    $('#segelButton').removeClass('ui-icon-boat');
    $('#segelButton').removeClass('ui-icon-engine');
    $('#segelButton').addClass('ui-icon-boat');


  }
  else if(was == 1)
  {
    if(antrieb.a == 0)
    {
      antrieb.a = 1;
      zantrieb = "Maschine";
      but1 = "Mschine aus";
      but2 = "Maschine aus / Segel setzen";

      $('#motorButton').removeClass('ui-icon-delete');
      $('#motorButton').removeClass('ui-icon-boat');
      $('#motorButton').removeClass('ui-icon-engine');
      $('#motorButton').addClass('ui-icon-delete');

      $('#segelButton').removeClass('ui-icon-delete');
      $('#segelButton').removeClass('ui-icon-boat');
      $('#segelButton').removeClass('ui-icon-engine');
      $('#segelButton').addClass('ui-icon-boat');

      senden("Maschine an");
      if(anlegen.a == -1)
      {
        anlegen.a = 0;
        senden('Abgelegt');
      }
    }
    else if(antrieb.a == 1 || antrieb.a == 2)
    {
      if(antrieb.a == 1)
      {
        senden("Maschine aus");
      }
      else
      {
        senden("Segel bergen");
      }
      antrieb.a = 0;
      zantrieb = "kein";
      but1 = "Maschine an";
      but2 = "Segel setzen";

      $('#motorButton').removeClass('ui-icon-delete');
      $('#motorButton').removeClass('ui-icon-boat');
      $('#motorButton').removeClass('ui-icon-engine');
      $('#motorButton').addClass('ui-icon-engine');

      $('#segelButton').removeClass('ui-icon-delete');
      $('#segelButton').removeClass('ui-icon-boat');
      $('#segelButton').removeClass('ui-icon-engine');
      $('#segelButton').addClass('ui-icon-boat');

    }
  }
  else if(was == 2)
  {
    if(antrieb.a == 0 || antrieb.a == 1)
    {
      if(antrieb.a == 0)
      {
        senden("Segel setzen");
      }
      else
      {
        senden("Segel setzen");
        senden("Maschine aus");
      }
      antrieb.a = 2;
      zantrieb = "Segel";
      but1 = "Segel bergen";
      but2 = "Segel bergen / Maschine an";

      $('#motorButton').removeClass('ui-icon-delete');
      $('#motorButton').removeClass('ui-icon-boat');
      $('#motorButton').removeClass('ui-icon-engine');
      $('#motorButton').addClass('ui-icon-delete');

      $('#segelButton').removeClass('ui-icon-delete');
      $('#segelButton').removeClass('ui-icon-boat');
      $('#segelButton').removeClass('ui-icon-engine');
      $('#segelButton').addClass('ui-icon-engine');

      if(anlegen.a == -1)
      {
        anlegen.a = 0
        senden('Abgelegt');
      }
    }
    else if(antrieb.a == 2)
    {
      antrieb.a = 1
      zantrieb = "Maschine";
      but1 = "Maschine aus";
      but2 = "Maschine aus / Segel setzen";

      $('#motorButton').removeClass('ui-icon-delete');
      $('#motorButton').removeClass('ui-icon-boat');
      $('#motorButton').removeClass('ui-icon-engine');
      $('#motorButton').addClass('ui-icon-delete');

      $('#segelButton').removeClass('ui-icon-delete');
      $('#segelButton').removeClass('ui-icon-boat');
      $('#segelButton').removeClass('ui-icon-engine');
      $('#segelButton').addClass('ui-icon-boat');

      senden("Maschine an");
      senden("Segel bergen");
    }
  }

  $('#motorButton').html(but1);
  $('#segelButton').html(but2);

}
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
function senden(was)
{
  //$.get('dummy.php', {"mess": was});
  webSocket.send(was);
}
