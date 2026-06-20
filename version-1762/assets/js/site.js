(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function syncQueryInput() {
    if (!searchInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && !searchInput.value) {
      searchInput.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var category = categoryFilter ? categoryFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      var matchedCategory = !category || card.getAttribute('data-category') === category;
      var matched = matchedKeyword && matchedYear && matchedCategory;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  syncQueryInput();

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCards);
  }

  filterCards();
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('[data-play-cover]');
  var button = document.querySelector('[data-play-button]');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function loadHlsScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var existing = document.querySelector('script[data-hls-loader]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', '1');
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function attachSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);

        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          setTimeout(resolve, 1600);
        });
      }

      video.src = sourceUrl;
      return Promise.resolve();
    }

    return loadHlsScript().then(attachWithHls).catch(function () {
      video.src = sourceUrl;
    });
  }

  function startPlayback() {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    attachSource().then(function () {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
