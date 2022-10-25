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
