$(document).ready(function()
{
  /*
   * ##############################################################################
   * ## Widget Controls ###########################################################
   * ##############################################################################
   */

  $('#showMapButton').click(function() {
    window.map.show();
  })

  $('#showPlotButton').click(function() {
    window.plots.show();
  })

  $('#showTableButton').click(function() {
    window.table.show();
  })

  $('#showLogbookControlsButton').click(function() {
    window.logbookControls.show();
  })

  $('#showSettingsButton').click(function() {
    DisplayAble.createDialog('#settingsPage');
    $('#settingsPage').dialog('open');
  })

  $('#showHudButton').click(function() {
    window.hud.show();
  })


});
