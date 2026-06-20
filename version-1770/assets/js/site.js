(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var genre = document.querySelector("[data-genre-filter]");
    var year = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length || (!input && !genre && !year)) {
      return;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var g = genre ? genre.value : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var okQuery = !q || haystack.indexOf(q) !== -1;
        var okGenre = !g || (card.getAttribute("data-genre") || "") === g;
        var okYear = !y || (card.getAttribute("data-year") || "") === y;
        card.hidden = !(okQuery && okGenre && okYear);
      });
    }

    [input, genre, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"card-cover\" href=\"" + escapeAttr(item.url) + "\" aria-label=\"观看 " + escapeAttr(item.title) + "\">",
      "<img src=\"" + escapeAttr(item.cover) + "\" alt=\"" + escapeAttr(item.title) + "\" loading=\"lazy\">",
      "<span class=\"card-play\">▶</span>",
      "<span class=\"card-badge\">" + escapeHtml(item.category) + "</span>",
      "<span class=\"card-duration\">" + escapeHtml(item.duration) + "</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<h3><a href=\"" + escapeAttr(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(String(item.views)) + "次观看</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(query);

    function render(q) {
      var text = String(q || "").trim().toLowerCase();
      if (!text) {
        results.innerHTML = "<div class=\"empty-state\">输入关键词即可搜索影片名称、题材、年份、地区与标签。</div>";
        return;
      }
      var words = text.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.genre,
          item.region,
          item.category,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 80);
      if (!matched.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片，可以尝试更短的关键词。</div>";
        return;
      }
      results.innerHTML = matched.map(cardTemplate).join("");
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector(".movie-player");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !source) {
      return;
    }
    var hls = null;
    var initialized = false;

    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
    var jump = document.querySelector("[data-scroll-player]");
    if (jump) {
      jump.addEventListener("click", function (event) {
        event.preventDefault();
        video.scrollIntoView({ behavior: "smooth", block: "center" });
        play();
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
