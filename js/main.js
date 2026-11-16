/* Portfolio behavior. Plain JavaScript, no dependencies, no network requests except data/projects.json. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- theme toggle ---------- */
  var toggle = document.getElementById("theme-toggle");
  var metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
  var metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');
  function applyTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
    if (toggle) {
      toggle.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    var color = t === "dark" ? "#15130f" : "#faf9f6";
    if (metaLight) { metaLight.setAttribute("content", color); metaLight.removeAttribute("media"); }
    if (metaDark && metaDark !== metaLight) { metaDark.remove(); metaDark = null; }
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (saved !== "light" && saved !== "dark") applyTheme(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", follow);
    else if (mq.addListener) mq.addListener(follow);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");
  if (menuBtn && links) {
    var setMenu = function (open) {
      menuBtn.setAttribute("aria-expanded", String(open));
      links.classList.toggle("open", open);
    };
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- helpers ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ic"); svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + id);
    svg.appendChild(use);
    return svg;
  }
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function monthYear(iso) { var d = iso.split("-"); return MONTHS[+d[1] - 1] + " " + d[0]; }
  function shortMonthYear(iso) { var d = iso.split("-"); return MONTHS[+d[1] - 1].slice(0, 3) + " " + d[0]; }
  function setText(sel, text) { document.querySelectorAll(sel).forEach(function (n) { n.textContent = text; }); }

  var ROOT = document.body.getAttribute("data-root") || ".";
  /* [field, label, icon, where]: where "top" = field on the project, "links" = inside project.links */
  var LINK_DEFS = [
    ["demo", "Live demo", "globe", "links"], ["videoUrl", "Video", "play", "top"], ["repo", "Code", "github", "links"],
    ["space", "Space", "hf", "links"], ["listing", "Listing", "glama", "links"],
    ["submissionUrl", "Submission", "doc", "top"], ["eventUrl", "Event page", "link", "top"]
  ];
  function linkFor(p, d) { return d[3] === "top" ? p[d[0]] : (p.links && p.links[d[0]]); }

  /* ---------- static stats from the page ---------- */
  setText('[data-stat="flagship"]', String(document.querySelectorAll("[data-flagship]").length));
  setText('[data-stat="research"]', String(document.querySelectorAll("[data-research]").length));

  var grid = document.getElementById("project-grid");
  var hkList = document.getElementById("hk-list");
  if (!grid && !hkList) return;

  function failMsg(target, tag) {
    target.replaceChildren(el(tag, { class: "grid-fallback" }, [
      "The project list could not load. Browse ", el("a", { href: "https://github.com/mso-docs?tab=repositories", text: "all repositories on GitHub" }), "."
    ]));
  }
  fetch(ROOT + "/data/projects.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      var all = (data.projects || []).filter(function (p) { return p.verified; })
        .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      shared(all, data);
      if (grid) mainPage(data, all);
      if (hkList) hackathonsPage(all);
    })
    .catch(function () { if (grid) failMsg(grid, "li"); if (hkList) failMsg(hkList, "div"); });

  function shared(all, data) {
    document.querySelectorAll("[data-playlist]").forEach(function (a) {
      if (data.playlistUrl) { a.setAttribute("href", data.playlistUrl); a.hidden = false; }
    });
    var total = all.length;
    var events = {};
    all.forEach(function (p) { events[p.event] = true; });
    var oldest = all.reduce(function (m, p) { return !m || p.date < m ? p.date : m; }, null);
    var withSub = all.filter(function (p) { return p.submissionUrl; }).length;
    setText('[data-stat="hackathons"]', String(total));
    setText("#hack-total, #timeline-total, #hk-total", String(total));
    setText("#hack-events, #hk-events", String(Object.keys(events).length));
    setText("#hk-submissions", String(withSub));
    if (oldest) {
      setText('[data-stat="since"]', shortMonthYear(oldest));
      setText("#hack-since, #hk-since", monthYear(oldest));
    }
    var copyBtn = document.getElementById("copy-timeline");
    if (copyBtn && navigator.clipboard) {
      copyBtn.hidden = false;
      copyBtn.addEventListener("click", function () {
        var url = ROOT === "." ? new URL("hackathons/", location.href).href : location.origin + location.pathname;
        navigator.clipboard.writeText(url).then(function () {
          var label = copyBtn.querySelector("span");
          var old = label.textContent;
          label.textContent = "Link copied";
          setTimeout(function () { label.textContent = old; }, 1800);
        });
      });
    }
  }

  /* ---------- main page: filterable grid and compact timeline ---------- */
  function mainPage(data, all) {
    var total = all.length;
    var filters = document.getElementById("filters");
    var statusEl = document.getElementById("filter-status");
    var order = data.categoriesOrder || [];
    var counts = {};
    all.forEach(function (p) { p.categories.forEach(function (c) { counts[c] = (counts[c] || 0) + 1; }); });
    var cats = ["All"].concat(order.filter(function (c) { return counts[c]; }));
    var current = "All";
    cats.forEach(function (c) {
      var n = c === "All" ? total : counts[c];
      var b = el("button", { type: "button", class: "chip", "aria-pressed": String(c === "All"), "data-cat": c }, [c, " ", el("small", { text: String(n) })]);
      b.addEventListener("click", function () { current = c; render(); });
      filters.appendChild(b);
    });

    function card(p) {
      var imgBox = el("div", { class: "proj-img" });
      if (p.image) {
        imgBox.appendChild(el("img", { src: ROOT + "/" + p.image, alt: "Screenshot of " + p.name + ".", loading: "lazy", width: "640", height: "400" }));
      } else {
        imgBox.appendChild(el("div", { class: "art", "aria-hidden": "true" }, [el("span", { text: p.name.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() })]));
      }
      var ls = el("div", { class: "proj-links" });
      LINK_DEFS.forEach(function (d) {
        var u = linkFor(p, d);
        if (u) ls.appendChild(el("a", { href: u, rel: "noopener", "aria-label": d[1] + ": " + p.name }, [icon(d[2]), d[1]]));
      });
      var cl = el("div", { class: "cats" }, p.categories.map(function (c) { return el("span", { class: "tag", text: c }); }));
      return el("li", {}, [
        el("article", { class: "card proj" + (p.flagship ? " is-flagship" : ""), "data-id": p.id }, [
          imgBox,
          el("div", { class: "proj-body" }, [
            el("div", { class: "proj-meta" }, [el("span", { class: "proj-date", text: p.dateLabel })]),
            el("h3", { text: p.name }),
            el("p", { class: "proj-event", text: p.event }),
            el("p", { class: "sum", text: p.summary }),
            cl, ls
          ])
        ])
      ]);
    }
    function render() {
      var shown = all.filter(function (p) { return current === "All" || p.categories.indexOf(current) !== -1; });
      grid.replaceChildren.apply(grid, shown.map(card));
      filters.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === current)); });
      statusEl.textContent = "Showing " + shown.length + " of " + total + " hackathon projects" + (current === "All" ? "." : " in " + current + ".");
    }
    render();
    timeline(all, document.getElementById("timeline-body"));
  }

  /* compact year-grouped timeline used on the main page */
  function timeline(all, body) {
    var byYear = {};
    all.forEach(function (p) { var y = p.date.slice(0, 4); (byYear[y] = byYear[y] || []).push(p); });
    Object.keys(byYear).sort().reverse().forEach(function (y) {
      body.appendChild(el("h4", { class: "tl-year", text: y + " \u00b7 " + byYear[y].length + (byYear[y].length === 1 ? " project" : " projects") }));
      var ol = el("ol", { class: "tl" });
      byYear[y].forEach(function (p) {
        var evName = p.eventUrl ? el("a", { class: "ev-link", href: p.eventUrl, rel: "noopener", text: p.event }) : el("strong", { text: p.event });
        ol.appendChild(el("li", {}, [
          el("span", { class: "when", text: p.dateLabel }),
          el("span", { class: "what" }, [
            evName,
            el("a", { class: "proj-link", href: (p.links && (p.links.repo || p.links.demo)) || p.submissionUrl || "#", rel: "noopener", text: p.name }),
            el("span", { class: "kind", text: p.eventType || "" })
          ])
        ]));
      });
      body.appendChild(ol);
    });
  }

  /* ---------- /hackathons/: dated list with every link ---------- */
  function hackathonsPage(all) {
    var frag = document.createDocumentFragment();
    var byYear = {};
    all.forEach(function (p) { var y = p.date.slice(0, 4); (byYear[y] = byYear[y] || []).push(p); });
    Object.keys(byYear).sort().reverse().forEach(function (y) {
      frag.appendChild(el("h2", { class: "hk-year", text: y + " \u00b7 " + byYear[y].length + (byYear[y].length === 1 ? " project" : " projects") }));
      var ol = el("ol", { class: "hk" });
      byYear[y].forEach(function (p) {
        var evName = p.eventUrl
          ? el("a", { class: "hk-event", href: p.eventUrl, rel: "noopener", text: p.event })
          : el("span", { class: "hk-event", text: p.event });
        var projLink = (p.links && (p.links.demo || p.links.repo)) || p.submissionUrl;
        var projName = projLink ? el("a", { href: projLink, rel: "noopener", text: p.name }) : document.createTextNode(p.name);
        var ls = el("div", { class: "proj-links" });
        [["submissionUrl", "Submission", "doc", "top"], ["repo", "Code", "github", "links"], ["space", "Space", "hf", "links"],
         ["demo", "Live demo", "globe", "links"], ["videoUrl", "Video", "play", "top"]].forEach(function (d) {
          var u = linkFor(p, d);
          if (u) ls.appendChild(el("a", { class: "pill", href: u, rel: "noopener", "aria-label": d[1] + ": " + p.name }, [icon(d[2]), d[1]]));
        });
        ol.appendChild(el("li", { class: "hk-item", id: p.id }, [
          el("div", { class: "hk-when" }, [el("span", { class: "hk-date", text: p.dateLabel }), el("span", { class: "kind", text: p.eventType || "" })]),
          el("div", { class: "hk-main" }, [
            evName,
            el("h3", { class: "hk-proj" }, [projName]),
            el("p", { class: "sum", text: p.summary }),
            ls
          ])
        ]));
      });
      frag.appendChild(ol);
    });
    hkList.replaceChildren(frag);
  }
})();
