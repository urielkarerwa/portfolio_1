/* Phase 1 — Filterable case-study engine.
   Single source of truth: data/projects.json. No build step, vanilla JS.
   Only whitelisted fields are ever read, so underscore-prefixed/private
   fields (e.g. _internalReferences) never reach the DOM. */
(function () {
  "use strict";

  var CONTACT_EMAIL = "karerwau@gmail.com";

  // Facet config. `key` is the URL param; `field` is the data field.
  var FACETS = [
    { key: "work", field: "workType", label: "Work type", single: false },
    { key: "industry", field: "industry", label: "Industry", single: false },
    { key: "sector", field: "sector", label: "Sector", single: true },
    { key: "client", field: "client", label: "Client", single: false }
  ];

  var projects = [];
  var selection = {}; // key -> Set of selected values
  FACETS.forEach(function (f) { selection[f.key] = new Set(); });

  var els = {}; // cached DOM refs

  // --- data helpers ---------------------------------------------------------

  function facetValues(p, facet) {
    if (facet.single) return p[facet.field] != null ? [p[facet.field]] : [];
    return Array.isArray(p[facet.field]) ? p[facet.field] : [];
  }

  function uniqueValues(facet) {
    var seen = {};
    projects.forEach(function (p) {
      facetValues(p, facet).forEach(function (v) { seen[v] = true; });
    });
    return Object.keys(seen).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  // Recency key from free-text dates: largest year present; "present" sorts newest.
  function recency(dates) {
    if (typeof dates !== "string") return 0;
    if (/present/i.test(dates)) return 9999;
    var years = dates.match(/\b(19|20)\d{2}\b/g);
    if (!years) return 0;
    return years.reduce(function (m, y) { return Math.max(m, parseInt(y, 10)); }, 0);
  }

  function anyActive() {
    return FACETS.some(function (f) { return selection[f.key].size > 0; });
  }

  function matchesSelection(p) {
    // AND across facets, OR within a facet. Empty facet = no constraint.
    return FACETS.every(function (f) {
      var sel = selection[f.key];
      if (sel.size === 0) return true;
      return facetValues(p, f).some(function (v) { return sel.has(v); });
    });
  }

  function computeShown() {
    if (!anyActive()) {
      // Default view: featured only, by featuredRank ascending.
      return projects
        .filter(function (p) { return p.featured; })
        .sort(function (a, b) { return a.featuredRank - b.featuredRank; });
    }
    // Filtered view: featured first (by rank), then the rest by recency desc.
    return projects.filter(matchesSelection).sort(function (a, b) {
      if (a.featured && b.featured) return a.featuredRank - b.featuredRank;
      if (a.featured) return -1;
      if (b.featured) return 1;
      return recency(b.dates) - recency(a.dates);
    });
  }

  // --- small DOM builders ---------------------------------------------------

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chipRow(label, values, extraClass) {
    if (!values || !values.length) return null;
    var wrap = el("div", "pf-chiprow");
    wrap.appendChild(el("span", "pf-chiprow-label", label));
    var list = el("div", "pf-chiplist");
    values.forEach(function (v) {
      list.appendChild(el("span", "pf-schip" + (extraClass ? " " + extraClass : ""), v));
    });
    wrap.appendChild(list);
    return wrap;
  }

  // --- rendering ------------------------------------------------------------

  function isPrimary(facet) { return facet.key === "work"; }

  function secondaryCount() {
    return FACETS.reduce(function (n, f) {
      return n + (isPrimary(f) ? 0 : selection[f.key].size);
    }, 0);
  }

  function updateMoreBadge() {
    if (!els.moreBadge) return;
    var n = secondaryCount();
    els.moreBadge.textContent = String(n);
    els.moreBadge.hidden = n === 0;
  }

  function renderFilters() {
    els.primary.textContent = "";
    if (els.secondary) els.secondary.textContent = "";
    FACETS.forEach(function (facet) {
      var target = isPrimary(facet) ? els.primary : els.secondary;
      if (!target) return;
      var group = el("div", "pf-facet");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", facet.label);
      // Primary facet is introduced by the visible prompt, so no eyebrow label.
      if (!isPrimary(facet)) group.appendChild(el("span", "pf-facet-label", facet.label));
      var chips = el("div", "pf-chips");
      uniqueValues(facet).forEach(function (value) {
        var pressed = selection[facet.key].has(value);
        var btn = el("button", "pf-chip", value);
        btn.type = "button";
        btn.setAttribute("aria-pressed", pressed ? "true" : "false");
        btn.addEventListener("click", function () {
          var set = selection[facet.key];
          if (set.has(value)) set.delete(value); else set.add(value);
          render();
        });
        chips.appendChild(btn);
      });
      group.appendChild(chips);
      target.appendChild(group);
    });
    updateMoreBadge();
  }

  function renderResultHeader(shown) {
    // Live count.
    els.count.textContent =
      "Showing " + shown.length + " of " + projects.length + " projects";

    // Active filter chips (removable).
    els.active.textContent = "";
    FACETS.forEach(function (facet) {
      selection[facet.key].forEach(function (value) {
        var chip = el("button", "pf-activechip");
        chip.type = "button";
        chip.setAttribute("aria-label", "Remove filter: " + value);
        chip.appendChild(el("span", "pf-activechip-text", value));
        chip.appendChild(el("span", "pf-activechip-x", "×"));
        chip.addEventListener("click", function () {
          selection[facet.key].delete(value);
          render();
        });
        els.active.appendChild(chip);
      });
    });

    els.clear.hidden = !anyActive();
  }

  function renderCard(p) {
    var card = el("article", "pf-card");
    card.id = p.id;

    card.appendChild(el("h3", "pf-card-title", p.title));

    var meta = el("p", "pf-card-meta");
    meta.appendChild(el("span", "pf-card-job", p.job));
    if (p.dates) {
      meta.appendChild(el("span", "pf-card-sep", "·"));
      meta.appendChild(el("span", "pf-card-dates", p.dates));
    }
    card.appendChild(meta);

    // Work type as headline tags.
    if (Array.isArray(p.workType) && p.workType.length) {
      var wt = el("div", "pf-worktags");
      p.workType.forEach(function (v) { wt.appendChild(el("span", "pf-tag", v)); });
      card.appendChild(wt);
    }

    // STAR narrative.
    if (p.star) {
      var star = el("div", "pf-star");
      [
        ["Situation", p.star.situation],
        ["Task", p.star.task],
        ["Action", p.star.action],
        ["Result", p.star.result]
      ].forEach(function (pair) {
        if (!pair[1]) return;
        var block = el("div", "pf-star-block");
        block.appendChild(el("span", "pf-star-lbl", pair[0]));
        block.appendChild(el("p", "pf-star-text", pair[1]));
        star.appendChild(block);
      });
      card.appendChild(star);
    }

    // Methods + tools as secondary display chips (kept separate from facets).
    var methods = chipRow("Methods", p.methods);
    if (methods) card.appendChild(methods);
    var tools = chipRow("Tools", p.tools);
    if (tools) card.appendChild(tools);

    // Research skills — optional, collapsed secondary detail.
    if (Array.isArray(p.researchSkills) && p.researchSkills.length) {
      var details = el("details", "pf-details");
      var summary = el("summary", "pf-details-summary", "Research skills");
      details.appendChild(summary);
      var list = el("div", "pf-chiplist");
      p.researchSkills.forEach(function (v) {
        list.appendChild(el("span", "pf-schip", v));
      });
      details.appendChild(list);
      card.appendChild(details);
    }

    // Links as buttons.
    if (Array.isArray(p.links) && p.links.length) {
      var links = el("div", "pf-links");
      p.links.forEach(function (link) {
        if (!link || !link.url) return;
        var a = el("a", "pf-btn", link.label || link.url);
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener";
        links.appendChild(a);
      });
      if (links.childNodes.length) card.appendChild(links);
    }

    return card;
  }

  function renderEmptyState() {
    var box = el("div", "pf-empty");
    box.appendChild(el("p", "pf-empty-title", "Nothing matches that exact combination."));
    box.appendChild(el("p", "pf-empty-text",
      "Try removing a filter, or reach out and I'll point you to the right work."));
    var actions = el("div", "pf-empty-actions");
    var clear = el("button", "pf-ctl", "Clear all filters");
    clear.type = "button";
    clear.addEventListener("click", clearAll);
    actions.appendChild(clear);
    var contact = el("a", "pf-btn", "Contact me directly");
    contact.href = "mailto:" + CONTACT_EMAIL;
    actions.appendChild(contact);
    box.appendChild(actions);
    return box;
  }

  function renderResults(shown) {
    els.results.textContent = "";
    if (anyActive() && shown.length === 0) {
      els.results.appendChild(renderEmptyState());
      return;
    }
    shown.forEach(function (p) { els.results.appendChild(renderCard(p)); });
  }

  // --- URL state ------------------------------------------------------------

  function syncURL() {
    // Build query manually so spaces encode as %20 and commas stay literal
    // separators, matching the brief's exact parameter format.
    var parts = [];
    FACETS.forEach(function (f) {
      var vals = Array.from(selection[f.key]);
      if (vals.length) {
        parts.push(f.key + "=" + vals.map(encodeURIComponent).join(","));
      }
    });
    var qs = parts.join("&");
    var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    history.replaceState(null, "", url);
  }

  function readURL() {
    var params = new URLSearchParams(location.search);
    FACETS.forEach(function (facet) {
      var raw = params.get(facet.key);
      if (!raw) return;
      var valid = {};
      uniqueValues(facet).forEach(function (v) { valid[v] = true; });
      raw.split(",").forEach(function (v) {
        if (valid[v]) selection[facet.key].add(v);
      });
    });
  }

  // --- controls -------------------------------------------------------------

  function clearAll() {
    FACETS.forEach(function (f) { selection[f.key].clear(); });
    render();
  }

  function copyLink() {
    var url = location.href;
    var done = function () {
      els.copy.classList.add("is-copied");
      els.copy.textContent = "Copied ✓";
      setTimeout(function () {
        els.copy.classList.remove("is-copied");
        els.copy.textContent = "Copy link";
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        var t = document.createElement("textarea");
        t.value = url;
        t.setAttribute("readonly", "");
        t.style.position = "absolute";
        t.style.left = "-9999px";
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        done();
      } catch (e) {
        els.copy.textContent = "Press Ctrl/Cmd+C";
      }
    }
  }

  // --- main render ----------------------------------------------------------

  function render() {
    var shown = computeShown();
    renderFilters();
    renderResultHeader(shown);
    renderResults(shown);
    syncURL();
  }

  // --- init -----------------------------------------------------------------

  function init() {
    els.primary = document.getElementById("pf-primary");
    els.secondary = document.getElementById("pf-secondary");
    els.moreToggle = document.getElementById("pf-more-toggle");
    els.moreBadge = document.getElementById("pf-more-badge");
    els.count = document.getElementById("pf-count");
    els.active = document.getElementById("pf-active");
    els.clear = document.getElementById("pf-clear");
    els.copy = document.getElementById("pf-copy");
    els.results = document.getElementById("pf-results");
    els.sectionCount = document.getElementById("pf-section-count");
    if (!els.primary || !els.results) return;

    els.clear.addEventListener("click", clearAll);
    els.copy.addEventListener("click", copyLink);

    // "More filters" disclosure: toggle the secondary panel (mouse + keyboard).
    if (els.moreToggle && els.secondary) {
      els.moreToggle.addEventListener("click", function () {
        var open = els.moreToggle.getAttribute("aria-expanded") === "true";
        els.moreToggle.setAttribute("aria-expanded", open ? "false" : "true");
        els.secondary.hidden = open;
      });
    }

    fetch("data/projects.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        projects = Array.isArray(data) ? data : [];
        if (els.sectionCount) {
          els.sectionCount.textContent = projects.length + " projects";
        }
        readURL();
        render();
      })
      .catch(function (err) {
        els.results.textContent = "";
        var msg = el("p", "pf-empty-text",
          "Couldn't load projects. If you're opening the file directly, run a local server (e.g. npx serve) so fetch can read data/projects.json.");
        els.results.appendChild(msg);
        if (window.console) console.error("portfolio.js:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
