var anlegen = 1;
var antrieb = 0;
$(document).ready(function(){

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

    if (anlegen > 0)
    {
      //senden("anlegen", 0);
      anlegen = 0;
      $('#antriebHeader').html('Ablegen');
    }
    anlegenFunktion(1);

  });
  $('#hafenButton').click(function(){
    anlegenFunktion(0);

    if (anlegen == 0)
    {
      senden('anlegen', 1);
      senden('antrieb', 0);
      anlegen = 1;
    }
    anlegenFunktion(1);

  });
  $('#ankerButton').click(function(){
    anlegenFunktion(0);

    if (anlegen == 0)
    {
      senden('anlegen', 2);
      senden('antrieb', 0);
      anlegen = 2;
    }
    anlegenFunktion(1);

  });
  $('#bojeButton').click(function(){
    anlegenFunktion(0);

    if (anlegen == 0)
    {
      senden('anlegen', 3);
      senden('antrieb', 0);
      anlegen = 3;
    }
    anlegenFunktion(1);

  });
  $('#motorButton').click(function(){antriebFunktion(1);});
  $('#segelButton').click(function(){antriebFunktion(2);});
  $('#speichernButton').click(function(){
    //alert($('#sonstigesArea').val());
    //alert(document.getElementById('sonstigesArea').value);
    senden("sonst", $('#sonstigesArea').val());
    $('#sonstigesArea').val("");
  });
  $('#sonstigesButton').click(function(){$('#sonstigesArea').val("");});
  $('#antriebButton').click(function(){$('#antriebHeader').html('Antrieb');});
  $('#antriebBack').click(function(){
    if($('#antriebHeader').html() == 'Ablegen')
    {
      anlegen = 1;
      anlegenFunktion(2);
    }
  });


});
function anlegenFunktion(was)
{
  if(anlegen > 0)
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
  }
}
function antriebFunktion(was)
{
  var zantrieb = "";
  var but1 = "";
  var but2 = "";
  if(was == 0)
  {
    antrieb = 0;
    zantrieb = 'kein';
    but1 = "Maschine an";
    but2 = "Segel setzen";
  }
  else if(was == 1)
  {
    if(antrieb == 0)
    {
      antrieb = 1;
      zantrieb = "Maschine";
      but1 = "Mschine aus";
      but2 = "Maschine aus / Segel setzen";
      senden("antrieb", antrieb);
      if(anlegen == 0)
      {
        senden('anlegen', 0);
      }
    }
    else if(antrieb == 1 || antrieb == 2)
    {
      antrieb = 0;
      zantrieb = "kein";
      but1 = "Maschine an";
      but2 = "Segel setzen";
      senden("antrieb", antrieb);
    }
  }
  else if(was == 2)
  {
    if(antrieb == 0 || antrieb == 1)
    {
      antrieb = 2;
      zantrieb = "Segel";
      but1 = "Segel bergen";
      but2 = "Segel bergen / Maschine an";
      senden("antrieb", antrieb);
      if(anlegen == 0)
      {
        senden('anlegen', 0);
      }
    }
    else if(antrieb == 2)
    {
      antrieb = 1
      zantrieb = "Maschine";
      but1 = "Maschine aus";
      but2 = "Maschine aus / Segel setzen";
      senden("antrieb", antrieb);
    }
  }
  $('.dataAntrieb').html(zantrieb);
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

}
function senden(was, wert)
{
  $.get('dummy.php', {was: wert});
}
