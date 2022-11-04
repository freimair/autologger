var hud;

class Hud {
    add(incoming) {
        if(incoming.CoG && incoming.SoG) {
            $("#dataCoG").text(incoming.CoG);
            $("#dataSoG").text(incoming.SoG);
        }
        if(incoming.Windspeed && incoming.WindAngle) {
            $("#dataWind").text(incoming.Windspeed + "kn aus " + incoming.WindAngle + "°");
        }
        if(incoming.status) {
            $("#dataStatus").text(incoming.status);
            gotoScreen(incoming.status);
        }
    }
}

$(document).ready(function () {
  window.hud = new Hud();
});
