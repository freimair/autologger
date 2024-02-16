var settings;

class Settings extends App {

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

    $('#saveLogbookButton').click(() => {
        this.connector.send({'save':{'id':0, 'title':$('#logbookTitle').val(), 'description':$('#logbookDescription').val()}})
        setTimeout(() => this.connector.close(), 100);
        setTimeout(() => this.connector.connect(), 200);
    });

    $('#exportLogbookButton').click(function() {
        window.location = '/logbook/logbook.csv';
    });
    $('#exportGpxButton').click(function() {
        window.location = '/logbook/track.gpx';
    });
  }

  refresh() {
    this.connector.send({"get": "logbooks"});
  }

  add(incoming) {
    if(undefined == incoming.logbooks)
      return;

    let logbooks = incoming.logbooks;

    $('#logbookList').empty();
    logbooks.forEach(function(item) {
      $('#logbookList').append('<li>' + item.title + ' <button data-id="' + item.id + '" class="loadLogbookButton">load</button></li>');
    });

    $('.loadLogbookButton').click((event) => {
      this.connector.send({"load":event.target.getAttribute('data-id')});
      setTimeout(() => this.connector.close(), 100);
      setTimeout(() => this.connector.connect(), 200);
    });
  }
}
