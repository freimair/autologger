addEventListener("resize", (event) => {WindowManager.update()});

class WindowManager {
  registered = [];

  getType() {
    return WindowManager.name;
  }

  static start() {
    WindowManager.update();
  }

  static stop() {
    WindowManager.update(new ClosedLogbook());
  }

  /**
   * Decides whether window manager for mobile of desktop is appropriate.
   * 
   * If a windowmanager is given, the given one is used.
   * 
   * @param {WindowManager} newWindowManager
   */
  static update(newWindowManager = null) {
    if(newWindowManager instanceof WindowManager)
      {}
    else if(Math.min($(window).width(), $(window).height()) >= 768)
      newWindowManager = new DesktopWindowManager();
    else
      newWindowManager = new MobileWindowManager();

    if(window.windowManager.getType() != newWindowManager.getType()) {
      let managedApps = window.windowManager.getRegistered();
      for(const app of managedApps) {
        window.windowManager.unregister(app);
        newWindowManager.register(app);
        app.refresh();
      }
      window.windowManager = newWindowManager;
    }
  }

  /**
   * @param {App} app
   */
  register(app) {
    this.registered.push(app);
  }

  /**
   * @param {string} htmlTag
   */
  show(htmlTag) {

  }

  /**
   * @returns  {App[]}
   */
  getRegistered() {
    return this.registered;
  }

  /**
   * @param {App} app
   */
  unregister(app) {
    this.registered = Array.prototype.filter(function (current) {return id !== current; });
  }
}

class ClosedLogbook extends WindowManager {
  getType() {
    return ClosedLogbook.name;
  }

  register(app) {
    $(app.htmlTag).hide();
    $('#toc-' + app.htmlTag.replace('#', '')).hide();
    super.register(app);
  }
}

var windowManager = new ClosedLogbook();

class MobileWindowManager extends WindowManager {
  getType() {
    return MobileWindowManager.name;
  }

  register(app) {
    $(app.htmlTag).show();
    $('#toc-' + app.htmlTag.replace('#', '')).show();
    super.register(app);
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

  register(app) {
    $('#toc-' + app.htmlTag.replace('#', '')).show();
    super.register(app);

    let positions = DesktopWindowManager.loadPositions();

    let htmlTagWOClassifier = app.htmlTag.replace('#', '');
    $(app.htmlTag).dialog({
      width: positions[htmlTagWOClassifier].size.width,
      height: positions[htmlTagWOClassifier].size.height,
      position: { my: "left top", at: "left+"+ positions[htmlTagWOClassifier].position.left+" top+" + positions[htmlTagWOClassifier].position.top, of: window},
      autoOpen: positions[htmlTagWOClassifier].show,
      open: () => {
          app.refresh();
        },
    close: function(event, ui) {
        DesktopWindowManager.setPosition(htmlTagWOClassifier, ui, false);
      },
    resizeStop: (event, ui) => {
        DesktopWindowManager.setPosition(htmlTagWOClassifier, ui);
        app.refresh();
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

  unregister(app) {
    $(app.htmlTag).dialog('destroy');
    super.unregister(app);
  }

  show(htmlTag) {
    if($(htmlTag).dialog('isOpen'))
      $(htmlTag).dialog('close');
    else {
      $(htmlTag).dialog('open');
      DesktopWindowManager.setPosition(htmlTag);
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