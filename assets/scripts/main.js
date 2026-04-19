(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function toggleDisplay(element, show, displayValue) {
        if (!element) {
            return;
        }
        if (typeof element.hidden !== 'undefined') {
            element.hidden = !show;
        }
        element.style.display = show ? (displayValue || '') : 'none';
    }

    function setupPreloader() {
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var preloader = document.createElement('div');
        preloader.className = 'site-preloader';
        preloader.setAttribute('aria-hidden', 'true');
        preloader.innerHTML = '<div class="site-preloader__core">' +
            '<span class="site-preloader__ring site-preloader__ring--outer"></span>' +
            '<span class="site-preloader__ring site-preloader__ring--inner"></span>' +
            '<span class="site-preloader__pixel"></span>' +
            '</div>' +
            '<p class="site-preloader__label">Calibrating the grid</p>';
        document.body.prepend(preloader);
        document.body.classList.add('is-loading');

        function dismissPreloader() {
            if (!document.body.contains(preloader)) {
                return;
            }
            document.body.classList.remove('is-loading');
            document.body.classList.add('is-ready');
            preloader.classList.add('is-hidden');
            window.setTimeout(function () {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, reduceMotion ? 100 : 900);
        }

        window.addEventListener('load', function () {
            window.setTimeout(dismissPreloader, reduceMotion ? 50 : 360);
        }, { once: true });

        window.setTimeout(dismissPreloader, 4200);
    }

    function setupParallaxMotion(reduceMotion) {
        if (reduceMotion) {
            return;
        }
        var parallaxElements = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
        if (!parallaxElements.length) {
            return;
        }

        function updateParallax() {
            var scrollY = window.scrollY || window.pageYOffset || 0;
            for (var i = 0; i < parallaxElements.length; i += 1) {
                var element = parallaxElements[i];
                var speed = parseFloat(element.getAttribute('data-parallax'));
                if (Number.isNaN(speed)) {
                    continue;
                }
                var offset = scrollY * speed;
                element.style.transform = 'translate3d(0, ' + offset.toFixed(2) + 'px, 0)';
            }
        }

        var ticking = false;
        function onScroll() {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(function () {
                updateParallax();
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        updateParallax();
    }

    function setupSpaceBackground(reduceMotion) {
        var canvas = document.getElementById('space-bg-canvas');
        if (!canvas) {
            return;
        }

        var ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = 0;
        var height = 0;
        var centerX = 0;
        var centerY = 0;
        var pointerX = 0.5;
        var pointerY = 0.5;
        var pointerTargetX = 0.5;
        var pointerTargetY = 0.5;
        var stars = [];
        var comets = [];
        var starCount = 0;
        var cometCount = 96;

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function resize() {
            width = window.innerWidth || document.documentElement.clientWidth || 1;
            height = window.innerHeight || document.documentElement.clientHeight || 1;
            centerX = width * 0.58;
            centerY = height * 0.46;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seedStars();
        }

        function makeStar() {
            var depth = random(0.2, 1);
            return {
                x: random(0, width),
                y: random(0, height),
                depth: depth,
                radius: random(0.35, 1.55) * depth,
                drift: random(0.03, 0.18) * depth,
                twinkle: random(0, Math.PI * 2),
                twinkleSpeed: random(0.004, 0.02)
            };
        }

        function makeComet(respawn) {
            var startX = respawn ? random(-width * 0.2, width * 1.15) : random(0, width);
            var startY = respawn ? random(-height * 1.2, -10) : random(-height, height);
            var angle = random(0.86, 1.12);
            var speed = random(1.2, 3.3);
            return {
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 1.35,
                length: random(20, 52),
                width: random(0.7, 1.8),
                alpha: random(0.3, 0.95),
                drift: random(0.85, 1.15),
                depth: random(0.45, 1)
            };
        }

        function seedStars() {
            var isSmall = width < 760;
            starCount = isSmall ? 170 : 280;
            cometCount = isSmall ? 80 : 104;
            stars = [];
            for (var i = 0; i < starCount; i += 1) {
                stars.push(makeStar());
            }
            comets = [];
            for (var cometIndex = 0; cometIndex < cometCount; cometIndex += 1) {
                comets.push(makeComet(false));
            }
        }

        function drawGalaxy() {
            var pointerOffsetX = (pointerX - 0.5) * 24;
            var pointerOffsetY = (pointerY - 0.5) * 18;
            var gradient = ctx.createRadialGradient(centerX + pointerOffsetX, centerY + pointerOffsetY, 0, centerX + pointerOffsetX, centerY + pointerOffsetY, Math.min(width, height) * 0.36);
            gradient.addColorStop(0, 'rgba(82, 255, 178, 0.28)');
            gradient.addColorStop(0.28, 'rgba(32, 150, 104, 0.15)');
            gradient.addColorStop(0.65, 'rgba(8, 34, 24, 0.06)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        function drawStars() {
            var driftBase = reduceMotion ? 0.012 : 0.04;
            for (var i = 0; i < stars.length; i += 1) {
                var star = stars[i];
                star.twinkle += star.twinkleSpeed;
                star.y += driftBase + star.drift * (reduceMotion ? 0.2 : 1);
                if (star.y > height + 3) {
                    star.y = -3;
                    star.x = random(0, width);
                }
                var parallaxX = (pointerX - 0.5) * 30 * star.depth;
                var parallaxY = (pointerY - 0.5) * 20 * star.depth;
                var glow = 0.65 + Math.sin(star.twinkle) * 0.35;
                var alpha = 0.15 + star.depth * 0.5 * glow;
                ctx.beginPath();
                ctx.fillStyle = 'rgba(160, 255, 215, ' + alpha.toFixed(3) + ')';
                ctx.arc(star.x + parallaxX, star.y + parallaxY, star.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawComets() {
            for (var i = 0; i < comets.length; i += 1) {
                var comet = comets[i];
                var speedScale = reduceMotion ? 0.35 : 1;
                comet.x += comet.vx * speedScale * comet.drift;
                comet.y += comet.vy * speedScale * comet.drift;

                var parallaxX = (pointerX - 0.5) * 14 * comet.depth;
                var parallaxY = (pointerY - 0.5) * 8 * comet.depth;
                var tailX = comet.x - comet.vx * comet.length;
                var tailY = comet.y - comet.vy * comet.length;

                var cometGradient = ctx.createLinearGradient(comet.x + parallaxX, comet.y + parallaxY, tailX + parallaxX, tailY + parallaxY);
                cometGradient.addColorStop(0, 'rgba(109, 255, 184, ' + comet.alpha.toFixed(3) + ')');
                cometGradient.addColorStop(0.2, 'rgba(71, 252, 162, ' + (comet.alpha * 0.72).toFixed(3) + ')');
                cometGradient.addColorStop(1, 'rgba(33, 148, 92, 0)');

                ctx.strokeStyle = cometGradient;
                ctx.lineWidth = comet.width;
                ctx.shadowColor = 'rgba(109, 255, 184, 0.55)';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(comet.x + parallaxX, comet.y + parallaxY);
                ctx.lineTo(tailX + parallaxX, tailY + parallaxY);
                ctx.stroke();

                if (comet.y > height + 120 || comet.x > width + 120) {
                    comets[i] = makeComet(true);
                }
            }
            ctx.shadowBlur = 0;
        }

        function animate() {
            pointerX += (pointerTargetX - pointerX) * 0.03;
            pointerY += (pointerTargetY - pointerY) * 0.03;
            ctx.clearRect(0, 0, width, height);
            drawGalaxy();
            drawStars();
            drawComets();
            window.requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        document.addEventListener('pointermove', function (event) {
            pointerTargetX = event.clientX / Math.max(width, 1);
            pointerTargetY = event.clientY / Math.max(height, 1);
        }, { passive: true });
        document.addEventListener('pointerleave', function () {
            pointerTargetX = 0.5;
            pointerTargetY = 0.5;
        });

        resize();
        window.requestAnimationFrame(animate);
    }

    ready(function () {
        setupPreloader();

        var navToggle = document.querySelector('.nav-toggle');
        var primaryNav = document.querySelector('.primary-nav');

        if (navToggle && primaryNav) {
            navToggle.addEventListener('click', function () {
                var isOpen = primaryNav.classList.toggle('is-open');
                navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            document.addEventListener('click', function (event) {
                if (!primaryNav.classList.contains('is-open')) {
                    return;
                }
                var target = event.target;
                if (!primaryNav.contains(target) && !navToggle.contains(target)) {
                    primaryNav.classList.remove('is-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
                    primaryNav.classList.remove('is-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.focus();
                }
            });
        }

        document.body.classList.add('js-enhanced');

        var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.hero, .games, .features, .updates, .testimonials, .page-hero, .section'));
        var staggerGroups = Array.prototype.slice.call(document.querySelectorAll('[data-stagger-group]'));
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isNarrowScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        var supportsFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
        var hardwareThreads = navigator.hardwareConcurrency || 8;
        var enableAdvancedEffects = !reduceMotion && supportsFinePointer && !isNarrowScreen && hardwareThreads >= 6;

        setupParallaxMotion(reduceMotion);
        setupSpaceBackground(reduceMotion);

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function updateScrollExperience() {
            var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
            var scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - (window.innerHeight || 1);
            var progress = scrollHeight > 0 ? clamp(scrollTop / scrollHeight, 0, 1) : 0;
            document.body.style.setProperty('--scroll-progress', progress.toFixed(4));
            document.body.classList.toggle('is-scrolled', scrollTop > 16);
        }

        var scrollTicking = false;
        function onScrollOrResize() {
            if (scrollTicking) {
                return;
            }
            scrollTicking = true;
            window.requestAnimationFrame(function () {
                updateScrollExperience();
                scrollTicking = false;
            });
        }

        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize);
        updateScrollExperience();

        if (enableAdvancedEffects) {
            var latestPointerX = 50;
            var latestPointerY = 20;
            var pointerTicking = false;
            var aurora = null;
            var tiltCards = Array.prototype.slice.call(document.querySelectorAll('.game-card, .feature-card, .pricing-card, .info-card, .shop-card, .team-card, .contact-card'));
            var activeTiltCard = null;
            var tiltTicking = false;
            var tiltRotateX = 0;
            var tiltRotateY = 0;

            function commitPointerPosition() {
                if (!aurora) {
                    aurora = document.createElement('div');
                    aurora.className = 'ui-aurora';
                    document.body.insertBefore(aurora, document.body.firstChild);
                }
                document.body.style.setProperty('--pointer-x', latestPointerX.toFixed(2) + '%');
                document.body.style.setProperty('--pointer-y', latestPointerY.toFixed(2) + '%');
                pointerTicking = false;
            }

            function commitTilt() {
                if (!activeTiltCard) {
                    tiltTicking = false;
                    return;
                }
                activeTiltCard.style.transform = 'perspective(900px) rotateX(' + tiltRotateX.toFixed(2) + 'deg) rotateY(' + tiltRotateY.toFixed(2) + 'deg) translateY(-2px)';
                tiltTicking = false;
            }

            function resetTiltCard(card) {
                if (!card) {
                    return;
                }
                card.style.transform = '';
            }

            document.addEventListener('pointermove', function (event) {
                latestPointerX = (event.clientX / Math.max(window.innerWidth, 1)) * 100;
                latestPointerY = (event.clientY / Math.max(window.innerHeight, 1)) * 100;
                if (!pointerTicking) {
                    pointerTicking = true;
                    window.requestAnimationFrame(commitPointerPosition);
                }
                var hoveredCard = event.target && event.target.closest ? event.target.closest('.game-card, .feature-card, .pricing-card, .info-card, .shop-card, .team-card, .contact-card') : null;
                if (hoveredCard && tiltCards.indexOf(hoveredCard) === -1) {
                    hoveredCard = null;
                }
                if (activeTiltCard !== hoveredCard) {
                    resetTiltCard(activeTiltCard);
                    activeTiltCard = hoveredCard;
                }
                if (!activeTiltCard) {
                    return;
                }
                var rect = activeTiltCard.getBoundingClientRect();
                if (!rect.width || !rect.height) {
                    return;
                }
                var relativeX = (event.clientX - rect.left) / rect.width;
                var relativeY = (event.clientY - rect.top) / rect.height;
                tiltRotateY = (relativeX - 0.5) * 2.4;
                tiltRotateX = (0.5 - relativeY) * 1.9;
                if (!tiltTicking) {
                    tiltTicking = true;
                    window.requestAnimationFrame(commitTilt);
                }
            }, { passive: true });

            document.addEventListener('pointerleave', function () {
                resetTiltCard(activeTiltCard);
                activeTiltCard = null;
            });

            window.addEventListener('pagehide', function () {
                resetTiltCard(activeTiltCard);
                activeTiltCard = null;
            });
        }

        for (var revealIndex = 0; revealIndex < revealTargets.length; revealIndex += 1) {
            revealTargets[revealIndex].classList.add('motion-reveal');
        }


        for (var staggerInitIndex = 0; staggerInitIndex < staggerGroups.length; staggerInitIndex += 1) {
            var staggerChildren = Array.prototype.slice.call(staggerGroups[staggerInitIndex].children || []);
            for (var staggerChildIndex = 0; staggerChildIndex < staggerChildren.length; staggerChildIndex += 1) {
                staggerChildren[staggerChildIndex].classList.add('motion-reveal');
            }
        }

        function revealStaggerGroup(group) {
            var children = Array.prototype.slice.call(group.children || []);
            var isHeavyGroup = children.length > 12;
            for (var childIndex = 0; childIndex < children.length; childIndex += 1) {
                children[childIndex].classList.add('motion-reveal');
                if (isHeavyGroup) {
                    children[childIndex].classList.add('motion-reveal--instant');
                    children[childIndex].style.transitionDelay = '';
                } else {
                    children[childIndex].classList.remove('motion-reveal--instant');
                    children[childIndex].style.transitionDelay = (childIndex * 70) + 'ms';
                }
                children[childIndex].classList.add('is-visible');
            }
        }

        function isInViewport(element, offset) {
            if (!element) {
                return false;
            }
            var rect = element.getBoundingClientRect();
            var viewHeight = window.innerHeight || document.documentElement.clientHeight;
            var viewWidth = window.innerWidth || document.documentElement.clientWidth;
            var threshold = offset || 0;
            return rect.bottom >= -threshold &&
                rect.top <= viewHeight + threshold &&
                rect.right >= 0 &&
                rect.left <= viewWidth;
        }

        function revealInitialTargets() {
            var threshold = window.innerHeight ? window.innerHeight * 0.15 : 120;
            for (var targetIndex = 0; targetIndex < revealTargets.length; targetIndex += 1) {
                if (isInViewport(revealTargets[targetIndex], threshold)) {
                    revealTargets[targetIndex].classList.add('is-visible');
                }
            }
            for (var groupIndex = 0; groupIndex < staggerGroups.length; groupIndex += 1) {
                if (isInViewport(staggerGroups[groupIndex], threshold)) {
                    revealStaggerGroup(staggerGroups[groupIndex]);
                }
            }
        }

        if (reduceMotion || isNarrowScreen || typeof window.IntersectionObserver === 'undefined') {
            for (var revealFallbackIndex = 0; revealFallbackIndex < revealTargets.length; revealFallbackIndex += 1) {
                revealTargets[revealFallbackIndex].classList.add('is-visible');
            }
            for (var staggerFallbackIndex = 0; staggerFallbackIndex < staggerGroups.length; staggerFallbackIndex += 1) {
                revealStaggerGroup(staggerGroups[staggerFallbackIndex]);
            }
        } else {
            var revealObserver = new IntersectionObserver(function (entries) {
                for (var entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
                    if (entries[entryIndex].isIntersecting) {
                        entries[entryIndex].target.classList.add('is-visible');
                        revealObserver.unobserve(entries[entryIndex].target);
                    }
                }
            }, {
                threshold: 0.16,
                rootMargin: '0px 0px -10% 0px'
            });

            var staggerObserver = new IntersectionObserver(function (entries) {
                for (var staggerEntryIndex = 0; staggerEntryIndex < entries.length; staggerEntryIndex += 1) {
                    if (entries[staggerEntryIndex].isIntersecting) {
                        revealStaggerGroup(entries[staggerEntryIndex].target);
                        staggerObserver.unobserve(entries[staggerEntryIndex].target);
                    }
                }
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -8% 0px'
            });

            for (var observerIndex = 0; observerIndex < revealTargets.length; observerIndex += 1) {
                revealObserver.observe(revealTargets[observerIndex]);
            }
            for (var groupIndex = 0; groupIndex < staggerGroups.length; groupIndex += 1) {
                staggerObserver.observe(staggerGroups[groupIndex]);
            }
            window.requestAnimationFrame(revealInitialTargets);
        }

        var gameGrid = document.querySelector('[data-game-grid]');
        if (gameGrid) {
            var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
            var gameCards = Array.prototype.slice.call(gameGrid.querySelectorAll('.game-card'));
            var searchInput = document.getElementById('game-search');
            var resultsStatus = document.getElementById('games-results-status');
            var activeFilter = 'all';
            var searchTerm = '';

            var emptyState = document.createElement('p');
            emptyState.className = 'games__subtitle';
            emptyState.textContent = 'No games match your filters yet. Try another genre or clear the search.';
            emptyState.style.display = 'none';

            var parent = gameGrid.parentNode;
            if (parent) {
                parent.insertBefore(emptyState, gameGrid.nextSibling);
            }

            function applyFilters() {
                var visibleCount = 0;
                for (var i = 0; i < gameCards.length; i += 1) {
                    var card = gameCards[i];
                    var matchesFilter = activeFilter === 'all' || card.getAttribute('data-genre') === activeFilter;
                    var titleEl = card.querySelector('.game-card__title');
                    var title = titleEl ? titleEl.textContent.toLowerCase() : '';
                    var descriptionEl = card.querySelector('.game-card__description');
                    var description = descriptionEl ? descriptionEl.textContent.toLowerCase() : '';
                    var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                    var genre = (card.getAttribute('data-genre') || '').toLowerCase();
                    var matchesSearch = !searchTerm ||
                        title.indexOf(searchTerm) !== -1 ||
                        tags.indexOf(searchTerm) !== -1 ||
                        description.indexOf(searchTerm) !== -1 ||
                        genre.indexOf(searchTerm) !== -1;
                    var isVisible = matchesFilter && matchesSearch;
                    card.style.display = isVisible ? '' : 'none';
                    card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
                    if (typeof card.hidden !== 'undefined') {
                        card.hidden = !isVisible;
                    }
                    if (isVisible) {
                        visibleCount += 1;
                    }
                }
                toggleDisplay(emptyState, visibleCount === 0, 'block');
                if (resultsStatus) {
                    var filterLabel = activeFilter === 'all' ? 'all genres' : activeFilter.replace('-', ' ');
                    var gameLabel = visibleCount === 1 ? 'game' : 'games';
                    var statusParts = [visibleCount + ' ' + gameLabel + ' shown'];
                    if (activeFilter !== 'all') {
                        statusParts.push(filterLabel);
                    }
                    if (searchTerm) {
                        statusParts.push('"' + searchTerm + '"');
                    }
                    resultsStatus.textContent = statusParts.join(' \u00b7 ');
                }
            }

            for (var j = 0; j < filterButtons.length; j += 1) {
                (function (button) {
                    button.addEventListener('click', function () {
                        activeFilter = button.getAttribute('data-filter') || 'all';
                        for (var k = 0; k < filterButtons.length; k += 1) {
                            filterButtons[k].setAttribute('aria-pressed', filterButtons[k] === button ? 'true' : 'false');
                        }
                        applyFilters();
                    });
                })(filterButtons[j]);
            }

            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    searchTerm = searchInput.value.replace(/\s+/g, ' ').trim().toLowerCase();
                    applyFilters();
                });
            }

            applyFilters();
        }

        var shopCards = Array.prototype.slice.call(document.querySelectorAll('.shop-card'));
        var shopModal = document.getElementById('shop-modal');

        if (shopModal && shopCards.length) {
            var modalTitle = document.getElementById('shop-modal-title');
            var modalCategory = document.getElementById('shop-modal-category');
            var modalDescription = document.getElementById('shop-modal-description');
            var modalPrice = document.getElementById('shop-modal-price');
            var modalSku = document.getElementById('shop-modal-sku');
            var modalIncludes = document.getElementById('shop-modal-includes');
            var modalCloseButtons = Array.prototype.slice.call(shopModal.querySelectorAll('[data-shop-close]'));

            function clearModalVariant() {
                shopModal.classList.remove('shop-modal--keyboard', 'shop-modal--monitor', 'shop-modal--controller', 'shop-modal--disc', 'shop-modal--pixel');
            }

            function applyModalVariant(card) {
                clearModalVariant();
                if (card.classList.contains('shop-card--keyboard')) {
                    shopModal.classList.add('shop-modal--keyboard');
                } else if (card.classList.contains('shop-card--monitor')) {
                    shopModal.classList.add('shop-modal--monitor');
                } else if (card.classList.contains('shop-card--controller')) {
                    shopModal.classList.add('shop-modal--controller');
                } else if (card.classList.contains('shop-card--disc')) {
                    shopModal.classList.add('shop-modal--disc');
                } else if (card.classList.contains('shop-card--pixel')) {
                    shopModal.classList.add('shop-modal--pixel');
                }
            }

            function openShopModal(card) {
                var title = card.getAttribute('data-name') || '';
                var category = card.getAttribute('data-category') || '';
                var description = card.getAttribute('data-description') || '';
                var price = card.getAttribute('data-price') || '';
                var sku = card.getAttribute('data-sku') || '';
                var includes = card.getAttribute('data-includes') || '';

                if (modalTitle) {
                    modalTitle.textContent = title || (card.querySelector('.shop-card__title') || {}).textContent || 'Product details';
                }
                if (modalCategory) {
                    modalCategory.textContent = category || 'Merch';
                }
                if (modalDescription) {
                    modalDescription.textContent = description || '';
                }
                if (modalPrice) {
                    modalPrice.textContent = price || '—';
                }
                if (modalSku) {
                    modalSku.textContent = sku || '—';
                }
                if (modalIncludes) {
                    modalIncludes.textContent = includes || '—';
                }

                applyModalVariant(card);
                toggleDisplay(shopModal, true, 'grid');
                document.body.classList.add('is-modal-open');
                var closeButton = shopModal.querySelector('[data-shop-close]');
                if (closeButton) {
                    closeButton.focus();
                }
            }

            function closeShopModal() {
                toggleDisplay(shopModal, false);
                document.body.classList.remove('is-modal-open');
                clearModalVariant();
            }

            for (var shopIndex = 0; shopIndex < shopCards.length; shopIndex += 1) {
                (function (card) {
                    card.addEventListener('click', function () {
                        openShopModal(card);
                    });
                    card.addEventListener('keydown', function (event) {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openShopModal(card);
                        }
                    });
                })(shopCards[shopIndex]);
            }

            for (var closeIndex = 0; closeIndex < modalCloseButtons.length; closeIndex += 1) {
                modalCloseButtons[closeIndex].addEventListener('click', function () {
                    closeShopModal();
                });
            }

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !shopModal.hidden) {
                    closeShopModal();
                }
            });
        }

        var loginForm = document.getElementById('loginForm');
        var loadingMsg = document.getElementById('loadingMsg');
        var errorMsg = document.getElementById('errorMsg');
        var forgotToggle = document.getElementById('forgotToggle');
        var recoveryPanel = document.getElementById('recoveryPanel');
        var resetForm = document.getElementById('resetForm');
        var emailLoadingMsg = document.getElementById('emailLoadingMsg');
        var emailErrorMsg = document.getElementById('emailErrorMsg');
        var closeRecovery = document.getElementById('closeRecovery');
        var loginEmailInput = document.getElementById('login-email');
        var loginPasswordInput = document.getElementById('login-password');
        var resetEmailInput = document.getElementById('resetEmail');
        var loginDefaultError = errorMsg ? errorMsg.textContent : '';
        var recoveryDefaultError = emailErrorMsg ? emailErrorMsg.innerHTML : '';

        function sanitizeInputValue(value) {
            return value ? value.replace(/\s+/g, ' ').trim() : '';
        }

        function isValidEmail(value) {
            if (!value) {
                return false;
            }
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        function markInvalidState(input, isInvalid) {
            if (!input) {
                return;
            }
            input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
        }

        function resetLoginState() {
            toggleDisplay(loadingMsg, false);
            toggleDisplay(errorMsg, false);
            if (errorMsg && loginDefaultError) {
                errorMsg.textContent = loginDefaultError;
            }
            markInvalidState(loginEmailInput, false);
            markInvalidState(loginPasswordInput, false);
        }

        function resetRecoveryState() {
            toggleDisplay(emailLoadingMsg, false);
            toggleDisplay(emailErrorMsg, false);
            if (emailErrorMsg && recoveryDefaultError) {
                emailErrorMsg.innerHTML = recoveryDefaultError;
            }
            markInvalidState(resetEmailInput, false);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                resetLoginState();

                var emailValue = loginEmailInput ? sanitizeInputValue(loginEmailInput.value) : '';
                var passwordValue = loginPasswordInput ? loginPasswordInput.value : '';

                if (!emailValue || !passwordValue) {
                    if (errorMsg) {
                        errorMsg.textContent = 'Enter your email and password to continue.';
                        toggleDisplay(errorMsg, true, 'block');
                    }
                    markInvalidState(loginEmailInput, !emailValue);
                    markInvalidState(loginPasswordInput, !passwordValue);
                    if (!emailValue && loginEmailInput) {
                        loginEmailInput.focus();
                    } else if (loginPasswordInput) {
                        loginPasswordInput.focus();
                    }
                    return;
                }

                if (!isValidEmail(emailValue)) {
                    if (errorMsg) {
                        errorMsg.textContent = 'Enter a valid email address (example@domain.com).';
                        toggleDisplay(errorMsg, true, 'block');
                    }
                    markInvalidState(loginEmailInput, true);
                    if (loginEmailInput) {
                        loginEmailInput.focus();
                        loginEmailInput.select();
                    }
                    return;
                }

                if (errorMsg) {
                    errorMsg.textContent = 'Wrong email or password.';
                }

                toggleDisplay(loadingMsg, true, 'block');

                setTimeout(function () {
                    toggleDisplay(loadingMsg, false);
                    toggleDisplay(errorMsg, true, 'block');
                    markInvalidState(loginEmailInput, true);
                    markInvalidState(loginPasswordInput, true);
                }, 2000);
            });
        }

        function showRecoveryPanel() {
            if (recoveryPanel && forgotToggle) {
                resetLoginState();
                resetRecoveryState();
                if (resetForm) {
                    resetForm.reset();
                }
                toggleDisplay(recoveryPanel, true, 'block');
                forgotToggle.setAttribute('aria-expanded', 'true');
                var resetEmail = document.getElementById('resetEmail');
                if (resetEmail) {
                    resetEmail.focus();
                }
            }
        }

        function hideRecoveryPanel() {
            if (recoveryPanel && forgotToggle) {
                resetLoginState();
                resetRecoveryState();
                if (resetForm) {
                    resetForm.reset();
                }
                toggleDisplay(recoveryPanel, false);
                forgotToggle.setAttribute('aria-expanded', 'false');
                if (loginForm) {
                    var firstInput = loginForm.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }
        }

        if (forgotToggle && recoveryPanel) {
            toggleDisplay(recoveryPanel, false);
            forgotToggle.addEventListener('click', function (event) {
                event.preventDefault();
                var isExpanded = forgotToggle.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    hideRecoveryPanel();
                } else {
                    showRecoveryPanel();
                }
            });
        }

        if (closeRecovery) {
            closeRecovery.addEventListener('click', function () {
                hideRecoveryPanel();
            });
        }

        if (resetForm) {
            resetForm.addEventListener('submit', function (event) {
                event.preventDefault();
                resetRecoveryState();

                var resetEmailValue = resetEmailInput ? sanitizeInputValue(resetEmailInput.value) : '';

                if (!resetEmailValue) {
                    if (emailErrorMsg) {
                        emailErrorMsg.textContent = 'Enter the registered email address to start recovery.';
                        toggleDisplay(emailErrorMsg, true, 'block');
                    }
                    markInvalidState(resetEmailInput, true);
                    if (resetEmailInput) {
                        resetEmailInput.focus();
                    }
                    return;
                }

                if (!isValidEmail(resetEmailValue)) {
                    if (emailErrorMsg) {
                        emailErrorMsg.textContent = 'That email address looks incorrect—double-check the format and try again.';
                        toggleDisplay(emailErrorMsg, true, 'block');
                    }
                    markInvalidState(resetEmailInput, true);
                    if (resetEmailInput) {
                        resetEmailInput.focus();
                        resetEmailInput.select();
                    }
                    return;
                }

                toggleDisplay(emailLoadingMsg, true, 'block');

                setTimeout(function () {
                    toggleDisplay(emailLoadingMsg, false);
                    if (emailErrorMsg && recoveryDefaultError) {
                        emailErrorMsg.innerHTML = recoveryDefaultError;
                    }
                    toggleDisplay(emailErrorMsg, true, 'block');
                    markInvalidState(resetEmailInput, true);
                }, 2500);
            });
        }

        var premiumPage = document.getElementById('premium-page');
        var paymentPage = document.getElementById('payment-page');
        var monthlyButton = document.getElementById('monthly-btn');
        var annualButton = document.getElementById('annual-btn');
        var backButton = document.getElementById('back-btn');
        var applyCouponButton = document.getElementById('apply-coupon-btn');
        var couponInput = document.getElementById('couponCode');
        var paymentForm = document.getElementById('payment-form');
        var paymentSubmitButton = paymentForm ? paymentForm.querySelector('button[type="submit"]') : null;
        var paymentRequiredInputs = paymentForm ? Array.prototype.slice.call(paymentForm.querySelectorAll('input[required]')) : [];
        var planTypeEl = document.getElementById('plan-type');
        var planPriceEl = document.getElementById('plan-price');
        var totalAmountEl = document.getElementById('total-amount');
        var loadingOverlay = document.getElementById('loading-overlay');
        var loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;
        var errorMessage = document.getElementById('error-message');
        var stepIds = ['step1', 'step2', 'step3', 'step4'];
        var selectedPlan = { type: 'monthly', price: 5.99 };

        function updateOrderSummary() {
            if (planTypeEl) {
                planTypeEl.textContent = selectedPlan.type.charAt(0).toUpperCase() + selectedPlan.type.slice(1);
            }
            if (planPriceEl) {
                planPriceEl.textContent = '$' + selectedPlan.price.toFixed(2);
            }
            if (totalAmountEl) {
                totalAmountEl.textContent = '$' + selectedPlan.price.toFixed(2);
            }
        }

        function showPaymentPage() {
            toggleDisplay(premiumPage, false);
            toggleDisplay(paymentPage, true, 'block');
            if (paymentPage) {
                paymentPage.classList.add('is-visible');
            }
            if (errorMessage) {
                toggleDisplay(errorMessage, false);
            }
            for (var i = 0; i < paymentRequiredInputs.length; i += 1) {
                paymentRequiredInputs[i].setAttribute('aria-invalid', 'false');
            }
            updateOrderSummary();
            if (paymentPage && typeof paymentPage.scrollIntoView === 'function') {
                paymentPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            updatePaymentButtonState();
        }

        function isValidCardNumber(value) {
            var digits = value.replace(/\s+/g, '');
            return digits.length >= 12;
        }

        function isValidExpiry(value) {
            if (!/^\d{2}\/\d{2}$/.test(value)) {
                return false;
            }
            var parts = value.split('/');
            var month = parseInt(parts[0], 10);
            return month >= 1 && month <= 12;
        }

        function isValidCvv(value) {
            return /^\d{3,4}$/.test(value);
        }

        function isValidZip(value) {
            return /^[A-Za-z0-9\s-]{3,10}$/.test(value);
        }

        function isPaymentFieldValid(input) {
            if (!input) {
                return false;
            }
            var value = sanitizeInputValue(input.value);
            if (!value) {
                return false;
            }
            switch (input.id) {
                case 'email':
                    return isValidEmail(value);
                case 'cardNumber':
                    return isValidCardNumber(value);
                case 'expiryDate':
                    return isValidExpiry(value);
                case 'cvv':
                    return isValidCvv(value);
                case 'zipCode':
                    return isValidZip(value);
                default:
                    return value.length > 0;
            }
        }

        function updatePaymentFieldStates(showInvalid) {
            if (!paymentRequiredInputs.length) {
                return true;
            }
            var firstInvalid = null;
            var isValid = true;
            for (var i = 0; i < paymentRequiredInputs.length; i += 1) {
                var input = paymentRequiredInputs[i];
                var fieldIsValid = isPaymentFieldValid(input);
                if (showInvalid) {
                    input.setAttribute('aria-invalid', fieldIsValid ? 'false' : 'true');
                }
                if (!fieldIsValid) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = input;
                    }
                }
            }
            if (showInvalid && firstInvalid && typeof firstInvalid.focus === 'function') {
                firstInvalid.focus();
            }
            return isValid;
        }

        function updatePaymentButtonState() {
            var isValid = updatePaymentFieldStates(false);
            if (paymentSubmitButton) {
                paymentSubmitButton.disabled = !isValid;
                if (isValid) {
                    paymentSubmitButton.removeAttribute('aria-disabled');
                } else {
                    paymentSubmitButton.setAttribute('aria-disabled', 'true');
                }
            }
            return isValid;
        }

        function showPremiumPage() {
            toggleDisplay(paymentPage, false);
            toggleDisplay(premiumPage, true, '');
            if (premiumPage) {
                premiumPage.classList.add('is-visible');
            }
            if (errorMessage) {
                toggleDisplay(errorMessage, false);
            }
            if (loadingOverlay) {
                toggleDisplay(loadingOverlay, false);
            }
            if (loadingText) {
                loadingText.textContent = 'Processing payment...';
                loadingText.style.color = '';
            }
            for (var i = 0; i < stepIds.length; i += 1) {
                var step = document.getElementById(stepIds[i]);
                if (step) {
                    step.classList.remove('active', 'completed', 'failed');
                }
            }
            if (premiumPage && typeof premiumPage.scrollIntoView === 'function') {
                premiumPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            updatePaymentButtonState();
        }

        function selectPlan(type, price) {
            selectedPlan = { type: type, price: price };
            showPaymentPage();
        }

        function applyCoupon() {
            if (!couponInput) {
                return;
            }
            var couponCode = couponInput.value.trim();
            if (couponCode) {
                window.alert('INVALID COUPON CODE. TRY AGAIN!');
            }
        }

        function showProcessingAnimation() {
            if (!loadingOverlay || !loadingText) {
                return;
            }

            toggleDisplay(errorMessage, false);
            toggleDisplay(loadingOverlay, true, 'flex');

            var currentStep = 0;
            function processStep() {
                if (currentStep > 0) {
                    var previousStep = document.getElementById(stepIds[currentStep - 1]);
                    if (previousStep) {
                        previousStep.classList.remove('active');
                        previousStep.classList.add('completed');
                    }
                }

                if (currentStep < stepIds.length) {
                    var step = document.getElementById(stepIds[currentStep]);
                    if (step) {
                        step.classList.add('active');
                    }
                    currentStep += 1;
                    var delays = [1200, 2800, 3500, 1800];
                    setTimeout(processStep, delays[currentStep - 1] || 1500);
                } else {
                    setTimeout(function () {
                        var finalStep = document.getElementById(stepIds[stepIds.length - 1]);
                        if (finalStep) {
                            finalStep.classList.remove('active');
                            finalStep.classList.add('failed');
                        }
                        loadingText.textContent = 'Payment failed';
                        loadingText.style.color = '#ff968b';

                        setTimeout(function () {
                            toggleDisplay(loadingOverlay, false);
                            toggleDisplay(errorMessage, true, 'block');
                            if (errorMessage) {
                                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            for (var i = 0; i < stepIds.length; i += 1) {
                                var step = document.getElementById(stepIds[i]);
                                if (step) {
                                    step.classList.remove('active', 'completed', 'failed');
                                }
                            }
                            loadingText.textContent = 'Processing payment...';
                            loadingText.style.color = '';
                        }, 1500);
                    }, 800);
                }
            }

            setTimeout(processStep, 600);
        }

        if (monthlyButton) {
            monthlyButton.addEventListener('click', function () {
                selectPlan('monthly', 5.99);
            });
        }

        if (annualButton) {
            annualButton.addEventListener('click', function () {
                selectPlan('annual', 49.99);
            });
        }

        if (backButton) {
            backButton.addEventListener('click', function () {
                showPremiumPage();
            });
        }

        if (applyCouponButton) {
            applyCouponButton.addEventListener('click', function () {
                applyCoupon();
            });
        }

        if (couponInput) {
            couponInput.addEventListener('keypress', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    applyCoupon();
                }
            });
        }

        if (paymentForm) {
            paymentForm.addEventListener('submit', function (event) {
                event.preventDefault();
                toggleDisplay(errorMessage, false);
                var isFormValid = updatePaymentFieldStates(true);
                updatePaymentButtonState();
                if (!isFormValid) {
                    return;
                }
                showProcessingAnimation();
            });
        }

        for (var paymentIndex = 0; paymentIndex < paymentRequiredInputs.length; paymentIndex += 1) {
            (function (input) {
                input.addEventListener('input', function () {
                    input.setAttribute('aria-invalid', isPaymentFieldValid(input) ? 'false' : 'true');
                    updatePaymentButtonState();
                });
                input.addEventListener('blur', function () {
                    input.setAttribute('aria-invalid', isPaymentFieldValid(input) ? 'false' : 'true');
                });
            })(paymentRequiredInputs[paymentIndex]);
        }

        updatePaymentButtonState();

        var cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function (event) {
                var input = event.target;
                var digits = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
                var groups = digits.match(/.{1,4}/g);
                input.value = groups ? groups.join(' ') : '';
            });
        }

        var expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', function (event) {
                var input = event.target;
                var digits = input.value.replace(/\D/g, '');
                if (digits.length >= 2) {
                    digits = digits.substring(0, 2) + '/' + digits.substring(2, 4);
                }
                input.value = digits;
            });
        }

        var cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', function (event) {
                var input = event.target;
                input.value = input.value.replace(/\D/g, '');
            });
        }
    });
})();
