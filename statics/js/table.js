var table;

class Table {
  table;

  constructor() {
    this.table = $("[data-role='table']").DataTable({
      dom: "Bfrtip",
      searching: true,
      orderFixed: [[0, "desc"]],
      columnDefs: [
        {
          targets: "_all",
          defaultContent: "-",
        },
      ],
      buttons: [
        {
          extend: "colvis",
        },
      ],
      columns: [
        {
          title: "Datum und Uhrzeit",
          data: "DateTime",
        },
        {
          title: "Log",
          data: "Log",
          className: "dt-right",
        },
        {
          title: "CoG",
          data: "CoG",
          className: "dt-right",
        },
        {
          title: "SoG",
          data: "SoG",
          className: "dt-right",
        },
        {
          title: "Position",
          render: function (data, type, row) {
            if (row.Latitude && row.Longitude)
              return row.Latitude + "/" + row.Longitude;
          },
        },
        {
          title: "MgK",
          data: "Heading",
          className: "dt-right",
        },
        {
          title: "scheinbarer Wind",
          render: function (data, type, row) {
            if (row.Windspeed && row.WindAngle)
              return row.Windspeed + "kn aus " + row.WindAngle + "°";
          },
        },
        {
          title: "Tiefe",
          data: "Depth",
          className: "dt-right",
        },
        {
          title: "Lufttemperatur",
          data: "AirTemperature",
        },
        {
          title: "Luftdruck",
          data: "AirPressure",
        },
        {
          title: "Luftfeuchtigkeit",
          data: "Humidity",
        },
        {
          title: "Status",
          data: "status",
        },
        {
          title: "Nachricht",
          data: "message",
        },
      ],
    });

    // react to visibility change of columns by filtering empty lines
    //this.table.on('column-visibility.dt', hideEmptyRows);

    // only show certain columns by default. save that to local storage? or to logbook?
    this.table.columns().visible(false);
    this.table.columns([0, 11, 12]).visible(true);
  }

  add(content) {
    this.table.row.add(content).draw();
  }

  getVisibleColumns() {
    // fetch visible columns
    let visibleColumns = [];
    this.table.columns()[0].forEach(function (current) {
      if (this.table.column(current).visible()) visibleColumns.push(current);
    });

    return visibleColumns;
  }

  hideEmptyRows() {
    visibleColumns = this.getVisibleColumns();

    // remove date/time column from filter
    visibleColumns.shift();

    // reset search
    window.table.columns().search("");

    // prepare new search and apply changes by doing a redraw
    this.table
      .columns(visibleColumns)
      .search("^(?:(?!-).)*$\r?\n?", true, true)
      .draw();

    // in case there is nothing left, remove the filter again. kind of a nasty hack, but it is GEFN
    if (0 == this.table.page.info().end) this.table.columns().search("").draw();
  }
}

$(document).ready(function () {
  window.table = new Table();
});
