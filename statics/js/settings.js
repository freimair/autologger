var settings;

class Settings extends DisplayAble {

  constructor() {
    super(Settings.name,`
        <button id="exportLogbookButton">Export Logbook</button>
        <button id="exportGpxButton">Export GPX</button>
        <h1>Load Logbook</h1>
        <ul data-role="listview" data-inset="true" id="logbookList">
        </ul>
        <button class="cancelButton">Cancel</button>

        <h1>Create Logbook</h1>
        <label for="text-3">Bezeichnung:</label>
        <input type="text" data-clear-btn="true" name="text-3" id="logbookTitle" value="">
        <label for="logbookDescription">Beschreibung:</label>
        <textarea name="logbookDescription" id="logbookDescription" style="height: 50px;" data-corners="false"></textarea>
        <button id="saveLogbookButton">Save</button>
        <button class="cancelButton">Cancel</button>
        `);

    $('#createLogbookButton').click(function() {
      $('#settingsPage').dialog('close');
      gotoScreen('createLogbookPage');
    });
    $('#loadLogbookButton').click(function() {
        $('#settingsPage').dialog('close');
        senden({'get':'logbooks'})
        gotoScreen('loadLogbookPage');
    });

    $('#saveLogbookButton').click(function() {
        senden({'save':{'id':0, 'title':$('#logbookTitle').val(), 'description':$('#logbookDescription').val()}})
        gotoScreen('home');
    });
    $('.cancelButton').click(function() {
        gotoScreen('home');
    });

    $('#exportLogbookButton').click(function() {
        window.location = '/logbook/logbook.csv';
    });
    $('#exportGpxButton').click(function() {
        window.location = '/logbook/track.gpx';
    });
  }

  refresh() {
    senden({"get": "logbooks"});
  }

  add(logbooks) {
    $('#logbookList').empty();
    logbooks.forEach(function(item) {
      $('#logbookList').append('<li><a onclick="senden({\'load\':' + item.id + '})">' + item.title + "</a></li>");
    });
  }
}
