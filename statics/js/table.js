var table;

$(document).ready(function()
{
  window.table = $("[data-role='table']").DataTable({
	dom: 'Bfrtip',
	searching: true,
	orderFixed: [[0, "desc"]],
	columnDefs: [ {
		targets: '_all',
		defaultContent: "-"
	}],
	buttons: [{
		extend: 'colvis'
	}],
	columns: [ {
		title: "Datum und Uhrzeit",
		data: "DateTime"
	}, {
		title: "Log",
		data: "Log",
		className: "dt-right"
	}, {
		title: "CoG",
		data: "CoG",
		className: "dt-right"
	}, {
		title: "SoG",
		data: "SoG",
		className: "dt-right"
	}, {
		title: "Position",
		render: function(data, type, row) {
			if(row.Latitude && row.Longitude)
				return row.Latitude + "/" + row.Longitude;
		}
	}, {
		title: "MgK",
		data: "Heading",
		className: "dt-right"
	}, {
		title: "scheinbarer Wind",
		render: function(data, type, row) {
			if(row.Windspeed && row.WindAngle)
				return row.Windspeed + "kn aus " + row.WindAngle + "°"
		}
	}, {
		title: "Tiefe",
		data: "Depth",
		className: "dt-right"
	}, {
		title: "Lufttemperatur",
		data: "AirTemperature"
	}, {
		title: "Luftdruck",
		data: "AirPressure"
	}, {
		title: "Luftfeuchtigkeit",
		data: "Humidity"
	}, {
		title: "Status",
		data: "status"
	}, {
    title: "Nachricht",
    data: "message"
  } ]
  });

  // react to visibility change of columns by filtering empty lines
  window.table.on('column-visibility.dt', hideEmptyRows);
});


function getVisibleColumns() {

    // fetch visible columns
    let visibleColumns = [];
    window.table.columns()[0].forEach(function(current) {
      if(window.table.column(current).visible())
        visibleColumns.push(current);
    });

    return visibleColumns;
}

function hideEmptyRows() {
    visibleColumns = getVisibleColumns();

    // remove date/time column from filter
    visibleColumns.shift();

    // reset search
    window.table.columns().search('');

    // prepare new search and apply changes by doing a redraw
    window.table.columns(visibleColumns).search('^(?:(?!-).)*$\r?\n?', true, true).draw();

    // in case there is nothing left, remove the filter again. kind of a nasty hack, but it is GEFN
    if(0 == window.table.page.info().end)
      window.table.columns().search('').draw();
}