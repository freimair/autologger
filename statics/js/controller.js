class Controller {
  apps=[];

  /**
   * @param {Connector} connector 
   */
  constructor(connector) {
    this.connector = connector;
    this.connector.init(
      () => {
        this.clear();
        this.connector.send({"get": "tail"});
        this.connector.send({"get": "last"});
        $('#loaderpage').hide();
        $('#fehler').empty();
        WindowManager.start();
      },
      () => {
        WindowManager.stop();
        $('#loaderpage').show();
      },
      () => {
        WindowManager.stop();
        $('#fehler').html('Die Verbindung zum Server wurde unterbrochen');
        $('#loaderpage').show();
      },
      (event) => {
        this.incoming(event.data);
      }
    );
  }

  addApp(app) {
    app.init(this.connector);
    this.apps.push(app);
  }

  start() {
    this.connector.connect();
  }

  clear() {
    this.apps.forEach(app => {
      app.clear();
    });
  }

  refresh() {
    this.apps.forEach(app => {
      app.refresh();
    });
  }

  incoming(was) {
    var json = JSON.parse(was);

    this.apps.forEach(app => {
      app.add(json);
    });
  }
}

class App {
  static parentTag = "#apps";
  static tocTag = "#toc";
  htmlTag;
  connector;

  constructor(name, content) {
    this.htmlTag = "#" + name.toLowerCase();
    $(App.parentTag).append(`<div id=\"${name.toLowerCase()}\" class=\"app\" title=\"${name}\">${content}</div>`);
    $(App.tocTag).append(`<a id="toc-${name.toLowerCase()}" href="#${name.toLowerCase()}" onClick="window.windowManager.show('${this.htmlTag}')">${name}</a>`);

    window.windowManager.register(this.htmlTag);
  }

  init(connector) {
    this.connector = connector;
  }

  show() {
    window.windowManager.show(this.htmlTag);
  }

  refresh() {

  }

  clear() {

  }

  add(json) {

  }
}

$(document).ready(async function()
{
  let controller = new Controller(new WebSocketConnector());

  controller.addApp(new MyMap());
  controller.addApp(new Plots());
  controller.addApp(new Hud());
  controller.addApp(new Table());
  controller.addApp(new LogbookControls());
  controller.addApp(new Settings());

  controller.start();

  window.controller = controller;
});
