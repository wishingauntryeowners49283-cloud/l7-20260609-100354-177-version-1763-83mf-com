(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('mobile-nav-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('hero-slide-active', slideIndex === heroIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(heroIndex + 1), 5200);
  }

  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');
  const searchTitle = document.querySelector('#search-title');
  const searchSubtitle = document.querySelector('#search-subtitle');

  const getQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  };

  const createCard = (movie) => {
    const tags = [movie.region, movie.type, movie.year].filter(Boolean);
    return `
<a class="movie-card" href="${movie.url}">
  <figure class="card-poster">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="rating-chip">${escapeHtml(movie.rating)}</span>
    <span class="play-chip">▶</span>
  </figure>
  <div class="card-body">
    <h2>${escapeHtml(movie.title)}</h2>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="card-meta">
      ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
    </div>
  </div>
</a>`;
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const runSearch = (query) => {
    if (!searchResults || !Array.isArray(window.MOVIES_INDEX)) {
      return;
    }

    const keyword = query.toLowerCase();

    if (!keyword) {
      return;
    }

    const results = window.MOVIES_INDEX.filter((movie) => {
      const corpus = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.summary,
        ...(movie.tags || [])
      ].join(' ').toLowerCase();

      return corpus.includes(keyword);
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = `搜索结果：${query}`;
    }

    if (searchSubtitle) {
      searchSubtitle.textContent = results.length ? '以下内容与关键词匹配。' : '没有找到匹配内容，可以尝试更换关键词。';
    }

    searchResults.innerHTML = results.length
      ? results.map(createCard).join('')
      : '<div class="empty-state">没有找到相关影视</div>';
  };

  const initialQuery = getQuery();

  if (searchInput) {
    searchInput.value = initialQuery;
    searchInput.addEventListener('input', () => runSearch(searchInput.value.trim()));
  }

  runSearch(initialQuery);
})();
