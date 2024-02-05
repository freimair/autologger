var settings;

class Settings extends DisplayAble {

  constructor() {
    super(Settings.name,`
        <button id="exportLogbookButton">Export Logbook</button>
        <button id="exportGpxButton">Export GPX</button>
        <button id="quitButton" href="#">Quit</button>
      `);

    $('#exportLogbookButton').click(function() {
        window.location = '/logbook/logbook.csv';
    });
    $('#exportGpxButton').click(function() {
        window.location = '/logbook/track.gpx';
    });
    $('#quitButton').click(function() {
        WindowManager.update(true);
    });
  }
}
