(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero-stage');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dots button', hero);
        var prev = hero.querySelector('.hero-arrow.prev');
        var next = hero.querySelector('.hero-arrow.next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        start();
    }

    function applyQueryFilter() {
        var list = document.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim().toLowerCase();
        if (!query) {
            return;
        }
        selectAll('.movie-card', list).forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            card.classList.toggle('hidden-card', haystack.indexOf(query) === -1);
        });
        selectAll('input[name="q"]').forEach(function (input) {
            input.value = query;
        });
    }

    function initSorting() {
        var list = document.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        selectAll('[data-sort]').forEach(function (button) {
            button.addEventListener('click', function () {
                var mode = button.getAttribute('data-sort');
                var cards = selectAll('.movie-card', list);
                cards.sort(function (a, b) {
                    if (mode === 'heat') {
                        return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
                    }
                    if (mode === 'title') {
                        return a.querySelector('.card-title').textContent.localeCompare(b.querySelector('.card-title').textContent, 'zh-CN');
                    }
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
                cards.forEach(function (card) {
                    list.appendChild(card);
                });
            });
        });
    }

    window.initVideoPlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;

        function attach() {
            if (!video || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (!video) {
            return;
        }
        video.addEventListener('click', play);
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });
        if (button) {
            button.addEventListener('click', play);
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        applyQueryFilter();
        initSorting();
    });
})();
