class WindowManager {
  registered = [];

  getType() {
    return WindowManager.name;
  }

  static update() {
    let newWindowManager;

    if(0 == Connection.connected())
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
      position: {left: 5, top: 50},
      size: {width: 750, height: 150},
      show: true
    },
    map: {
      position: {left: 765, top: 50},
      size: {width: 590, height: 380},
      show: true
    },
    logbookcontrols: {
      position: {left: 1365, top: 50},
      size: {width: 200, height: 380},
      show: true
    },
    plots: {
      position: {left: 765, top: 430},
      size: {width: 800, height: 525},
      show: true
    },
    settingsPage: {
      position: {left: 600, top: 600},
      size: {width: 500, height: 500},
      show: false
    },
    table: {
      position: {left: 5, top: 200},
      size: {width: 750, height: 755},
      show: true
    },
    settings: {
      position: {left: 5, top: 200},
      size: {width: 750, height: 755},
      show: true
    },
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
      width: positions[htmlTagWOClassifier].size.width,
      height: positions[htmlTagWOClassifier].size.height,
      position: { my: "left top", at: "left+"+ positions[htmlTagWOClassifier].position.left+" top+" + positions[htmlTagWOClassifier].position.top, of: window},
      autoOpen: positions[htmlTagWOClassifier].show,
      open: function(event, ui) {
          window.controller.refresh();
        },
    close: function(event, ui) {
        DesktopWindowManager.setPosition(htmlTagWOClassifier, ui, false);
      },
    resizeStop: function(event, ui) {
        DesktopWindowManager.setPosition(htmlTagWOClassifier, ui);
        window.controller.refresh();
      },
    dragStop: function(event, ui) {
        DesktopWindowManager.setPosition(htmlTagWOClassifier, ui);
      },
    });
  }

  /**
   * Load window positions from cookie or default
   * 
   * @returns window Positions as map "windowName" => {position => {top => int, left => int}, size => {width => int, height => int}, show => bool};
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

  /**
   * 
   * @param {string} app 
   * @param {object} positionInfo 
   */
  static setPosition(app, positionInfo = new Object(), showDialog = true) {
    app = app.replace('#', '');

    let positions = DesktopWindowManager.loadPositions();

    if(positionInfo.position)
      positions[app].position = positionInfo.position;
    if(positionInfo.size)
      positions[app].size = positionInfo.size;
    positions[app].show = showDialog;

    DesktopWindowManager.setCookie(DesktopWindowManager.cookieName, JSON.stringify(positions));
  }

  unregister(id) {
    $(id).dialog('destroy');
    super.unregister(id);
  }

  show(id) {
    if($(id).dialog('isOpen'))
      $(id).dialog('close');
    else {
      $(id).dialog('open');
      DesktopWindowManager.setPosition(id);
    }
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