var map;
var layer_mapnik;
var layer_tah;
var layer_seamark;
var layer_pois;
var layer_markers;

function drawmap() {
    // Popup und Popuptext mit evtl. Grafik
    var popuptext=" ";

    OpenLayers.Lang.setCode('de');

    // Position und Zoomstufe der Karte
    var lon = 6.641389;
    var lat = 49.756667;
    var zoom = 7;

    map = new OpenLayers.Map('map', {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.PanZoomBar()],
        maxExtent:
            new OpenLayers.Bounds(-20037508.34,-20037508.34,
                                    20037508.34, 20037508.34),
        numZoomLevels: 18,
        maxResolution: 156543,
        units: 'meters'
    });

    layer_mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");
    layer_seamark = new OpenLayers.Layer.TMS("Seezeichen", "http://tiles.openseamap.org/seamark/", { numZoomLevels: 18, type: 'png', getURL: getTileURL, isBaseLayer: false, displayOutsideMaxExtent: true});
    layer_pois = new OpenLayers.Layer.Vector("Häfen", { projection: new OpenLayers.Projection("EPSG:4326"), visibility: true, displayOutsideMaxExtent:true});
    layer_pois.setOpacity(0.8);

    layer_markers = new OpenLayers.Layer.Markers("Address", { projection: new OpenLayers.Projection("EPSG:4326"),
    	                                          visibility: true, displayInLayerSwitcher: false });

    map.addLayers([layer_mapnik, layer_seamark, layer_pois, layer_markers]);
    jumpTo(lon, lat, zoom);

    // Position des Markers
    

}
