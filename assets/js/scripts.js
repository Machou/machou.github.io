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