function toggleTable(showId, hideId) {
	document.getElementById(showId).style.display = '';
	document.getElementById(hideId).style.display = 'none';
}

// Graphique Numéros
new Chart(document.getElementById("chartNumbers"), {
	type: "bar",
	data: {
		labels: {{ js.numbers_labels }},
		datasets: [{
			label: 'Sorties',
			data: {{ js.numbers_data }},
			backgroundColor: "#3498db",
			borderRadius: 4
		}]
	},
	options: { responsive: true }
});

// Graphique Étoiles
new Chart(document.getElementById("chartStars"), {
	type: "bar",
	data: {
		labels: {{ js.stars_labels }},
		datasets: [{
			label: 'Sorties',
			data: {{ js.stars_data }},
			backgroundColor: "#f1c40f",
			borderRadius: 4
		}]
	},
	options: { responsive: true }
});

// Graphique Multi-axe
new Chart(document.getElementById("multiAxisChart"), {
	type: 'line',
	data: {
		labels: {{ js.multi_labels }},
		datasets: [
			{
				label: 'Occurrences',
				data: {{ js.multi_data_count }},
				yAxisID: 'y',
				borderColor: '#3498db',
				backgroundColor: '#3498db',
				tension: 0.3
			},
			{
				label: 'Pourcentage (%)',
				data: {{ js.multi_data_percent }},
				yAxisID: 'y1',
				borderColor: '#e74c3c',
				backgroundColor: '#e74c3c',
				tension: 0.3
			}
		]
	},
	options: {
		responsive: true,
		interaction: { mode: 'index', intersect: false },
		scales: {
			y: { type: 'linear', display: true, position: 'left' },
			y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
		}
	}
});