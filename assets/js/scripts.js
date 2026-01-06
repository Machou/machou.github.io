// Théme Clair / Sombre

(() => {
	const key = 'theme';
	const html = document.documentElement;
	const btn = document.querySelector('#themeToggle');

	const setTheme = (theme) => {
		html.setAttribute('data-bs-theme', theme);
		localStorage.setItem(key, theme);
		btn.textContent = theme === 'dark' ? '☀️ Clair' : '🌙 Sombre';
	};

	setTheme(localStorage.getItem(key) || 'light');

	btn.addEventListener('click', () => {
		setTheme(
			html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'
		);
	});
})();

// Fancybox - https://fancyapps.com/fancybox/api/options/

document.addEventListener('DOMContentLoaded', () => {
	if (typeof Fancybox === 'undefined') return;

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