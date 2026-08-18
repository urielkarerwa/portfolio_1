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

  // Editorial grouping of the Work type (workType) values into collapsible
  // categories. Sub-values still filter the same single workType facet;
  // categories are disclosure only. Values absent from the data are skipped.
  var WORK_GROUPS = [
    { label: "AI", values: ["AI Implementation", "AI Automation", "Agentic Delivery", "Prompt Engineering & RAG"] },
    { label: "UX", values: ["UX Research", "UX Design", "Service Design", "Design Systems", "Content Strategy"] },
    { label: "Project Management", values: ["Research Operations", "Project & Program Management", "Business Development"] },
    { label: "Process", values: ["Data Analysis", "Behavioral & Physiological Research", "Usability Evaluation", "Information Architecture", "Inclusive Design", "SEO & Discoverability"] }
  ];

  var projects = [];
  var selection = {}; // key -> Set of selected values
  FACETS.forEach(function (f) { selection[f.key] = new Set(); });

  // Quick-view mode when no facet filters are active: "current" (ongoing work,
  // the default) or "all" (every project). Facet filters override both.
  var viewMode = "current";
  function isCurrent(p) { return /present/i.test(p.dates || ""); }

  var openCats = {};      // category label -> open (persists across re-renders)
  var focusTarget = null; // {facet,value} chip to refocus after a re-render

  var els = {}; // cached DOM refs

  // --- i18n: card content and tag chips render in the page language ----------
  // Filter keys/URL params stay English; this is display-only. FR data lives on
  // each project's `fr` object (projects.json) and in window.WORK_I18N.
  var I18N = window.WORK_I18N || { labels: {}, groups: {}, facets: {}, ui: {} };
  function isFR() { return document.documentElement.getAttribute("lang") === "fr"; }
  function TR(v) { return isFR() && I18N.labels[v] ? I18N.labels[v] : v; }           // tag value
  function GT(v) { return isFR() && I18N.groups[v] ? I18N.groups[v] : v; }           // category label
  function FT(v) { return isFR() && I18N.facets[v] ? I18N.facets[v] : v; }           // facet label
  function UI(k, en) { return isFR() && I18N.ui[k] ? I18N.ui[k] : en; }             // ui string, English fallback
  function projStar(p) { return (isFR() && p.fr && p.fr.star) ? p.fr.star : p.star; }
  function projField(p, f) { return (isFR() && p.fr && p.fr[f]) ? p.fr[f] : p[f]; }

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

  // Featured first (by rank), then the rest by recency descending.
  function rankSort(a, b) {
    if (a.featured && b.featured) return a.featuredRank - b.featuredRank;
    if (a.featured) return -1;
    if (b.featured) return 1;
    return recency(b.dates) - recency(a.dates);
  }

  function computeShown() {
    if (anyActive()) {
      return projects.filter(matchesSelection).sort(rankSort);
    }
    // No facet filters: honour the quick-view mode.
    var base = viewMode === "all" ? projects.slice() : projects.filter(isCurrent);
    return base.sort(rankSort);
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
      list.appendChild(el("span", "pf-schip" + (extraClass ? " " + extraClass : ""), TR(v)));
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

  function chevron() {
    var span = el("span", "pf-chevron");
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
    return span;
  }

  // A single toggle chip. Used by both the primary categories and secondary facets.
  function makeChip(facetKey, value) {
    var btn = el("button", "pf-chip", TR(value));
    btn.type = "button";
    btn.setAttribute("aria-pressed", selection[facetKey].has(value) ? "true" : "false");
    btn.setAttribute("data-facet", facetKey);
    btn.setAttribute("data-value", value);
    btn.addEventListener("click", function () {
      var set = selection[facetKey];
      if (set.has(value)) set.delete(value); else set.add(value);
      focusTarget = { facet: facetKey, value: value };
      render();
    });
    return btn;
  }

  // Primary facet (Work type), grouped into collapsible categories.
  function renderPrimary() {
    els.primary.textContent = "";
    var workFacet = FACETS[0]; // work
    var present = {};
    uniqueValues(workFacet).forEach(function (v) { present[v] = true; });

    WORK_GROUPS.forEach(function (group) {
      var vals = group.values.filter(function (v) { return present[v]; });
      if (!vals.length) return;

      var open = !!openCats[group.label];
      var selInCat = vals.filter(function (v) { return selection.work.has(v); }).length;
      var panelId = "pf-cat-" + group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      var cat = el("div", "pf-cat");
      var toggle = el("button", "pf-cat-toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-controls", panelId);
      toggle.appendChild(el("span", "pf-cat-label", GT(group.label)));
      var badge = el("span", "pf-badge pf-cat-badge", String(selInCat));
      badge.hidden = selInCat === 0;
      toggle.appendChild(badge);
      toggle.appendChild(chevron());

      var panel = el("div", "pf-cat-panel");
      panel.id = panelId;
      panel.hidden = !open;
      var chips = el("div", "pf-chips");
      vals.forEach(function (value) { chips.appendChild(makeChip("work", value)); });
      panel.appendChild(chips);

      toggle.addEventListener("click", function () {
        var nowOpen = toggle.getAttribute("aria-expanded") === "true";
        openCats[group.label] = !nowOpen;
        toggle.setAttribute("aria-expanded", nowOpen ? "false" : "true");
        panel.hidden = nowOpen;
      });

      cat.appendChild(toggle);
      cat.appendChild(panel);
      els.primary.appendChild(cat);
    });
  }

  // Secondary facets (Industry, Sector, Client) inside the "More filters" panel.
  function renderSecondary() {
    if (!els.secondary) return;
    els.secondary.textContent = "";
    FACETS.forEach(function (facet) {
      if (isPrimary(facet)) return;
      var group = el("div", "pf-facet");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", FT(facet.label));
      group.appendChild(el("span", "pf-facet-label", FT(facet.label)));
      var chips = el("div", "pf-chips");
      uniqueValues(facet).forEach(function (value) { chips.appendChild(makeChip(facet.key, value)); });
      group.appendChild(chips);
      els.secondary.appendChild(group);
    });
  }

  function renderFilters() {
    renderPrimary();
    renderSecondary();
    updateMoreBadge();
    // Keep keyboard focus on a chip after its re-render.
    if (focusTarget) {
      var sel = '[data-facet="' + focusTarget.facet + '"][data-value="' + focusTarget.value + '"]';
      var node = document.querySelector(sel);
      if (node) node.focus();
      focusTarget = null;
    }
  }

  function renderResultHeader(shown) {
    // Live count.
    els.count.textContent = isFR()
      ? UI("countTemplate", "").replace("{n}", shown.length).replace("{total}", projects.length)
      : "Showing " + shown.length + " of " + projects.length + " projects";

    // Active filter chips (removable).
    els.active.textContent = "";
    FACETS.forEach(function (facet) {
      selection[facet.key].forEach(function (value) {
        var chip = el("button", "pf-activechip");
        chip.type = "button";
        chip.setAttribute("aria-label", UI("removeFilter", "Remove filter: ") + TR(value));
        chip.appendChild(el("span", "pf-activechip-text", TR(value)));
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

    card.appendChild(el("h3", "pf-card-title", projField(p, "title")));

    var meta = el("p", "pf-card-meta");
    meta.appendChild(el("span", "pf-card-job", projField(p, "job")));
    if (p.dates) {
      meta.appendChild(el("span", "pf-card-sep", "·"));
      meta.appendChild(el("span", "pf-card-dates", projField(p, "dates")));
    }
    card.appendChild(meta);

    // Work type as headline tags.
    if (Array.isArray(p.workType) && p.workType.length) {
      var wt = el("div", "pf-worktags");
      p.workType.forEach(function (v) { wt.appendChild(el("span", "pf-tag", TR(v))); });
      card.appendChild(wt);
    }

    // STAR narrative (in the page language).
    var st = projStar(p);
    if (st) {
      var star = el("div", "pf-star");
      [
        [UI("situation", "Situation"), st.situation],
        [UI("task", "Task"), st.task],
        [UI("action", "Action"), st.action],
        [UI("result", "Result"), st.result]
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
    var methods = chipRow(UI("methods", "Methods"), p.methods);
    if (methods) card.appendChild(methods);
    var tools = chipRow(UI("tools", "Tools"), p.tools);
    if (tools) card.appendChild(tools);

    // Research skills — optional, collapsed secondary detail.
    if (Array.isArray(p.researchSkills) && p.researchSkills.length) {
      var details = el("details", "pf-details");
      var summary = el("summary", "pf-details-summary", UI("researchSkills", "Research skills"));
      details.appendChild(summary);
      var list = el("div", "pf-chiplist");
      p.researchSkills.forEach(function (v) {
        list.appendChild(el("span", "pf-schip", TR(v)));
      });
      details.appendChild(list);
      card.appendChild(details);
    }

    // Optional figure (e.g. a tall portrait flow diagram). Starts as a dashed
    // placeholder and reveals the image only once it actually loads.
    if (p.image && p.image.src) {
      var fig = el("figure", "pf-shot pending" + (p.image.portrait ? " pf-shot-portrait" : ""));
      var ph = el("span", "pf-shot-ph");
      ph.appendChild(el("span", "pl", "IMAGE"));
      ph.appendChild(el("span", "pn", p.image.src));
      fig.appendChild(ph);
      var pimg = document.createElement("img");
      pimg.alt = (isFR() && p.image.altFr) ? p.image.altFr : (p.image.alt || "");
      pimg.onload = function () { if (pimg.naturalWidth > 0) fig.classList.remove("pending"); };
      pimg.src = p.image.src;
      fig.appendChild(pimg);
      if (p.image.caption) {
        fig.appendChild(el("figcaption", "pf-shot-cap",
          (isFR() && p.image.captionFr) ? p.image.captionFr : p.image.caption));
      }
      card.appendChild(fig);
    }

    // Embedded video walkthrough (responsive 16:9 iframe).
    if (p.video) {
      var vwrap = el("div", "pf-video");
      var iframe = document.createElement("iframe");
      iframe.src = p.video;
      iframe.title = projField(p, "title");
      iframe.loading = "lazy";
      iframe.setAttribute("allow", "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      vwrap.appendChild(iframe);
      card.appendChild(vwrap);
    }

    // Links as buttons.
    if (Array.isArray(p.links) && p.links.length) {
      var links = el("div", "pf-links");
      p.links.forEach(function (link) {
        if (!link || !link.url) return;
        var label = (isFR() && link.labelFr) ? link.labelFr : (link.label || link.url);
        var a = el("a", "pf-btn", label);
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
    box.appendChild(el("p", "pf-empty-title", UI("emptyTitle", "Nothing matches that exact combination.")));
    box.appendChild(el("p", "pf-empty-text",
      UI("emptyText", "Try removing a filter, or reach out and I'll point you to the right work.")));
    var actions = el("div", "pf-empty-actions");
    var clear = el("button", "pf-ctl", UI("emptyClear", "Clear all filters"));
    clear.type = "button";
    clear.addEventListener("click", clearAll);
    actions.appendChild(clear);
    var contact = el("a", "pf-btn", UI("emptyContact", "Contact me directly"));
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
    // Persist the quick-view mode only when it differs from the default and no
    // facet filters are active (filters are the more specific state).
    if (!anyActive() && viewMode === "all") {
      parts.push("view=all");
    }
    var qs = parts.join("&");
    var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    history.replaceState(null, "", url);
  }

  function readURL() {
    var params = new URLSearchParams(location.search);
    if (params.get("view") === "all") viewMode = "all";
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

  // Quick-view buttons clear any facet filters, then set the view mode.
  function setView(mode) {
    FACETS.forEach(function (f) { selection[f.key].clear(); });
    viewMode = mode;
    render();
  }

  function updateViewButtons() {
    var custom = anyActive();
    if (els.viewCurrent) {
      els.viewCurrent.setAttribute("aria-pressed", (!custom && viewMode === "current") ? "true" : "false");
    }
    if (els.viewAll) {
      els.viewAll.setAttribute("aria-pressed", (!custom && viewMode === "all") ? "true" : "false");
    }
  }

  function copyLink() {
    var url = location.href;
    var done = function () {
      els.copy.classList.add("is-copied");
      els.copy.textContent = UI("copied", "Copied ✓");
      setTimeout(function () {
        els.copy.classList.remove("is-copied");
        els.copy.textContent = UI("copyLink", "Copy link");
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
        els.copy.textContent = UI("copyManual", "Press Ctrl/Cmd+C");
      }
    }
  }

  // --- main render ----------------------------------------------------------

  // Static chrome the engine owns (not data-t): view buttons, more-filters
  // label, clear/copy, section count, prompt. Set per language on each render.
  function syncChrome() {
    if (els.sectionCount) els.sectionCount.textContent = projects.length + " " + UI("projectsWord", "projects");
    if (els.viewCurrent) els.viewCurrent.textContent = UI("viewCurrent", "Current projects");
    if (els.viewAll) els.viewAll.textContent = UI("viewAll", "Show all");
    if (els.viewReset) els.viewReset.textContent = UI("viewReset", "Reset");
    if (els.clear) els.clear.textContent = UI("clearAll", "Clear all");
    if (!els.copy.classList.contains("is-copied")) els.copy.textContent = UI("copyLink", "Copy link");
    if (els.moreLabel) els.moreLabel.textContent = UI("moreFilters", "More filters");
    if (els.prompt) els.prompt.textContent = UI("prompt", "What kind of work do you want to see?");
  }

  function render() {
    var shown = computeShown();
    renderFilters();
    renderResultHeader(shown);
    updateViewButtons();
    syncChrome();
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
    els.viewCurrent = document.getElementById("pf-view-current");
    els.viewAll = document.getElementById("pf-view-all");
    els.viewReset = document.getElementById("pf-view-reset");
    els.results = document.getElementById("pf-results");
    els.sectionCount = document.getElementById("pf-section-count");
    els.moreLabel = document.querySelector(".pf-more-label");
    els.prompt = document.querySelector(".pf-prompt");
    if (!els.primary || !els.results) return;

    els.clear.addEventListener("click", clearAll);
    els.copy.addEventListener("click", copyLink);
    if (els.viewCurrent) els.viewCurrent.addEventListener("click", function () { setView("current"); });
    if (els.viewAll) els.viewAll.addEventListener("click", function () { setView("all"); });
    if (els.viewReset) els.viewReset.addEventListener("click", function () { setView("current"); });

    // Re-render cards and chrome in the new language when the FR/EN toggle flips.
    var langBtn = document.getElementById("lang-toggle");
    if (langBtn) langBtn.addEventListener("click", function () {
      setTimeout(function () { if (projects.length) render(); }, 0);
    });

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
