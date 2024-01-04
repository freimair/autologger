class WindowManager {
  registered = [];

  getType() {
    return WindowManager.name;
  }

  static update() {
    let newWindowManager;

    if(Math.min($(window).width(), $(window).height()) >= 768)
      newWindowManager = new DesktopWindowManager();
    else
      newWindowManager = new MobileWindowManager();

    if(window.windowManager.getType() != newWindowManager.getType()) {
      let managedApps = window.windowManager.getRegistered();
      for(const app of managedApps) {
        window.windowManager.unregister(app);
        newWindowManager.register(app);
      }
      window.windowManager = newWindowManager;
    }
  }

  register(id) {
    this.registered.push(id);
  }

  show(id) {

  }

  getRegistered() {
    return this.registered;
  }

  unregister(id) {
    this.registered = Array.prototype.filter(function (current) {return id !== current; });
  }
}

var windowManager = new WindowManager();

class MobileWindowManager extends WindowManager {
  getType() {
    return MobileWindowManager.name;
  }

}

class DesktopWindowManager extends WindowManager {
  getType() {
    return DesktopWindowManager.name;
  }

  register(id) {

    this.registered.push(id);
        // load from cookie
    //cookie = decodeURIComponent(document.cookie);

    let cookie = {
      hud: {
        position: [5, 50],
        width: 750,
        height: 150,
        show: true
      },
      map: {
        position: [765, 50],
        width: 590,
        height: 380,
        show: true
      },
      logbookcontrols: {
        position: [1365, 50],
        width: 200,
        height: 380,
        show: true
      },
      plots: {
        position: [765, 430],
        width: 800,
        height: 525,
        show: true
      },
      settingsPage: {
        position: [600, 600],
        width: 500,
        height: 500,
        show: false
      },
      table: {
        position: [5, 200],
        width: 750,
        height: 755,
        show: true
      }};

      let htmlTagWOClassifier = id.replace('#', '');
      $("#" + htmlTagWOClassifier).dialog({
        width: cookie[htmlTagWOClassifier]['width'],
        height: cookie[htmlTagWOClassifier]['height'],
      position: { my: "left top", at: "left+"+ cookie[htmlTagWOClassifier]['position'][0]+" top+" + cookie[htmlTagWOClassifier]['position'][1], of: window},
      autoOpen: cookie[htmlTagWOClassifier]['show'],
      close: function(event, ui) {
          // save to cookie
        },
      resizeStop: function(event, ui) {
          // save to cookie
        }
      });
  }

  unregister(id) {
    $(id).dialog('destroy');

    this.registered = Array.prototype.filter(function (current) {return id !== current; });
  }

  show(id) {
    if($(id).dialog('isOpen'))
      $(id).dialog('close');
    else
      $(id).dialog('open');
  }
}