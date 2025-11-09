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

    if (!gameGrid) {
        return;
    }

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
});
