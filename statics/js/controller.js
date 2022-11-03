//Variable fürs ein- und ausklappen
var autoKlappe = 1;
//Variable ausklappen ende

/*
 * ##############################################################################
 * ######################### Controls GUI State machine #########################
 * ##############################################################################
 */

var lastGuiScreen = "";
var guiScreen = "landed";

function gotoScreen(screen) {
  switch(screen) {
    case "home":
      $('.homeScreen').hide();
      $("#home").show();
      return;
    case "loaderpage":
      $('.homeScreen').hide();
      $('#loaderpage').show();
      return;
    case "createLogbookPage":
      $('.homeScreen').hide();
      $('#createLogbookPage').show();
      return;
    case "loadLogbookPage":
      $('.homeScreen').hide();
      $('#loadLogbookPage').show();
      return;
    case "fehler":
      $('.homeScreen').hide();
      $('#fehlerpage').show();
      return;
  }

	$('#controls').children().hide();
	$('#safetyBriefingButton').show();
	$('#weatherReportButton').show();
	
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

$(document).ready(function()
{
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
   * ## Widget Controls ###########################################################
   * ##############################################################################
   */

  $('#showMapButton').click(function() {
    $('#map').dialog({
      width: 500,
      height: 500,
      open: function( event, ui ) {window.map.refresh()},
      resizeStop: function( event, ui ) {window.map.refresh()}
    });
    //window.map.refresh();
  })

  $('#showGraphButton').click(function() {
    $('#chart').dialog({
      width: 800,
      height: 500
    });
  })

  $('#showTableButton').click(function() {
    $('#table').dialog({
      width: 500,
      height: 500
    });
  })

  $('#showLogbookControlsButton').click(function() {
    $('#wahlpage').dialog();
  })

  $('#showSettingsButton').click(function() {
    $('#settingsPage').dialog();
  })

  $('#showHudButton').click(function() {
    $('#HUD').dialog();
  })
  
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
    senden({status: "landed"});
  });
  $('#ankerButton').click(function() {
    senden({status: "landed"});
  });
  $('#bojeButton').click(function() {
    senden({status: "landed"});
  });
  $('#safetyBriefingButton').click(function(){
    lastGuiScreen = guiScreen;
    $("#sonstigesSubject").html("Sicherheitseinweisung")
    $("#sonstigesContent").html(window.message_templates.safety_briefing);
    gotoScreen("custom");
  });
  $('#weatherReportButton').click(function(){
    senden({command: 'weather_report'});
  });
  $('#sonstigesButton').click(function(){
    lastGuiScreen = guiScreen;
    $("#sonstigesSubject").html("Notiz")
    $("#sonstigesContent").html(window.message_templates.note);
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
      $('#settingsPage').dialog('close');
      gotoScreen('createLogbookPage');
  });
  $('#loadLogbookButton').click(function() {
      $('#settingsPage').dialog('close');
      senden({'get':'logbooks'})
      gotoScreen('loadLogbookPage');
  });
  $('#exportLogbookButton').click(function() {
      window.location = '/logbook/logbook.csv';
  });
  $('#exportGpxButton').click(function() {
      window.location = '/logbook/track.gpx';
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
       gotoScreen('home');
  });
  $('.cancelButton').click(function() {
       gotoScreen('home');
  });
  $('.homeButton').click(function() {
       window.location = '#wahlpage';
  });
});
