var hud;

class Hud extends App {

    constructor() {
        super(Hud.name, `
          <table border="0" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td width="25%" height="20" align="center" valign="middle">Wind</td>
              <td width="25%" height="20" align="center" valign="middle">COG</td>
              <td width="25%" height="20" align="center" valign="middle">SOG</td>
              <td width="25%" height="20" align="center" valign="middle">Status</td>
            </tr>
            <tr>
              <td width="25%" height="40" align="center" valign="middle"><span id="dataWind"></span></td>
              <td width="25%" height="40" align="center" valign="middle"><span id="dataCoG"></span></td>
              <td width="25%" height="40" align="center" valign="middle"><span id="dataSoG"></span></td>
              <td width="25%" height="40" align="center" valign="middle"><span id="dataStatus"></span></td>
            </tr>
          </table>
        `);
    }

    add(incoming) {
        if(undefined == incoming.logline)
            return;

        incoming = incoming.logline;

        if(incoming.CoG && incoming.SoG) {
            $("#dataCoG").text(incoming.CoG);
            $("#dataSoG").text(incoming.SoG);
        }
        if(incoming.Windspeed && incoming.WindAngle) {
            $("#dataWind").text(incoming.Windspeed + "kn aus " + incoming.WindAngle + "°");
        }
        if(incoming.status) {
            $("#dataStatus").text(incoming.status);
        }
    }

    clear() {
      $("#dataCoG").text('-');
      $("#dataSoG").text('-');
      $("#dataWind").text('-');
      $("#dataStatus").text('-');
    }
}