(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-slide') || 0);
        show(target);
        restart();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initLocalFilter() {
    selectAll('[data-local-filter], [data-search-page]').forEach(function (section) {
      var input = section.querySelector('[data-filter-input]');
      var cards = selectAll('.movie-card', section);
      var yearButtons = selectAll('[data-filter-year]', section);
      var activeYear = 'all';

      function apply() {
        var keyword = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var year = card.getAttribute('data-year') || '';
          var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
          var yearMatched = activeYear === 'all' || year === activeYear;
          card.classList.toggle('is-hidden-card', !(keywordMatched && yearMatched));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeYear = button.getAttribute('data-filter-year') || 'all';
          yearButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      var searchInput = document.querySelector('[data-search-input]');
      if (query && input) {
        input.value = query;
      }
      if (query && searchInput) {
        searchInput.value = query;
      }
      apply();
    });
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var configNode = document.getElementById('player-config');
    if (!video || !configNode) {
      return;
    }
    var overlay = document.querySelector('.player-overlay');
    var message = document.querySelector('.player-message');
    var config = {};

    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var stream = config.stream;
    var hls = null;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function attach() {
      if (!stream) {
        showMessage();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            showMessage();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        showMessage();
      }
    }

    function play() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    attach();

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', showMessage);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initLocalFilter();
    initPlayer();
  });
})();
