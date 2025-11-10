const ready = (fn) => {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

ready(() => {
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.querySelector('.primary-nav');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = primaryNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', (event) => {
            if (!primaryNav.classList.contains('is-open')) {
                return;
            }

            if (event.target instanceof Element) {
                const isClickInside = primaryNav.contains(event.target) || navToggle.contains(event.target);
                if (!isClickInside) {
                    primaryNav.classList.remove('is-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
                primaryNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
    const gameGrid = document.querySelector('[data-game-grid]');
    const searchInput = document.querySelector('#game-search');

    if (gameGrid) {
        const gameCards = Array.from(gameGrid.querySelectorAll('.game-card'));
        let activeFilter = 'all';
        let searchTerm = '';

        const emptyState = document.createElement('p');
        emptyState.textContent = 'No games match your filters yet. Try another genre or clear the search.';
        emptyState.className = 'games__subtitle';
        emptyState.hidden = true;
        if (typeof gameGrid.after === 'function') {
            gameGrid.after(emptyState);
        } else if (gameGrid.parentElement) {
            gameGrid.parentElement.insertBefore(emptyState, gameGrid.nextSibling);
        }

        const applyFilters = () => {
            let visibleCount = 0;

            for (const card of gameCards) {
                const matchesFilter = activeFilter === 'all' || card.dataset.genre === activeFilter;
                const title = card.querySelector('.game-card__title')?.textContent?.toLowerCase() ?? '';
                const tags = card.dataset.tags?.toLowerCase() ?? '';
                const matchesSearch = !searchTerm || title.includes(searchTerm) || tags.includes(searchTerm);
                const isVisible = matchesFilter && matchesSearch;
                card.hidden = !isVisible;
                if (isVisible) {
                    visibleCount += 1;
                }
            }

            emptyState.hidden = visibleCount !== 0;
        };

        for (const button of filterButtons) {
            button.addEventListener('click', () => {
                activeFilter = button.dataset.filter ?? 'all';
                for (const other of filterButtons) {
                    other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
                }
                applyFilters();
            });
        }

        if (searchInput instanceof HTMLInputElement) {
            searchInput.addEventListener('input', () => {
                searchTerm = searchInput.value.trim().toLowerCase();
                applyFilters();
            });
        }

        applyFilters();
    }

    const loginCard = document.querySelector('#loginCard');
    const loginForm = document.querySelector('#loginForm');
    const loadingMsg = document.querySelector('#loadingMsg');
    const errorMsg = document.querySelector('#errorMsg');
    const forgotCard = document.querySelector('#forgotForm');
    const forgotLinkContainer = document.querySelector('#forgotLink');
    const forgotLinkTrigger = forgotLinkContainer?.querySelector('a');
    const resetForm = document.querySelector('#resetForm');
    const resetEmail = document.querySelector('#resetEmail');
    const emailLoadingMsg = document.querySelector('#emailLoadingMsg');
    const emailErrorMsg = document.querySelector('#emailErrorMsg');
    const backToLogin = document.querySelector('#backToLogin');

    if (
        loginCard instanceof HTMLElement &&
        loginForm instanceof HTMLFormElement &&
        forgotCard instanceof HTMLElement &&
        forgotLinkTrigger instanceof HTMLAnchorElement &&
        resetForm instanceof HTMLFormElement &&
        backToLogin instanceof HTMLButtonElement
    ) {
        const hideLoginMessages = () => {
            if (loadingMsg) {
                loadingMsg.hidden = true;
            }
            if (errorMsg) {
                errorMsg.hidden = true;
            }
        };

        const hideRecoveryMessages = () => {
            if (emailLoadingMsg) {
                emailLoadingMsg.hidden = true;
            }
            if (emailErrorMsg) {
                emailErrorMsg.hidden = true;
            }
        };

        const showLoginView = () => {
            loginCard.hidden = false;
            forgotCard.hidden = true;
            hideLoginMessages();
            hideRecoveryMessages();
            resetForm.reset();
            if (loginForm.querySelector('input')) {
                const firstInput = loginForm.querySelector('input');
                if (firstInput instanceof HTMLInputElement) {
                    firstInput.focus();
                }
            }
        };

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            hideLoginMessages();
            if (loadingMsg) {
                loadingMsg.hidden = false;
            }

            window.setTimeout(() => {
                if (loadingMsg) {
                    loadingMsg.hidden = true;
                }
                if (errorMsg) {
                    errorMsg.hidden = false;
                }
            }, 2000);
        });

        forgotLinkTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            loginCard.hidden = true;
            forgotCard.hidden = false;
            hideLoginMessages();
            hideRecoveryMessages();
            resetForm.reset();
            if (resetEmail instanceof HTMLInputElement) {
                resetEmail.focus();
            }
        });

        backToLogin.addEventListener('click', () => {
            showLoginView();
        });

        resetForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (emailErrorMsg) {
                emailErrorMsg.hidden = true;
            }
            if (emailLoadingMsg) {
                emailLoadingMsg.hidden = false;
            }

            window.setTimeout(() => {
                if (emailLoadingMsg) {
                    emailLoadingMsg.hidden = true;
                }
                if (emailErrorMsg) {
                    emailErrorMsg.hidden = false;
                }
            }, 2500);
        });

        showLoginView();
    }

    let selectedPlan = { type: 'monthly', price: 5.99 };

    const premiumPage = document.querySelector('#premium-page');
    const paymentPage = document.querySelector('#payment-page');
    const monthlyButton = document.querySelector('#monthly-btn');
    const annualButton = document.querySelector('#annual-btn');
    const backButton = document.querySelector('#back-btn');
    const applyCouponButton = document.querySelector('#apply-coupon-btn');
    const couponInput = document.querySelector('#couponCode');
    const paymentForm = document.querySelector('#payment-form');
    const planTypeEl = document.querySelector('#plan-type');
    const planPriceEl = document.querySelector('#plan-price');
    const totalAmountEl = document.querySelector('#total-amount');
    const loadingOverlay = document.querySelector('#loading-overlay');
    const loadingText = loadingOverlay?.querySelector('.loading-text');
    const errorMessage = document.querySelector('#error-message');

    const stepIds = ['step1', 'step2', 'step3', 'step4'];
    const stepElements = stepIds.map((id) => document.getElementById(id));

    const updateOrderSummary = () => {
        if (planTypeEl) {
            const capitalised = selectedPlan.type.charAt(0).toUpperCase() + selectedPlan.type.slice(1);
            planTypeEl.textContent = capitalised;
        }
        if (planPriceEl) {
            planPriceEl.textContent = `$${selectedPlan.price.toFixed(2)}`;
        }
        if (totalAmountEl) {
            totalAmountEl.textContent = `$${selectedPlan.price.toFixed(2)}`;
        }
    };

    const showPaymentPage = () => {
        if (premiumPage instanceof HTMLElement) {
            premiumPage.hidden = true;
        }
        if (paymentPage instanceof HTMLElement) {
            paymentPage.hidden = false;
        }
        if (errorMessage) {
            errorMessage.hidden = true;
        }
        stepElements.forEach((step) => {
            step?.classList.remove('active', 'completed', 'failed');
        });
        if (loadingText instanceof HTMLElement) {
            loadingText.textContent = 'Processing payment...';
            loadingText.style.color = '';
        }
        updateOrderSummary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const showPremiumPage = () => {
        if (premiumPage instanceof HTMLElement) {
            premiumPage.hidden = false;
        }
        if (paymentPage instanceof HTMLElement) {
            paymentPage.hidden = true;
        }
        if (errorMessage) {
            errorMessage.hidden = true;
        }
        if (loadingOverlay instanceof HTMLElement) {
            loadingOverlay.hidden = true;
        }
        stepElements.forEach((step) => {
            step?.classList.remove('active', 'completed', 'failed');
        });
        if (loadingText instanceof HTMLElement) {
            loadingText.textContent = 'Processing payment...';
            loadingText.style.color = '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const selectPlan = (type, price) => {
        selectedPlan = { type, price };
        showPaymentPage();
    };

    const applyCoupon = () => {
        if (couponInput instanceof HTMLInputElement && couponInput.value.trim() !== '') {
            window.alert('INVALID COUPON CODE. TRY AGAIN!');
        }
    };

    const showProcessingAnimation = () => {
        if (!(loadingOverlay instanceof HTMLElement) || !(loadingText instanceof HTMLElement)) {
            return;
        }

        if (errorMessage) {
            errorMessage.hidden = true;
        }

        loadingOverlay.hidden = false;

        let currentStep = 0;

        const processNext = () => {
            if (currentStep > 0) {
                const previous = stepElements[currentStep - 1];
                previous?.classList.remove('active');
                previous?.classList.add('completed');
            }

            if (currentStep < stepElements.length) {
                stepElements[currentStep]?.classList.add('active');
                const delays = [1200, 2800, 3500, 1800];
                currentStep += 1;
                window.setTimeout(processNext, delays[currentStep - 1] ?? 1500);
            } else {
                window.setTimeout(() => {
                    const finalStep = stepElements[stepElements.length - 1];
                    finalStep?.classList.remove('active');
                    finalStep?.classList.add('failed');

                    loadingText.textContent = 'Payment failed';
                    loadingText.style.color = '#ff968b';

                    window.setTimeout(() => {
                        loadingOverlay.hidden = true;
                        if (errorMessage) {
                            errorMessage.hidden = false;
                            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        stepElements.forEach((step) => {
                            step?.classList.remove('active', 'completed', 'failed');
                        });
                        loadingText.textContent = 'Processing payment...';
                        loadingText.style.color = '';
                    }, 1500);
                }, 800);
            }
        };

        window.setTimeout(processNext, 600);
    };

    if (monthlyButton instanceof HTMLButtonElement) {
        monthlyButton.addEventListener('click', () => {
            selectPlan('monthly', 5.99);
        });
    }

    if (annualButton instanceof HTMLButtonElement) {
        annualButton.addEventListener('click', () => {
            selectPlan('annual', 49.99);
        });
    }

    if (backButton instanceof HTMLButtonElement) {
        backButton.addEventListener('click', () => {
            showPremiumPage();
        });
    }

    if (applyCouponButton instanceof HTMLButtonElement) {
        applyCouponButton.addEventListener('click', () => {
            applyCoupon();
        });
    }

    if (couponInput instanceof HTMLInputElement) {
        couponInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyCoupon();
            }
        });
    }

    const cardNumberInput = document.querySelector('#cardNumber');
    const expiryInput = document.querySelector('#expiryDate');
    const cvvInput = document.querySelector('#cvv');

    if (cardNumberInput instanceof HTMLInputElement) {
        cardNumberInput.addEventListener('input', (event) => {
            const input = event.target;
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            const digits = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
            const formatted = digits.match(/.{1,4}/g)?.join(' ') ?? '';
            input.value = formatted;
        });
    }

    if (expiryInput instanceof HTMLInputElement) {
        expiryInput.addEventListener('input', (event) => {
            const input = event.target;
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            let digits = input.value.replace(/\D/g, '');
            if (digits.length >= 2) {
                digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
            }
            input.value = digits;
        });
    }

    if (cvvInput instanceof HTMLInputElement) {
        cvvInput.addEventListener('input', (event) => {
            const input = event.target;
            if (input instanceof HTMLInputElement) {
                input.value = input.value.replace(/\D/g, '');
            }
        });
    }

    if (paymentForm instanceof HTMLFormElement) {
        paymentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            showProcessingAnimation();
        });
    }
});
