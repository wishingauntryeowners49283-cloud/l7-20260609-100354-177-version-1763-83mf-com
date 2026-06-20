document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupHeroCarousel();
  setupFilters();
});

function setupNavigation() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var background = hero.querySelector('[data-hero-background]');
  var nextButton = hero.querySelector('[data-hero-next]');
  var prevButton = hero.querySelector('[data-hero-prev]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });

    if (background && slides[current]) {
      var image = slides[current].getAttribute('data-hero-bg');
      background.style.backgroundImage = "url('" + image + "')";
    }
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(current + 1);
      startTimer();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(current - 1);
      startTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
      showSlide(index);
      startTimer();
    });
  });

  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', startTimer);

  showSlide(0);
  startTimer();
}

function setupFilters() {
  var panel = document.querySelector('[data-filter-panel]');
  var list = document.querySelector('[data-filter-list]');
  var count = document.querySelector('[data-filter-count]');

  if (!panel || !list) {
    return;
  }

  var keywordInput = panel.querySelector('[data-filter-keyword]');
  var yearInput = panel.querySelector('[data-filter-year]');
  var regionInput = panel.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function matches(card, keyword, year, region) {
    var blob = [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();

    if (keyword && blob.indexOf(keyword) === -1) {
      return false;
    }

    if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
      return false;
    }

    if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
      return false;
    }

    return true;
  }

  function applyFilter() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var year = normalize(yearInput && yearInput.value);
    var region = normalize(regionInput && regionInput.value);
    var visible = 0;

    cards.forEach(function (card) {
      var isVisible = matches(card, keyword, year, region);
      card.hidden = !isVisible;

      if (isVisible) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '共 ' + visible + ' 部影片';
    }
  }

  [keywordInput, yearInput, regionInput].forEach(function (input) {
    if (input) {
      input.addEventListener('input', applyFilter);
    }
  });

  applyFilter();
}
