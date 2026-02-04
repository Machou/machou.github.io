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

<main class="container p-0">
	<div class="row">
		<div class="col-12 col-lg-8 mx-auto p-0">
			<div class="mb-4">
				<label for="release" class="form-label">Ma Release — <span class="small mb-0">Ne pas inclure les releases <strong class="text-danger">AV1</strong></span></label>
				<input type="text" name="rls" class="form-control form-control-lg" id="release" placeholder="Casino.1995.FRENCH.1080p.WEB-DL.H264-Slay3R.mkv">
			</div>

			<div class="input-group d-none rounded-start" id="outputWrapper">
				<input class="border rounded user-select-all" id="out">
				<button type="button" class="btn btn-outline-secondary" id="copyBtn" title="Copier">Copier</button>
			</div>
		</div>
	</div>
</main>

<script>
const releaseInput = document.querySelector('#release');
const outputWrapper = document.querySelector('#outputWrapper');
const out = document.querySelector('#out');
const copyBtn = document.querySelector('#copyBtn');

releaseInput.addEventListener('click', function () {
	this.select();
});

releaseInput.addEventListener('input', function () {
	const value = this.value.trim();

	if (value === '') {
		outputWrapper.classList.add('d-none');
		out.textContent = '';
	} else {
		outputWrapper.classList.remove('d-none');
		out.value = value;
		out.focus();
		out.select();
	}
});

copyBtn.addEventListener('click', function () {
	const text = out.value.trim();

	if (!text) return;

	navigator.clipboard.writeText(text).then(() => {
		this.textContent = 'Copié ✓';

		setTimeout(() => {
			this.textContent = 'Copier';
		}, 3000);
	});
});
</script>