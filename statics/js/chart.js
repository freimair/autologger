var chart_SoG;
var chart_weather;
var chart_wind;

$(document).ready(function()
{
    window.chart_SoG = new Chart(document.getElementById('chart_SoG'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'SoG',
                data: [],
                fill: false,
                borderColor: 'rgb(0, 255, 0)',
                tension: 0.1
            }
        ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                    display: true,
                    text: 'Kn'
                    }
                }
            }
        }
    });

    window.chart_weather = new Chart(document.getElementById('chart_weather'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'AirTemp',
                data: [],
                fill: false,
                borderColor: 'rgb(255, 0, 255)',
                tension: 0.1,
                yAxisID: 'y'
            },{
            label: 'AirPressure',
            data: [],
            fill: false,
            borderColor: 'rgb(0, 0, 255)',
            tension: 0.1,
            yAxisID: 'y1'
        }
        ]
        }, options: {
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
            title: {
                display: true,
                text: '°C'
            }
            },
            y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
                display: true,
                text: 'Pa'
            }
            }
        }
        }
    });

    window.chart_wind = new Chart(document.getElementById('chart_wind'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Windspeed',
            data: [],
            fill: false,
            borderColor: 'rgb(255, 0, 0)',
            tension: 0.1,
            yAxisID: 'y'
        },{
            label: 'Direction',
            data: [],
            fill: false,
            borderColor: 'rgb(0, 0, 255)',
            tension: 0.1,
            yAxisID: 'y1'
        }
        ]
    }, options: {
        interaction: {
        mode: 'index',
        intersect: false,
        },
        scales: {
        y: {
            title: {
            display: true,
            text: 'Kn'
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
            display: true,
            text: '°'
            }
        }
        }
    }
    });
});