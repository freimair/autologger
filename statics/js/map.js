var map;

class MyMap extends App {
  map;
  boatMarker;
  track;
  wind;
  windIndicators;
  windArrows = [];

  constructor() {
    super('Map',``);

    this.map = L.map("map").setView([44, 15.5], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
    }).addTo(this.map);

    this.map.addControl(new L.Control.ScaleNautic({
      metric: false,
      imperial: false,
      nautic: true
    }));

    let options = {
      unit: 'nauticalmiles',
      showBearings: true,
      clearMeasurementsOnStop: false,
      showClearControl: true
    };
    L.control.polylineMeasure(options).addTo(this.map);

    this.map.on("zoomend", (e) => {
      let ratio = 40 - 2 * e.target.getZoom();
      for (let i = 0; i < this.windArrows.length; i++) {
        this.windArrows[i].setOpacity(i % ratio == 0 ? 1 : 0);
      }
    });

    this.windIndicators = {};
    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach((current) => {
        this.windIndicators[current] = L.icon({
            iconUrl: 'images/' + current + 'kn.svg',
            className: 'windarrow'
        });
    });
  }

  clear() {
    if(this.track)
        this.track.setLatLngs([]);
    this.windArrows.forEach((current) => {current.remove()});
    this.windArrows = [];
  }

  add(incoming) {
    if(undefined == incoming.logline)
      return;

    incoming = incoming.logline;

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
        this.boatMarker.setRotationAngle(incoming.CoG);
      } else
        this.boatMarker = L.marker([
          incoming.Latitude,
          incoming.Longitude,
        ], {
          icon: L.icon({iconUrl:"images/boat.svg", className: "boatmarker"}),
          rotationAngle: incoming.CoG
        }).addTo(this.map);
      this.map.panTo(newPosition);
    }
    if(incoming.Windspeed && incoming.WindAngle && this.boatMarker) {
        if(this.windArrows && 1 < this.windArrows.length) {
            if(50 < this.map.distance(this.windArrows[this.windArrows.length-1].getLatLng(), this.boatMarker.getLatLng())) {
                let newWindArrow = L.marker(this.boatMarker.getLatLng(), {icon: this.windIndicators[Math.round(incoming.Windspeed / 5) * 5], rotationAngle:incoming.WindAngle}).addTo(this.map);
                this.windArrows.push(newWindArrow);
                let ratio = 40 - 2 * this.map.getZoom();
                newWindArrow.setOpacity(this.windArrows.length % ratio == 0 ? 1 : 0);
            }
        } else {
            this.windArrows.push(L.marker(this.boatMarker.getLatLng(), {icon: this.windIndicators[Math.floor(incoming.Windspeed / 5) * 5], rotationAngle:incoming.WindAngle}).addTo(this.map));
        }
    }
  }

  refresh() {
    this.map.invalidateSize(false);
  }
}
