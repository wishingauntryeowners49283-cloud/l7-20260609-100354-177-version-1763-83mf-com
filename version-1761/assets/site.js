(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var searchForms = document.querySelectorAll("[data-search-form]");
    searchForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }

            var query = input.value.trim();
            if (!query) {
                event.preventDefault();
                window.location.href = "./search.html";
                return;
            }

            event.preventDefault();
            window.location.href = "./search.html?q=" + encodeURIComponent(query);
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var liveSearch = document.querySelector("[data-live-search]");
    var searchStatus = document.querySelector("[data-search-status]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]") );
    var activeFilter = "all";

    function normalizeText(value) {
        return String(value || "").toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = liveSearch ? normalizeText(liveSearch.value.trim()) : "";
        var visible = 0;

        cards.forEach(function (card) {
            var searchText = normalizeText(card.getAttribute("data-search"));
            var categoryText = normalizeText(card.getAttribute("data-category"));
            var yearText = normalizeText(card.getAttribute("data-year"));
            var matchesQuery = !query || searchText.indexOf(query) !== -1 || yearText.indexOf(query) !== -1;
            var matchesFilter = activeFilter === "all" || categoryText === normalizeText(activeFilter);
            var showCard = matchesQuery && matchesFilter;

            card.classList.toggle("hidden-card", !showCard);
            if (showCard) {
                visible += 1;
            }
        });

        if (searchStatus) {
            searchStatus.textContent = visible > 0 ? "正在显示匹配内容" : "暂无匹配内容";
        }
    }

    if (liveSearch) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get("q");

        if (queryParam) {
            liveSearch.value = queryParam;
        }

        liveSearch.addEventListener("input", applyFilters);
        applyFilters();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "all";
            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            applyFilters();
        });
    });

    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-play-overlay]");
    var activeHls = null;

    function attachVideo() {
        if (!video || !window.playerVideoUrl || video.getAttribute("data-ready") === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = window.playerVideoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            activeHls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            activeHls.loadSource(window.playerVideoUrl);
            activeHls.attachMedia(video);
        } else {
            video.src = window.playerVideoUrl;
        }

        video.setAttribute("data-ready", "true");
    }

    function startVideo() {
        if (!video) {
            return;
        }

        attachVideo();
        video.controls = true;

        if (overlay) {
            overlay.classList.add("hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (activeHls) {
                activeHls.destroy();
            }
        });
    }
})();
