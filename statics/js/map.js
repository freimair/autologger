var map;

class MyMap {
  map;
  boatMarker;
  track;
  wind;

  constructor() {
    this.map = L.map("map").setView([44, 15.5], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    L.tileLayer("http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
    }).addTo(this.map);

    this.icon = L.icon({
        iconUrl: 'images/45kn.svg',
        className: 'windarrow'
    });

    this.windtest = L.marker(L.latLng(43.94387, 15.428656), {icon: this.icon, rotationAngle:35}).addTo(this.map);
  }

  clear() {
    if(this.track)
        this.track.setLatLngs([]);
  }

  add(incoming) {
    if (incoming.Latitude & incoming.Longitude) {
      var newPosition = L.latLng([incoming.Latitude, incoming.Longitude]);
      if (this.boatMarker) {
        if (this.track) {
          this.track.addLatLng(newPosition);
        } else {
          var latlngs = [newPosition];

          // TODO do not draw a line every time but wait for a min distance
          // TODO memorize and delete these polylines sometime
          this.track = L.polyline(latlngs, { color: "red" }).addTo(this.map);
        }
        this.boatMarker.setLatLng(newPosition);
      } else
        this.boatMarker = L.marker([
          incoming.Latitude,
          incoming.Longitude,
        ]).addTo(this.map);
      this.map.panTo(newPosition);
    }
  }
}

$(document).ready(function () {
  window.map = new MyMap();
});
