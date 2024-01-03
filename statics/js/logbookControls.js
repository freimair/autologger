var logbookControls;

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

	$('#logbookControls').children().hide();
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

class LogbookControls extends DisplayAble {
    constructor() {
        $(DisplayAble.parentTag).append(`
        <div id="logbookControls" style="display: none;" title="Logbook Controls">
          <button data-icon="engine" data-iconpos="top" id="reffButton" data-corners="false">Reffen</button>
          <button data-icon="boat" data-iconpos="top" id="unreefButton" data-corners="false">Ausreffen</button>
          <button data-icon="boat" data-iconpos="top" id="segelButton" data-corners="false">Segel</button>
          <button data-icon="engine" data-iconpos="top" id="motorButton" data-corners="false">Motor</button>
          <button data-icon="poller" data-iconpos="top" id="anlegenButton" data-corners="false">Anlegen</button>
          <button data-icon="boat" data-iconpos="top" id="ablegenButton" data-corners="false">Ablegen</button>
          <button data-icon="poller" data-iconpos="top" id="hafenButton" data-corners="false">Hafen</button>
          <button data-icon="anker" data-iconpos="top" data-corners="false" id="ankerButton">Anker</button>
          <button data-icon="boje" data-iconpos="top" id="bojeButton" data-corners="false">Boje</button>
          <button data-icon="pen" data-iconpos="top" id="safetyBriefingButton" data-corners="false">Safety Briefing</button>
          <button data-icon="pen" data-iconpos="top" id="weatherReportButton" data-corners="false">Weather Report</button>
          <button data-icon="pen" data-iconpos="top" id="sonstigesButton" data-corners="false">Sonstiges</button>
          <button data-icon="rettungsring" data-iconpos="top" data-theme="d" id="pobButton" data-corners="false">Person über Bord</button>
          <div id="sonstigesArea">
              <h1 id="sonstigesSubject"></h1>
              <div id="sonstigesContent"></div>
          </div>
          <button data-icon="save" data-iconpos="top" id="speichernButton" data-corners="false">Speichern</button>
          <button data-icon="back" data-iconpos="top" data-corners="false" id="backButton">Zurück</button>
        </div>
        `);

        super('#logbookControls');

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
            $('#popup').dialog('close');
        })

        gotoScreen('landed');
        
        };
}