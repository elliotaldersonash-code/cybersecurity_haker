(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var screenEl = document.querySelector(".screen");

  /* 1) مطر الأكواد في الخلفية */
  function startMatrix() {
    var canvas = document.getElementById("matrix");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var chars = "01ABCDEF<>/{}[]$#%&*+=".split("");
    var size = 16;
    var cols = 0;
    var drops = [];
    var w = 0;
    var h = 0;
    var lastW = 0;
    var timer = null;

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / size);
      drops = [];
      for (var i = 0; i < cols; i++) {
        drops.push(Math.random() * (h / size));
      }
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      lastW = w;
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = size + "px 'Courier New', monospace";
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.975 ? "#ff2a3d" : "#00ff6a";
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    function start() {
      if (!timer) timer = setInterval(draw, 60);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }

    resize();

    // نعيد الضبط فقط عند تغيّر العرض (لتفادي الوميض عند إخفاء شريط المتصفح في الجوال)
    window.addEventListener("resize", function () {
      if (window.innerWidth !== lastW) resize();
    });

    if (reduce) {
      for (var k = 0; k < 40; k++) draw();
      return;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    start();
  }

  /* 2) كتابة الطرفية ثم إظهار زر الدخول */
  function startTerminal() {
    var term = document.getElementById("terminal-body");
    var btn = document.querySelector(".enter");

    if (!term) {
      if (btn) btn.classList.add("ready");
      return;
    }

    var lines = Array.prototype.slice.call(term.querySelectorAll(".t-line"));
    var texts = lines.map(function (l) {
      return l.textContent;
    });

    if (reduce || lines.length === 0) {
      if (btn) btn.classList.add("ready");
      return;
    }

    lines.forEach(function (l) {
      l.textContent = "";
    });

    var li = 0;
    var ci = 0;

    function tick() {
      if (li >= lines.length) {
        if (btn) btn.classList.add("ready");
        return;
      }
      if (li > 0) lines[li - 1].classList.remove("caret");
      var line = lines[li];
      line.classList.add("caret");
      if (ci < texts[li].length) {
        line.textContent = texts[li].slice(0, ci + 1);
        ci++;
        setTimeout(tick, 28);
      } else {
        li++;
        ci = 0;
        setTimeout(tick, 260);
      }
    }
    tick();
  }

  /* 3) انتقال سلس بين الصفحات (للروابط التي فيها data-go) */
  function setupTransitions() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[data-go]") : null;
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var url = a.getAttribute("href");
      if (!url) return;
      e.preventDefault();
      if (reduce || !screenEl) {
        window.location.href = url;
        return;
      }
      screenEl.classList.add("leaving");
      setTimeout(function () {
        window.location.href = url;
      }, 450);
    });

    // عند الرجوع للصفحة بزر "رجوع" نزيل حالة الخروج
    window.addEventListener("pageshow", function () {
      if (screenEl) screenEl.classList.remove("leaving");
    });
  }

  startMatrix();
  startTerminal();
  setupTransitions();
})();
