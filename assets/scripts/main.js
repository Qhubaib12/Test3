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

    ready(function () {
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

        var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.hero, .games, .features, .updates, .testimonials, .page-hero, .section'));
        var staggerGroups = Array.prototype.slice.call(document.querySelectorAll('[data-stagger-group]'));
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isNarrowScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

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
            for (var childIndex = 0; childIndex < children.length; childIndex += 1) {
                children[childIndex].classList.add('motion-reveal');
                children[childIndex].style.transitionDelay = (childIndex * 70) + 'ms';
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
