class WindowManager {
  registered = [];

  getType() {
    return WindowManager.name;
  }

  static update() {
    let newWindowManager;

    if(0 == window.connected)
      newWindowManager = new ClosedLogbook();
    else if(Math.min($(window).width(), $(window).height()) >= 768)
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

class ClosedLogbook extends WindowManager {
  getType() {
    return ClosedLogbook.name;
  }

  register(id) {
    $(id).hide();
    $('#toc-' + id.replace('#', '')).hide();
    super.register(id);
  }
}

var windowManager = new ClosedLogbook();

class MobileWindowManager extends WindowManager {
  getType() {
    return MobileWindowManager.name;
  }

  register(id) {
    $(id).show();
    $('#toc-' + id.replace('#', '')).show();
    super.register(id);
  }

}

class DesktopWindowManager extends WindowManager {
  defaultWindowPositions = {
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
    }
  };

  getType() {
    return DesktopWindowManager.name;
  }

  register(id) {
    $('#toc-' + id.replace('#', '')).show();
    super.register(id);

    let positions = this.loadPositions();

    let htmlTagWOClassifier = id.replace('#', '');
    $("#" + htmlTagWOClassifier).dialog({
      width: positions[htmlTagWOClassifier]['width'],
      height: positions[htmlTagWOClassifier]['height'],
    position: { my: "left top", at: "left+"+ positions[htmlTagWOClassifier]['position'][0]+" top+" + positions[htmlTagWOClassifier]['position'][1], of: window},
    autoOpen: positions[htmlTagWOClassifier]['show'],
    close: function(event, ui) {
        // save to cookie
      },
    resizeStop: function(event, ui) {
        // save to cookie
      }
    });
  }

  /**
   * Load window positions from cookie or default
   * 
   * @returns window Positions as map "windowName" => ["position" => [x, y], "width" => int, "height" => int, "show" => bool];
   */
  loadPositions() {
    return this.defaultWindowPositions;
  }

  unregister(id) {
    $(id).dialog('destroy');
    super.unregister(id);
  }

  show(id) {
    if($(id).dialog('isOpen'))
      $(id).dialog('close');
    else
      $(id).dialog('open');
  }
}