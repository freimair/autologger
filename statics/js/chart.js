var chart;

class Charts {
  chart_SoG;
  chart_weather;
  chart_wind;

  constructor() {
    this.chart_SoG = new Chart(document.getElementById("chart_SoG"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "SoG",
            data: [],
            fill: false,
            borderColor: "rgb(0, 255, 0)",
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Kn",
            },
          },
        },
      },
    });

    this.chart_weather = new Chart(document.getElementById("chart_weather"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "AirTemp",
            data: [],
            fill: false,
            borderColor: "rgb(255, 0, 255)",
            tension: 0.1,
            yAxisID: "y",
          },
          {
            label: "AirPressure",
            data: [],
            fill: false,
            borderColor: "rgb(0, 0, 255)",
            tension: 0.1,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "°C",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Pa",
            },
          },
        },
      },
    });

    this.chart_wind = new Chart(document.getElementById("chart_wind"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Windspeed",
            data: [],
            fill: false,
            borderColor: "rgb(255, 0, 0)",
            tension: 0.1,
            yAxisID: "y",
          },
          {
            label: "Direction",
            data: [],
            fill: false,
            borderColor: "rgb(0, 0, 255)",
            tension: 0.1,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Kn",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "°",
            },
          },
        },
      },
    });
  }

  clear() {
    this.chart_SoG.data.labels = [];
    this.chart_SoG.data.datasets[0].data = [];
    this.chart_weather.data.labels = [];
    this.chart_weather.data.datasets[0].data = [];
    this.chart_wind.data.labels = [];
    this.chart_wind.data.datasets[0].data = [];
  }

  add(incoming) {
    if (incoming.SoG) {
      this.chart_SoG.data.labels.push(incoming.DateTime);
      this.chart_SoG.data.datasets[0].data.push(incoming.SoG);

      if (150 < this.chart_SoG.data.labels.length) {
        this.chart_SoG.data.labels.shift();
        this.chart_SoG.data.datasets[0].data.shift();
      }

      this.chart_SoG.update();
    }
    if (incoming.AirTemperature && incoming.AirPressure) {
      this.chart_weather.data.labels.push(incoming.DateTime);
      this.chart_weather.data.datasets[0].data.push(incoming.AirTemperature);
      this.chart_weather.data.datasets[1].data.push(incoming.AirPressure);

      if (150 < this.chart_weather.data.labels.length) {
        this.chart_weather.data.labels.shift();
        this.chart_weather.data.datasets[0].data.shift();
        this.chart_weather.data.datasets[1].data.shift();
      }

      this.chart_weather.update();
    }
    if (incoming.Windspeed && incoming.WindAngle) {
      this.chart_wind.data.labels.push(incoming.DateTime);
      this.chart_wind.data.datasets[0].data.push(incoming.Windspeed);
      this.chart_wind.data.datasets[1].data.push(incoming.WindAngle);

      if (150 < this.chart_wind.data.labels.length) {
        this.chart_wind.data.labels.shift();
        this.chart_wind.data.datasets[0].data.shift();
        this.chart_wind.data.datasets[1].data.shift();
      }

      this.chart_wind.update();
    }
  }
}

$(document).ready(function () {
  window.chart = new Charts();
});
