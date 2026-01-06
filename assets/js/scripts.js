// Théme Clair / Sombre
(() => {
    const STORAGE_KEY = 'theme';
    const toggleBtn = document.querySelector('#changerTheme');
    const html = document.documentElement;

    if (!toggleBtn) return;

    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        if (theme === 'sombre') {
            toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Clair';
        } else {
            toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Sombre';
        }
    };

    // Init
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'clair';
    setTheme(savedTheme);

    // Toggle
    toggleBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        setTheme(current === 'sombre' ? 'clair' : 'sombre');
    });
})();

// Fancybox - https://fancyapps.com/fancybox/api/options/

Fancybox.bind('[data-fancybox="gallerie"]', {
    l10n: Fancybox.l10n.fr_FR,
    zoomEffect: false,
    Toolbar: {
        display: {
            left: ['infobar'],
            middle: ['zoomIn', 'zoomOut', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
            right: ['download', 'thumbs', 'close'],
        }
    }
});

// Remonter la page

const remonterPage = document.querySelector('#remonterPage');
if (remonterPage) {
    let scrollTimeout;

    function handleScroll() {
        if (window.scrollY > 300) {
            remonterPage.style.display = 'block';

            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                remonterPage.style.display = 'none';
            }, 2000);
        } else {
            remonterPage.style.display = 'none';
        }
    }

    window.addEventListener('scroll', handleScroll);

    remonterPage.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}