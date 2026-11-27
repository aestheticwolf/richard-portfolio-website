(function () {
  // WebGL 2.0 compliance guard & warning filter (runs synchronously before any module loads)
  try {
    if (typeof WebGL2RenderingContext !== 'undefined' && WebGL2RenderingContext.prototype) {
      var proto = WebGL2RenderingContext.prototype;
      if (!proto.__protoGuarded) {
        proto.__protoGuarded = true;
        var origTex3D = proto.texImage3D;
        proto.texImage3D = function () {
          var flipY = false, premult = false;
          try {
            flipY = !!this.getParameter(this.UNPACK_FLIP_Y_WEBGL);
            premult = !!this.getParameter(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
            this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          } catch (e) {}
          try {
            return origTex3D.apply(this, arguments);
          } finally {
            try {
              if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);
              if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            } catch (e) {}
          }
        };
        var origSubTex3D = proto.texSubImage3D;
        proto.texSubImage3D = function () {
          var flipY = false, premult = false;
          try {
            flipY = !!this.getParameter(this.UNPACK_FLIP_Y_WEBGL);
            premult = !!this.getParameter(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
            this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          } catch (e) {}
          try {
            return origSubTex3D.apply(this, arguments);
          } finally {
            try {
              if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);
              if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            } catch (e) {}
          }
        };
      }
    }
  } catch (e) {}

  try {
    var origWarn = console.warn;
    console.warn = function () {
      var fullStr = '';
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === 'string') {
          fullStr += ' ' + arg;
        } else if (arg && typeof arg === 'object') {
          try {
            fullStr += ' ' + (arg.message || arg.name || JSON.stringify(arg) || String(arg));
          } catch (e) {
            fullStr += ' ' + String(arg);
          }
        }
      }
      if (
        fullStr.indexOf('com.microsoft.playready') !== -1 ||
        fullStr.indexOf('playready.recommendation') !== -1 ||
        fullStr.indexOf('PlayReady playback on Windows') !== -1 ||
        fullStr.indexOf('setServerCertificate') !== -1 ||
        (fullStr.indexOf('texImage3D') !== -1 && fullStr.indexOf('FLIP_Y') !== -1)
      ) {
        return;
      }
      return origWarn.apply(console, arguments);
    };
  } catch (e) {}

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
    var isReload = (nav && nav.length > 0 && nav[0].type === 'reload') || (performance && performance.navigation && performance.navigation.type === 1);
    if (isReload) {
      sessionStorage.removeItem('portfolio_restore_pending');
      sessionStorage.setItem('portfolio_home_scroll', '0');
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo(0, 0);
    }
  } catch (e) {}

  try {
    var savedTheme = localStorage.getItem('richard-portfolio-theme');
    var theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#10121b');
    }
    document.documentElement.classList.add(theme);
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }
})();
