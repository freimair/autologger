class Controller {
  static apps=[];

  static addApp(app) {
    Controller.apps.push(app);
  }

  static start() {
    Connection.connect();
  }

  static clear() {
    Controller.apps.forEach(app => {
      app.clear();
    });
  }

  static refresh() {
    Controller.apps.forEach(app => {
      app.refresh();
    });
  }

  static incoming(was) {
    var json = JSON.parse(was);

    Controller.apps.forEach(app => {
      app.add(json);
    });
  }
}

class DisplayAble {
  static parentTag = "#apps";
  static tocTag = "#toc";
  htmlTag;

  constructor(name, content) {
    this.htmlTag = "#" + name.toLowerCase();
    $(DisplayAble.parentTag).append(`<div id=\"${name.toLowerCase()}\" class=\"app\" title=\"${name}\">${content}</div>`);
    $(DisplayAble.tocTag).append(`<a id="toc-${name.toLowerCase()}" href="#${name.toLowerCase()}" onClick="window.windowManager.show('${this.htmlTag}')">${name}</a>`);

    window.windowManager.register(this.htmlTag);
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
   * @returns {?DisplayAble} null if not available
   */
  static getObject(htmlTag) {
    htmlTag = htmlTag.replace('#', '');

    if(window[htmlTag] instanceof DisplayAble)
      return window[htmlTag];
    return null;
  }
}

$(document).ready(async function()
{
  Controller.addApp(new MyMap());
  Controller.addApp(new Plots());
  Controller.addApp(new Hud());
  Controller.addApp(new Table());
  Controller.addApp(new LogbookControls());
  Controller.addApp(new Settings());

  Controller.start();
});

addEventListener("resize", (event) => {WindowManager.update()});