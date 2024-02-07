class Controller {
  apps=[];

  constructor() {
    this.connector = new Connection(
      () => {
        this.clear();
        this.connector.send({"get": "tail"});
        this.connector.send({"get": "last"});
        gotoScreen('home');
        WindowManager.update();
      },
      () => {
        WindowManager.update();
        gotoScreen('loaderpage');
        setTimeout(this.connector.connect, 2000);
      },
      () => {
        WindowManager.update();
        $('#fehler').html('<br><br>Die Verbindung zum Server wurde unterbrochen<br><br>');
        gotoScreen('fehler');
      },
      () => {
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

  /**
   * map from html-tag to object
   * 
   * @param {string} htmlTag 
   * @returns {?App} null if not available
   */
  static getObject(htmlTag) {
    htmlTag = htmlTag.replace('#', '');

    if(window[htmlTag] instanceof App)
      return window[htmlTag];
    return null;
  }
}

$(document).ready(async function()
{
  let controller = new Controller();

  controller.addApp(new MyMap());
  controller.addApp(new Plots());
  controller.addApp(new Hud());
  controller.addApp(new Table());
  controller.addApp(new LogbookControls());
  controller.addApp(new Settings());

  controller.start();

  window.controller = controller;
});

addEventListener("resize", (event) => {WindowManager.update()});