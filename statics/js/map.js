var map;
var boatMarker;
var track;

$(document).ready(function()
{
    window.map = L.map('map').setView([44, 15.5], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(window.map);
    L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>'
    }).addTo(window.map);
});