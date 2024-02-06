var settings;

class Settings extends DisplayAble {

  constructor() {
    super(Settings.name,`
        <button id="exportLogbookButton">Export Logbook</button>
        <button id="exportGpxButton">Export GPX</button>
        <h1>Load Logbook</h1>
        <ul id="logbookList">
        </ul>

        <h1>Create Logbook</h1>
        <label for="text-3">Bezeichnung:</label>
        <input type="text" data-clear-btn="true" name="text-3" id="logbookTitle" value="">
        <label for="logbookDescription">Beschreibung:</label>
        <textarea name="logbookDescription" id="logbookDescription" style="height: 50px;" data-corners="false"></textarea>
        <button id="saveLogbookButton">Save</button>
        `);

    $('#saveLogbookButton').click(function() {
        Connection.send({'save':{'id':0, 'title':$('#logbookTitle').val(), 'description':$('#logbookDescription').val()}})
        setTimeout(() => Connection.close(), 100);
        setTimeout(() => Connection.connect(), 200);
    });

    $('#exportLogbookButton').click(function() {
        window.location = '/logbook/logbook.csv';
    });
    $('#exportGpxButton').click(function() {
        window.location = '/logbook/track.gpx';
    });
  }

  refresh() {
    Connection.send({"get": "logbooks"});
  }

  add(logbooks) {
    $('#logbookList').empty();
    logbooks.forEach(function(item) {
      $('#logbookList').append('<li>' + item.title + ' <button data-id="' + item.id + '" onclick="Settings.loadLogbook(this);">load</button></li>');
    });
  }

  static loadLogbook(item) {
    Connection.send({"load":item.getAttribute('data-id')});
    setTimeout(() => Connection.close(), 100);
    setTimeout(() => Connection.connect(), 200);
  }
}
