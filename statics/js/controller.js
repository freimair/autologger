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
    if(window.table != undefined)
      window.table.add(json.logline);
    if(window.chart != undefined)
      window.chart.add(json.logline);
    if(window.map != undefined)
      window.map.add(json.logline);
    if(window.hud != undefined)
      window.hud.add(json.logline);
  }
}

class DisplayAble {
  htmlTag;

  constructor(htmlTag) {
    this.htmlTag = htmlTag;

    DisplayAble.createDialog(htmlTag);
  }

  static createDialog(htmlTag) {

    // load from cookie
    //cookie = decodeURIComponent(document.cookie);

    let cookie = {
          HUD: {
            position: [5, 50],
            width: 750,
            height: 150,
            show: true
          },
          map: {
            position: [765, 50],
            width: 800,
            height: 380,
            show: true
          },
          chart: {
            position: [765, 430],
            width: 800,
            height: 525,
            show: true
          },
          wahlpage: {
            position: [500, 500],
            width: 500,
            height: 500,
            show: true
          },
          settingsPage: {
            position: [600, 600],
            width: 500,
            height: 500,
            show: false
          },
          table: {
            position: [5, 200],
            width: 750,
            height: 755,
            show: true
          }};
    let layoutTag = "windows=";
    let htmlTagWOClassifier = htmlTag.replace('#', '');
    $(htmlTag).dialog({
      width: cookie[htmlTagWOClassifier]['width'],
      height: cookie[htmlTagWOClassifier]['height'],
    position: { my: "left top", at: "left+"+ cookie[htmlTagWOClassifier]['position'][0]+" top+" + cookie[htmlTagWOClassifier]['position'][1], of: window},
    autoOpen: cookie[htmlTagWOClassifier]['show'],
    close: function(event, ui) {
        // save to cookie
      },
    resizeStop: function(event, ui) {
        // save to cookie
      }
    });
  }

  show() {
    if($(this.htmlTag).dialog('isOpen'))
      $(this.htmlTag).dialog('close');
    else
      $(this.htmlTag).dialog('open');
  }
}

$(document).ready(async function()
{
  // connect to server
  await connect();

  window.map = new MyMap('#map');
  window.chart = new Charts('#chart');
  window.hud = new Hud('#HUD');
  window.table = new Table('#table');
});
