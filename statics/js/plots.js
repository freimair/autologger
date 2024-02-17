var plots;

class Plots extends App {
  plot_SoG;
  plot_weather;
  plot_wind;

  constructor() {
    super(Plots.name, `
      <canvas id="plot_SoG" width="400" height="75"></canvas>
      <canvas id="plot_weather" width="400" height="75"></canvas>
      <canvas id="plot_wind" width="400" height="75"></canvas>
    `);

    this.plot_SoG = new Chart(document.getElementById("plot_SoG"), {
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

    this.plot_weather = new Chart(document.getElementById("plot_weather"), {
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

    this.plot_wind = new Chart(document.getElementById("plot_wind"), {
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
            label: "Angle",
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
    this.plot_SoG.data.labels = [];
    this.plot_SoG.data.datasets[0].data = [];
    this.plot_SoG.update();
    this.plot_weather.data.labels = [];
    this.plot_weather.data.datasets[0].data = [];
    this.plot_weather.update();
    this.plot_wind.data.labels = [];
    this.plot_wind.data.datasets[0].data = [];
    this.plot_wind.update();
  }

  add(incoming) {
    if(undefined == incoming.logline)
      return;

    incoming = incoming.logline;

    if (incoming.SoG) {
      this.plot_SoG.data.labels.push(incoming.timestamp);
      this.plot_SoG.data.datasets[0].data.push(incoming.SoG);

      if (150 < this.plot_SoG.data.labels.length) {
        this.plot_SoG.data.labels.shift();
        this.plot_SoG.data.datasets[0].data.shift();
      }

      this.plot_SoG.update();
    }
    if (incoming.AirTemperature && incoming.AirPressure) {
      this.plot_weather.data.labels.push(incoming.timestamp);
      this.plot_weather.data.datasets[0].data.push(incoming.AirTemperature);
      this.plot_weather.data.datasets[1].data.push(incoming.AirPressure);

      if (150 < this.plot_weather.data.labels.length) {
        this.plot_weather.data.labels.shift();
        this.plot_weather.data.datasets[0].data.shift();
        this.plot_weather.data.datasets[1].data.shift();
      }

      this.plot_weather.update();
    }
    if (incoming.Windspeed && incoming.WindAngle) {
      this.plot_wind.data.labels.push(incoming.timestamp);
      this.plot_wind.data.datasets[0].data.push(incoming.Windspeed);
      this.plot_wind.data.datasets[1].data.push(incoming.WindAngle);

      if (150 < this.plot_wind.data.labels.length) {
        this.plot_wind.data.labels.shift();
        this.plot_wind.data.datasets[0].data.shift();
        this.plot_wind.data.datasets[1].data.shift();
      }

      this.plot_wind.update();
    }
  }
}
