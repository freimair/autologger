var table;

class Table extends DisplayAble {
  table;

  constructor(htmlTag) {
    $('body').append(`
    <div id="table" style="display: none;" title="Table">
      <table data-role="table" id="table" class="ui-body-d ui-shadow table-stripe ui-responsive table-stroke" data-column-btn-theme="d" data-column-btn-text="Columns to display..." data-column-popup-theme="d">
      </table>
    </div>
    `);

    super('#table');

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

    // redraw table on changed visibility of columns
    this.table.on('column-visibility.dt', () => {this.table.draw();});

    // only show certain columns by default. save that to local storage? or to logbook?
    this.table.columns().visible(false);
    this.table.columns([0, 11, 12]).visible(true);
  }

  clear() {
    this.table.rows().remove().draw();
  }

  add(content) {
    if(content.message) {
      let tmp = content.message;
      content.message = tmp.subject + ' <button onclick="$(\'#popup-title\').text(\'' + tmp.subject + '\'); $(\'#popup-content\').html(decodeURI(\'' + encodeURI(tmp.content) + '\')); $(\'#popup\').dialog()" >Show</button>';
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

