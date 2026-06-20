(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('mobile-open');
    });
  }

  qsa('.mobile-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.body.classList.remove('mobile-open');
    });
  });

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function applyGridFilter(grid, state) {
    var cards = qsa('.video-card', grid);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text') || '') + ' ' + normalize(card.getAttribute('data-title') || '');
      var matchesQuery = !state.query || text.indexOf(state.query) !== -1;
      var matchesType = !state.type || card.getAttribute('data-type') === state.type;
      var matchesYear = !state.year || card.getAttribute('data-year') === state.year;
      var matchesCategory = !state.category || card.getAttribute('data-category') === state.category;
      var matched = matchesQuery && matchesType && matchesYear && matchesCategory;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    var empty = qs('[data-empty-state]', grid.parentElement);
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var searchBoard = qs('[data-search-board]');
  if (searchBoard) {
    var searchGrid = qs('[data-search-grid]');
    var input = qs('#searchInput');
    var typeFilter = qs('#typeFilter');
    var yearFilter = qs('#yearFilter');
    var categoryFilter = qs('#categoryFilter');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function updateSearch() {
      applyGridFilter(searchGrid, {
        query: normalize(input ? input.value : ''),
        type: typeFilter ? typeFilter.value : '',
        year: yearFilter ? yearFilter.value : '',
        category: categoryFilter ? categoryFilter.value : ''
      });
    }

    [input, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateSearch);
        control.addEventListener('change', updateSearch);
      }
    });
    updateSearch();
  }

  var categoryGrid = qs('[data-filter-grid]');
  if (categoryGrid) {
    var panel = qs('[data-filter-panel]');
    var localInput = qs('.category-filter-input');
    var activeType = '';
    var activeYear = '';

    function updateCategory() {
      applyGridFilter(categoryGrid, {
        query: normalize(localInput ? localInput.value : ''),
        type: activeType,
        year: activeYear,
        category: ''
      });
    }

    if (localInput) {
      localInput.addEventListener('input', updateCategory);
    }

    if (panel) {
      qsa('[data-filter-type]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          activeType = button.getAttribute('data-filter-type') || '';
          qsa('[data-filter-type]', panel).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          updateCategory();
        });
      });

      qsa('[data-filter-year]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          activeYear = button.getAttribute('data-filter-year') || '';
          qsa('[data-filter-year]', panel).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          updateCategory();
        });
      });
    }
  }
})();
