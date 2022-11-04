var hud;

class Hud {
    add(incoming) {
        if(incoming.Latitude && incoming.Longitude && incoming.SoG) {
            $("#dataPos").text(incoming.Latitude + "/" + incoming.Longitude);
            $("#dataCoG").text(incoming.CoG);
            $("#dataSoG").text(incoming.SoG);
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
