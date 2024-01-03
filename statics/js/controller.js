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
    if(window.plots != undefined)
      window.plots.add(json.logline);
    if(window.map != undefined)
      window.map.add(json.logline);
    if(window.hud != undefined)
      window.hud.add(json.logline);
  }
}

class DisplayAble {
  static parentTag = "#apps";
  htmlTag;

  constructor(name, content) {
    this.htmlTag = "#" + name.toLowerCase();
    $(DisplayAble.parentTag).append(`<div id=\"${name.toLowerCase()}\" class=\"app\" title=\"${name}\">${content}</div>`);

    window.windowManager.register(this.htmlTag);
  }

  show() {
    window.windowManager.show(this.htmlTag);
  }
}

$(document).ready(async function()
{
  WindowManager.update();

  // connect to server
  await connect();

  window.map = new MyMap();
  window.plots = new Plots();
  window.hud = new Hud();
  window.table = new Table();
  window.logbookControls = new LogbookControls();
});

addEventListener("resize", (event) => {WindowManager.update()});