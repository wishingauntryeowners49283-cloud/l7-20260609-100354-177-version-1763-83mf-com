(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const hero = document.querySelector(".hero-carousel");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        let index = slides.findIndex(function (slide) {
            return slide.classList.contains("active");
        });

        if (index < 0) {
            index = 0;
        }

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const nextIndex = Number(dot.getAttribute("data-slide"));
                showSlide(nextIndex);
            });
        });

        setInterval(function () {
            showSlide(index + 1);
        }, 5000);
    }

    function applyDomFilters(root) {
        const cards = Array.from(root.querySelectorAll(".movie-card, .wide-card"));
        const queryInput = root.querySelector("[data-search-input]");
        const emptyState = root.querySelector(".empty-state");
        const filterButtons = Array.from(root.querySelectorAll("[data-filter]"));
        const filters = {};

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function updateButtons(button) {
            const key = button.getAttribute("data-filter");
            filterButtons
                .filter(function (item) {
                    return item.getAttribute("data-filter") === key;
                })
                .forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
        }

        function matchYear(cardYear, selected) {
            const year = Number(cardYear || 0);

            if (!selected || selected === "all") {
                return true;
            }

            if (selected === "new") {
                return year >= 2025;
            }

            if (selected === "recent") {
                return year >= 2020 && year <= 2024;
            }

            if (selected === "classic") {
                return year >= 2010 && year <= 2019;
            }

            if (selected === "old") {
                return year < 2010;
            }

            return true;
        }

        function run() {
            const query = normalize(queryInput ? queryInput.value : "");
            let visibleCount = 0;

            cards.forEach(function (card) {
                const title = normalize(card.getAttribute("data-title"));
                const region = card.getAttribute("data-region") || "";
                const type = card.getAttribute("data-type") || "";
                const year = card.getAttribute("data-year") || "";
                const tags = normalize(card.getAttribute("data-tags"));
                const text = normalize(card.textContent);
                const matchedQuery = !query || title.includes(query) || tags.includes(query) || text.includes(query);
                const matchedRegion = !filters.region || filters.region === "all" || region === filters.region;
                const matchedType = !filters.type || filters.type === "all" || type === filters.type;
                const matchedYear = matchYear(year, filters.year);
                const matched = matchedQuery && matchedRegion && matchedType && matchedYear;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visibleCount ? "none" : "block";
            }
        }

        filterButtons.forEach(function (button) {
            const key = button.getAttribute("data-filter");
            const value = button.getAttribute("data-value") || "all";

            if (button.classList.contains("active")) {
                filters[key] = value;
            }

            button.addEventListener("click", function () {
                filters[key] = value;
                updateButtons(button);
                run();
            });
        });

        if (queryInput) {
            const params = new URLSearchParams(window.location.search);
            const initialQuery = params.get("q");

            if (initialQuery && !queryInput.value) {
                queryInput.value = initialQuery;
            }

            queryInput.addEventListener("input", run);
        }

        run();
    }

    document.querySelectorAll("[data-filter-root]").forEach(applyDomFilters);

    function setupPlayer(player) {
        const video = player.querySelector("video");
        const cover = player.querySelector(".player-cover");

        if (!video) {
            return;
        }

        const playlist = video.getAttribute("data-play");
        let ready = false;

        function prepare() {
            if (ready || !playlist) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playlist;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(playlist);
                hls.attachMedia(video);
                ready = true;
            }
        }

        function play() {
            prepare();

            if (cover) {
                cover.classList.add("hidden");
            }

            const result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    document.querySelectorAll(".video-player").forEach(setupPlayer);
})();
