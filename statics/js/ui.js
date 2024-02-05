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
});
