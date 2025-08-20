<template>
	<!-- Language Selector -->
	<div class="language-selector">
			<select v-model="locale" class="language-dropdown">
				<option v-for="lang in availableLanguages" :key="lang" :value="lang" v-html="lang.toUpperCase()" />
			</select>
	</div>

	<!-- Wrapper -->
	<div id="wrapper">
		<!-- Intro -->
		<section class="intro">
			<header>
				<img class="logo" src="https://teknasyon.com/content/assets/img/logo/teknasyon-logo-white.svg" alt="" />
				<h1>{{ $t('src.views.landing.yerel') }}</h1>
				<p>{{ $t('src.views.landing.we_2') }}</p>
				<ul class="actions">
					<li>
						<a href="#first" class="arrow scrolly"><span class="label">{{ $t('src.views.landing.next') }}</span></a>
					</li>
				</ul>
			</header>
			<div class="content">
				<span class="image fill" data-position="center"><img
						src="https://teknasyon.com/content/uploads/pitstop-2024-flatten-1-min-scaled.jpg"
						alt="" /></span>
			</div>
		</section>

		<!-- Section -->
		<section id="first">
			<header>
				<h2>{{ $t('src.views.landing.what') }}</h2>
			</header>
			<div class="content">
				<p>{{ $t('src.views.landing.discover') }}</p>
			</div>
		</section>

		<!-- Section -->
		<section>
			<header>
				<h2>{{ $t('src.views.landing.our') }}</h2>
			</header>
			<div class="content">
				<p>{{ $t('src.views.landing.as_1') }}</p>

				<!-- Section -->
				<section>
					<header>
						<h3>{{ $t('src.views.landing.b2c') }}</h3>
						<p>{{ $t('src.views.landing.we_1') }}</p>
					</header>
					<div class="content">
						<div class="gallery">
							<a href="images/gallery/fulls/01.jpg" class="landscape"><img
									src="https://teknasyon.com/content/uploads/btb-7-n-1.png" alt="{{ $t('src.views.landing.btb') }}" /></a>
							<a href="images/gallery/fulls/02.jpg"><img
									src="https://teknasyon.com/content/uploads/esim-gorsel-1.png" alt="{{ $t('src.views.landing.esim') }}" /></a>
							<a href="images/gallery/fulls/03.jpg"><img
									src="https://teknasyon.com/content/uploads/lisa-gorsel-1.png" alt="{{ $t('src.views.landing.lisa') }}" /></a>
							<a href="images/gallery/fulls/04.jpg" class="landscape"><img
									src="https://teknasyon.com/content/uploads/gtc-gorsel.png" alt="GTC" /></a>
						</div>
					</div>
				</section>

				<!-- Section -->
				<section>
					<header>
						<h3>{{ $t('src.views.landing.b2b') }}</h3>
						<p>{{ $t('src.views.landing.we') }}</p>
					</header>
					<div class="content">
						<div class="gallery">
							<a href="images/gallery/fulls/05.jpg" class="landscape"><img
									src="https://teknasyon.com/content/uploads/rockads-laptop.png" alt="{{ $t('src.views.landing.rockads') }}" /></a>
							<a href="images/gallery/fulls/06.jpg" class="landscape"><img
									src="https://teknasyon.com/content/uploads/desk-1.png" alt="{{ $t('src.views.landing.desk') }}" /></a>
							<a href="images/gallery/fulls/07.jpg" class="landscape"><img
									src="https://teknasyon.com/content/uploads/zotlo2x.png" alt="{{ $t('src.views.landing.zotlo') }}" /></a>
						</div>
					</div>
				</section>

			</div>
		</section>
		<section>
			<header>
				<h2>{{ $t('src.views.landing.contact') }}</h2>
			</header>
			<div class="content">
				<p>{{ $t('src.views.landing.as') }}</p>
				<form>
					<div class="fields">
						<div class="field half">
							<input type="text" name="name" id="name" placeholder="{{ $t('src.views.landing.name') }}" />
						</div>
						<div class="field half">
							<input type="email" name="email" id="email" placeholder="{{ $t('src.views.landing.email') }}" />
						</div>
						<div class="field">
							<textarea name="message" id="message" placeholder="{{ $t('src.views.landing.your') }}" rows="7"></textarea>
						</div>
					</div>
					<ul class="actions">
						<li>
							<input type="submit" value="{{ $t('src.views.landing.send') }}" class="button primary" />
						</li>
					</ul>
				</form>
			</div>
			<footer>
				<ul class="items">
					<li>
						<h3>{{ $t('src.views.landing.phone') }}</h3>
						<a href="#">+90 212 963 15 50</a>
					</li>
					<li>
						<h3>{{ $t('src.views.landing.address') }}</h3>
						<span>{{ $t('src.views.landing.bykdere') }}</span>
					</li>
				</ul>
			</footer>
		</section>
	</div>

</template>
<script lang="ts" setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, availableLocales } = useI18n();
const availableLanguages = availableLocales;

const userMessage = '$t('src.views.landing.hello_1')';
const userMessageAR = '$t('src.views.landing.mrhba_balaalm')';
const userMessageJP = '$t('src.views.landing.cjk_text_way2_2')';
const userMessageHB = '$t('src.views.landing.hebrew_text_4tz5')';
const userMessageKR = '$t('src.views.landing.latin_text_454p')';

const messages = {
  // İngilizce
  english: "$t('src.views.landing.hello')",
  
  // Türkçe
  turkish: "$t('src.views.landing.merhaba')",
  
  // Arapça
  arabic: "$t('src.views.landing.mrhba_bkm_fy')",

	hebrew: "$t('src.views.landing.hebrew_text_yixa')",

  // Çince (Basitleştirilmiş)
  chinese: "$t('src.views.landing.cjk_text_way2_1')",
  
  // Japonca
  japanese: "$t('src.views.landing.cjk_text_way2')",
  
  // Rusça
  russian: "$t('src.views.landing.cyrillic_text_rf21')",
  
  // Hintçe (Devanagari)
  hindi: "$t('src.views.landing.devanagari_text_mlxb')",
  
  // İspanyolca
  spanish: "$t('src.views.landing.bienvenido')",
  
  // Fransızca
  french: "$t('src.views.landing.bienvenue')",
  
  // Technical strings (filtrelenmeli)
  apiUrl: "https://api.example.com/users",
  className: "btn-primary",
  functionName: "handleUserClick",
  
  // Kod benzeri (filtrelenmeli)
  constant: "API_KEY_123",
  short: "OK"
};

console.log('User Message:', messages, userMessage, userMessageAR, userMessageJP, userMessageHB, userMessageKR);

watch(locale, (newLocale) => {
	console.log('Locale changed to:', newLocale);
});
</script>

<style scoped>
.language-selector {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 1000;
}

.language-dropdown {
	background: rgba(255, 255, 255, 0.95);
	border: 1px solid rgba(0, 123, 255, 0.2);
	border-radius: 8px;
	padding: 8px 12px;
	font-size: 14px;
	font-weight: 500;
	color: #2c3e50;
	cursor: pointer;
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	min-width: 60px;
	text-align: center;
}

.language-dropdown:hover {
	border-color: #007bff;
	box-shadow: 0 4px 20px rgba(0, 123, 255, 0.2);
	transform: translateY(-1px);
}

.language-dropdown:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.language-dropdown option {
	background: white;
	color: #2c3e50;
	padding: 8px;
}
</style>
