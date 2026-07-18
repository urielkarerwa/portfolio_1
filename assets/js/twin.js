// Digital twin chat widget. Injects a floating launcher and panel, talks to the
// Netlify Function at /.netlify/functions/twin, and keeps a short rolling history
// so follow-ups have context. Bilingual: chrome follows the page language, and
// the model itself replies in whatever language the visitor writes.
(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/twin";
  var MAX_HISTORY = 10;

  var T = {
    en: {
      launch: "Ask my digital twin",
      title: "Uri's digital twin",
      subtitle: "Ask about my work, background, or projects.",
      greeting: "Hi, I'm Uri's digital twin. Ask me about my projects, my background, or the research I do. I answer from what Uri has written about his work.",
      placeholder: "Ask about my work...",
      send: "Send",
      close: "Close",
      thinking: "Thinking...",
      error: "Connection error. Try again in a moment.",
      chips: ["What are you working on right now?", "What makes your work different?", "Are you open to work?"],
    },
    fr: {
      launch: "Discuter avec mon jumeau",
      title: "Jumeau numérique d'Uri",
      subtitle: "Posez des questions sur mon travail, mon parcours ou mes projets.",
      greeting: "Bonjour, je suis le jumeau numérique d'Uri. Posez-moi des questions sur mes projets, mon parcours ou mes recherches. Je réponds à partir de ce qu'Uri a écrit sur son travail.",
      placeholder: "Posez une question sur mon travail...",
      send: "Envoyer",
      close: "Fermer",
      thinking: "Réflexion...",
      error: "Erreur de connexion. Réessayez dans un instant.",
      chips: ["Sur quoi travaillez-vous en ce moment?", "Qu'est-ce qui distingue votre travail?", "Êtes-vous ouvert aux opportunités?"],
    },
  };

  function lang() {
    return document.documentElement.getAttribute("lang") === "fr" ? "fr" : "en";
  }
  function t(key) {
    var l = lang();
    return (T[l] && T[l][key] != null) ? T[l][key] : T.en[key];
  }

  var history = [];
  var greeted = false;
  var busy = false;
  var els = {};

  function build() {
    var root = document.createElement("div");
    root.className = "twin";
    root.setAttribute("data-open", "false");
    root.innerHTML =
      '<button class="twin-launch" type="button" aria-expanded="false" aria-controls="twin-panel">' +
        '<span class="twin-launch-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.4 1.32 4.55 3.4 6-.17 1.02-.72 2.31-1.62 3.32-.22.24-.06.63.27.6 1.9-.15 3.75-.78 5.02-1.66.93.28 1.92.44 2.93.44 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg>' +
        '</span>' +
        '<span class="twin-launch-label"></span>' +
        '<span class="twin-launch-ping" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="twin-panel" id="twin-panel" role="dialog" aria-modal="false" hidden>' +
        '<div class="twin-head">' +
          '<div class="twin-head-text">' +
            '<span class="twin-head-title"></span>' +
            '<span class="twin-head-sub"></span>' +
          '</div>' +
          '<button class="twin-close" type="button" aria-label="Close">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="twin-log" id="twin-log" aria-live="polite"></div>' +
        '<div class="twin-chips" id="twin-chips"></div>' +
        '<form class="twin-inputrow" id="twin-form">' +
          '<input class="twin-input" id="twin-input" type="text" autocomplete="off" maxlength="2000" />' +
          '<button class="twin-send" id="twin-send" type="submit"></button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(root);

    els.root = root;
    els.launch = root.querySelector(".twin-launch");
    els.launchLabel = root.querySelector(".twin-launch-label");
    els.panel = root.querySelector(".twin-panel");
    els.headTitle = root.querySelector(".twin-head-title");
    els.headSub = root.querySelector(".twin-head-sub");
    els.close = root.querySelector(".twin-close");
    els.log = root.querySelector(".twin-log");
    els.chips = root.querySelector(".twin-chips");
    els.form = root.querySelector("#twin-form");
    els.input = root.querySelector("#twin-input");
    els.send = root.querySelector("#twin-send");

    applyLang();

    els.launch.addEventListener("click", toggle);
    els.close.addEventListener("click", close);
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(els.input.value);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.root.getAttribute("data-open") === "true") close();
    });
    // keep chrome in sync when the visitor flips the site language
    var langBtn = document.getElementById("lang-toggle");
    if (langBtn) langBtn.addEventListener("click", function () { setTimeout(applyLang, 0); });

    // On every page load (first visit or an in-site navigation) the launcher
    // starts as a labelled pill to draw the eye, then collapses to a compact
    // icon after a few seconds or as soon as the visitor starts scrolling.
    startNudge();
    bindScroll();
  }

  var NUDGE_MS = 5200;
  var nudgeTimer = null;

  function startNudge() {
    els.root.setAttribute("data-nudge", "true");
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(endNudge, NUDGE_MS);
  }
  function endNudge() {
    clearTimeout(nudgeTimer);
    if (els.root.getAttribute("data-nudge") === "true") els.root.setAttribute("data-nudge", "false");
  }

  // Fade the resting launcher as the page scrolls: prominent at the top, quieter
  // further down so it never competes with the content. Hover always restores it.
  function bindScroll() {
    var ticking = false;
    function apply() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > 40) endNudge();
      var op = 1 - Math.min(y / 640, 1) * 0.6; // 1.0 at top down to 0.4
      els.root.style.setProperty("--twin-rest-op", op.toFixed(2));
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  }

  function applyLang() {
    els.launchLabel.textContent = t("launch");
    els.launch.setAttribute("aria-label", t("launch"));
    els.headTitle.textContent = t("title");
    els.headSub.textContent = t("subtitle");
    els.input.setAttribute("placeholder", t("placeholder"));
    els.send.textContent = t("send");
    els.close.setAttribute("aria-label", t("close"));
    renderChips();
  }

  function renderChips() {
    // only show starter chips before the first exchange
    els.chips.innerHTML = "";
    if (history.length > 0) { els.chips.hidden = true; return; }
    els.chips.hidden = false;
    var chips = t("chips");
    for (var i = 0; i < chips.length; i++) {
      (function (text) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "twin-chip";
        b.textContent = text;
        b.addEventListener("click", function () { send(text); });
        els.chips.appendChild(b);
      })(chips[i]);
    }
  }

  function toggle() {
    if (els.root.getAttribute("data-open") === "true") close();
    else open();
  }

  function open() {
    endNudge();
    els.root.setAttribute("data-open", "true");
    els.launch.setAttribute("aria-expanded", "true");
    els.panel.hidden = false;
    if (!greeted) {
      greeted = true;
      addMsg("bot", t("greeting"));
    }
    setTimeout(function () { els.input.focus(); }, 60);
  }

  function close() {
    els.root.setAttribute("data-open", "false");
    els.launch.setAttribute("aria-expanded", "false");
    els.panel.hidden = true;
  }

  function addMsg(role, text) {
    var el = document.createElement("div");
    el.className = "twin-msg twin-msg-" + (role === "user" ? "user" : "bot");
    el.textContent = text;
    els.log.appendChild(el);
    els.log.scrollTop = els.log.scrollHeight;
    return el;
  }

  function send(raw) {
    var text = (raw || "").trim();
    if (!text || busy) return;
    busy = true;
    els.input.value = "";
    addMsg("user", text);
    history.push({ role: "user", content: text });
    renderChips();

    var pending = addMsg("bot", t("thinking"));
    pending.classList.add("twin-msg-pending");

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        var reply = (data && data.reply) ? data.reply : (data && data.error) ? data.error : t("error");
        pending.classList.remove("twin-msg-pending");
        pending.textContent = reply;
        els.log.scrollTop = els.log.scrollHeight;
        if (data && data.reply) history.push({ role: "assistant", content: data.reply });
      })
      .catch(function () {
        pending.classList.remove("twin-msg-pending");
        pending.textContent = t("error");
      })
      .then(function () { busy = false; els.input.focus(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
