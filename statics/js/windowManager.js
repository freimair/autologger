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
  static defaultWindowPositions = {
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
  static cookieName = 'windowPositions';

  getType() {
    return DesktopWindowManager.name;
  }

  register(id) {
    $('#toc-' + id.replace('#', '')).show();
    super.register(id);

    let positions = DesktopWindowManager.loadPositions();

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
  static loadPositions() {

    let rawPositions = DesktopWindowManager.getCookie(DesktopWindowManager.cookieName);

    if('' == rawPositions) {
      // create cookie
      this.setCookie(DesktopWindowManager.cookieName, JSON.stringify(DesktopWindowManager.defaultWindowPositions));
      return DesktopWindowManager.defaultWindowPositions;
    }

    return JSON.parse(rawPositions);
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

  /**
   * from https://www.w3schools.com/js/js_cookies.asp
   * 
   * @param {string} cname
   * @returns cookie as string
   */
  static getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  /**
   * from https://www.w3schools.com/js/js_cookies.asp
   * 
   * @param {string} cname
   * @param {string} cvalue
   */
  static setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
  }
}