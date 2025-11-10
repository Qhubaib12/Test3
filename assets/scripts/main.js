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
                    var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                    var matchesSearch = !searchTerm || title.indexOf(searchTerm) !== -1 || tags.indexOf(searchTerm) !== -1;
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
        var forgotLinkContainer = document.getElementById('forgotLink');
        var forgotForm = document.getElementById('forgotForm');
        var resetForm = document.getElementById('resetForm');
        var emailLoadingMsg = document.getElementById('emailLoadingMsg');
        var emailErrorMsg = document.getElementById('emailErrorMsg');
        var backToLogin = document.getElementById('backToLogin');

        function resetLoginState() {
            toggleDisplay(loadingMsg, false);
            toggleDisplay(errorMsg, false);
        }

        function resetRecoveryState() {
            toggleDisplay(emailLoadingMsg, false);
            toggleDisplay(emailErrorMsg, false);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                resetLoginState();
                toggleDisplay(loadingMsg, true, 'block');

                setTimeout(function () {
                    toggleDisplay(loadingMsg, false);
                    toggleDisplay(errorMsg, true, 'block');
                }, 2000);
            });
        }

        if (forgotLinkContainer) {
            var forgotLink = forgotLinkContainer.querySelector('a');
            if (forgotLink) {
                forgotLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (loginForm) {
                        toggleDisplay(loginForm, false);
                    }
                    toggleDisplay(forgotLinkContainer, false);
                    toggleDisplay(forgotForm, true, 'block');
                    resetLoginState();
                    resetRecoveryState();
                    if (resetForm) {
                        resetForm.reset();
                    }
                    var resetEmail = document.getElementById('resetEmail');
                    if (resetEmail) {
                        resetEmail.focus();
                    }
                });
            }
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', function () {
                if (loginForm) {
                    toggleDisplay(loginForm, true, 'block');
                }
                toggleDisplay(forgotLinkContainer, true, 'block');
                toggleDisplay(forgotForm, false);
                resetLoginState();
                resetRecoveryState();
                if (resetForm) {
                    resetForm.reset();
                }
                var firstInput = loginForm ? loginForm.querySelector('input') : null;
                if (firstInput) {
                    firstInput.focus();
                }
            });
        }

        if (resetForm) {
            resetForm.addEventListener('submit', function (event) {
                event.preventDefault();
                toggleDisplay(emailErrorMsg, false);
                toggleDisplay(emailLoadingMsg, true, 'block');

                setTimeout(function () {
                    toggleDisplay(emailLoadingMsg, false);
                    toggleDisplay(emailErrorMsg, true, 'block');
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
            if (errorMessage) {
                toggleDisplay(errorMessage, false);
            }
            updateOrderSummary();
            window.scrollTo(0, 0);
        }

        function showPremiumPage() {
            toggleDisplay(paymentPage, false);
            toggleDisplay(premiumPage, true, '');
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
            window.scrollTo(0, 0);
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
                showProcessingAnimation();
            });
        }

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
