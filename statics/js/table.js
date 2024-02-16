var table;

class Table extends App {
  table;

  constructor() {
    super(Table.name, `
      <table data-role="table" id="table" class="ui-body-d ui-shadow table-stripe ui-responsive table-stroke" data-column-btn-theme="d" data-column-btn-text="Columns to display..." data-column-popup-theme="d">
      </table>
      <div id="popup" style="display: none;" title="Details"><h1 id="popup-title"></h1><div id="popup-content"></div><div id="popup-controls"><button id="popup-close">Close</button></div></div>
    `);

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
          data: "timestamp",
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

    // redraw table on changed visibility of columns
    this.table.on('column-visibility.dt', () => {this.table.draw();});

    // only show certain columns by default. save that to local storage? or to logbook?
    this.table.columns().visible(false);
    this.table.columns([0, 11, 12]).visible(true);

    $('#popup-close').click(function()
    {
        $('#popup').dialog('close');
    })
  }

  clear() {
    this.table.rows().remove().draw();
  }

  add(incoming) {
    if(undefined == incoming.logline)
      return;

    let content = incoming.logline;

    if(content.subject) {
      content.message = content.subject + ' <button onclick="$(\'#popup-title\').text(\'' + content.subject + '\'); $(\'#popup-content\').html(decodeURI(\'' + encodeURI(content.content) + '\')); $(\'#popup\').dialog()" >Show</button>';
    }
    this.table.row.add(content).draw();
  }
}

// plugin for hiding empty table rows
// - according to visible columns
// - excluding DateTime column
$.fn.dataTable.ext.search.push(
  function( settings, searchData, index, rowData, counter ) {
    let show = false;

    settings.aoColumns.forEach((current) => {
      if(current.bVisible && current.idx != 0) // exclude DateTime
        show |= searchData[current.idx] !== '-';
    });

    return show;
  }
);

