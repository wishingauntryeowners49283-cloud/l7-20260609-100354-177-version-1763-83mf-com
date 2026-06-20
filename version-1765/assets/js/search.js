document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('[data-search-form]');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var searchIndex = [];

  if (!form || !input || !results || !status) {
    return;
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function makeCard(movie) {
    var tags = (movie.tags || []).join(',');

    return '' +
      '<a class="movie-card" href="' + movie.url + '" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(tags) + '">' +
      '  <span class="poster-frame">' +
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">' +
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
      '    <span class="poster-play">▶</span>' +
      '  </span>' +
      '  <span class="card-body">' +
      '    <strong>' + escapeHtml(movie.title) + '</strong>' +
      '    <span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
      '    <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>' +
      '  </span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(query) {
    var words = normalize(query).split(/\s+/).filter(Boolean);

    if (!words.length) {
      results.innerHTML = '';
      status.textContent = '请输入关键词开始搜索。';
      return;
    }

    var matched = searchIndex.filter(function (movie) {
      var blob = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));

      return words.every(function (word) {
        return blob.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    results.innerHTML = matched.map(makeCard).join('\n');
    status.textContent = '找到 ' + matched.length + ' 条结果，最多显示 120 条。';
  }

  function syncFromLocation() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    runSearch(query);
  }

  searchIndex = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
  syncFromLocation();

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var params = new URLSearchParams(window.location.search);
    params.set('q', query);
    history.replaceState(null, '', 'search.html?' + params.toString());
    runSearch(query);
  });

  input.addEventListener('input', function () {
    runSearch(input.value);
  });
});
