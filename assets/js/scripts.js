// Fancybox — https://fancyapps.com/fancybox/api/options/

Fancybox.bind('[data-fancybox="gallery"]', {
	l10n: Fancybox.l10n.fr,

	Carousel: {
	infinite: true,
},
Slideshow: {
	// playOnStart: true,
	// timeout: 3000,
},
Toolbar: {
	display: {
		left: ['infobar'],
		// middle: [
		// 	'zoomIn',
		// 	'zoomOut',
		// 	'toggle1to1',
		// 	'rotateCCW',
		// 	'rotateCW',
		// 	'flipX',
		// 	'flipY',
		// ],
		right: ['slideshow', 'download', 'thumbs', 'close'],
	},
},
Images: {
	zoom: true,
},
Thumbs: {
	type: 'modern', // classic
	}
});

// Remonter la page

const remonterPage = document.querySelector('#remonterPage');
let scrollTimeout;

function handleScroll() {
	if (window.scrollY > 300) {
		remonterPage.style.display = 'block';

		clearTimeout(scrollTimeout);

		scrollTimeout = setTimeout(() => {
			remonterPage.style.display = 'none';
		}, 1500);
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