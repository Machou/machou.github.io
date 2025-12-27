---
layout: defaut
title: "Standardiser ma Release"
description: ""
permalink: /release
slug: standardiser-ma-release
canonical_url: https://machou.github.io/release
favicon: /assets/img/favicon-html.png
---

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<li class="breadcrumb-item"><a href="https://machou.github.io/">Accueil</a></li>
		<li class="breadcrumb-item active" aria-current="page">Standardiser ma Release</li>
	</ol>
</nav>

# [Standardiser ma Release](https://machou.github.io/release)

<main class="container">
	<div class="row">
		<div class="col-12 col-lg-8 mx-auto">
			<div class="mb-4">
				<label for="release" class="form-label">Ma Release</label>
				<input type="text" name="rls" class="form-control form-control-lg" id="release" placeholder="Casino.1995.FRENCH.1080p.WEB-DL.H264-Slay3R.mkv">
			</div>

			<div class="d-flex align-items-start gap-2">
				<pre class="border rounded mb-0 px-3 py-4 fs-5 user-select-all flex-grow-1" id="out"></pre>

				<button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="copyBtn" title="Copier">Copier</button>
			</div>
z
			<script>
			document.querySelector('#release').addEventListener('click', function() {
				this.select();
			});

			document.querySelector('#copyBtn').addEventListener('click', function () {
				const text = document.querySelector('#out').innerText.trim();

				navigator.clipboard.writeText(text).then(() => {
					this.textContent = 'Copié ✓';

					setTimeout(() => {
						this.textContent = 'Copier';
					}, 1500);
				});
			});
			</script>
		</div>
	</div>
</main>