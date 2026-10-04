import { useEffect } from 'react'
import './App.css'

export default function MainPage({ onNavigate, onOpenAccess }) {
	// Efekt wykrywający przewijanie strony
	useEffect(() => {
		const handleScroll = () => {
			const infoSections = document.querySelector('.info-sections')
			if (infoSections) {
				if (window.scrollY > 100) {
					infoSections.classList.add('visible')
				} else {
					infoSections.classList.remove('visible')
				}
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div className='layout-container'>
			<header className='header-section'>
				<h1 className='logo'>niezapominajka</h1>

				<div className='header-right'>
					<nav className='nav-menu'>
						<ul>
							<li>
								<a href='#uzyskaj-pomoc'>uzyskaj pomoc</a>
							</li>
							<li>
								<a href='#o-nas'>o nas</a>
							</li>
							<li>
								<a href='#cel'>cel</a>
							</li>
							<li>
								<a href='#kontakt'>kontakt</a>
							</li>
						</ul>
					</nav>

					<button className='login-btn' aria-label='Profil' onClick={onOpenAccess}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='32'
							height='32'
							viewBox='0 0 24 24'
							fill='none'
							stroke='white'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
							<circle cx='12' cy='7' r='4'></circle>
						</svg>
					</button>
				</div>
			</header>

			<main className='main-content'>
				<section className='hero-section'>
					<h2 className='support-heading'>Anonimowo. Bez presji. Na Twoich zasadach.</h2>

					<p className='support-description'>
						Możesz bezpiecznie zabezpieczyć ślady medyczne już teraz, a o ewentualnym zgłoszeniu na policję zdecydować
						później.
						<br />
						Ta decyzja należy tylko i wyłącznie do Ciebie.
					</p>

					{/* Przycisk i tekst trafiają tutaj (w miejsce zielone) */}
					<button type='button' className='support-button' onClick={onNavigate}>
						Przejdź do formularza
					</button>

					<p className='support-microcopy'>
						To nie była Twoja wina. <br></br> Winę zawsze ponosi sprawca, niezależnie od tego, czy w sytuacji pojawił
						się alkohol, narkotyki, czy od tego, co miałaś/miałeś na sobie.
					</p>
				</section>

				{/* Sekcje ukryte do momentu przewinięcia strony w dół */}
				<section className='info-sections'>
					{/* Dodana sekcja "NIE jesteś sam/a..." na samym początku */}
					<div className='text-block' id='uzyskaj-pomoc'>
						<h3>
							Gdzie szukać wsparcia?
							<br />
							Nie musisz przez to przechodzić w pojedynkę:
						</h3>

						<p>
							→ <strong>Fundacja Feminoteka: 888 88 33 88</strong> (pon.-pt. w godz. 11:00–19:00). Specjalistyczna,
							poufna pomoc psychologiczna i prawna dla kobiet, które doświadczyły przemocy seksualnej.
						</p>

						<p>
							→ <strong>Centrum Praw Kobiet: 800 107 777</strong> (całodobowo). Ogólnopolski telefon interwencyjny
							zapewniający natychmiastowe wsparcie i pomoc w kryzysie.
						</p>

						<p>
							→ <strong>Niebieska Linia: 800 120 002</strong> (całodobowo). Ogólnopolskie pogotowie oferujące wsparcie
							psychologiczne dla wszystkich osób doświadczających przemocy (niezależnie od płci).
						</p>

						<p>
							→ <strong>Bezpośrednie zagrożenie: 112</strong>. Jeśli czujesz, że grozi Ci niebezpieczeństwo lub
							potrzebujesz pilnej pomocy medycznej, zadzwoń pod numer alarmowy.
						</p>
						<p>
							→ <strong>Telefon Zaufania dla Dzieci i Młodzieży: 116 111</strong> (całodobowo). Bezpłatna pomoc i
							wsparcie dla dzieci oraz młodzieży.
						</p>
					</div>

					<div className='text-block' id='o-nas'>
						<h3>O nas:</h3>
						<p>
							Niezapominajkę tworzy zespół MeowDevs, studenci Politechniki Śląskiej w Gliwicach. Projekt powstał podczas
							hackathonu HackYeah 2026.
						</p>
						<p>
							Wiele osób po przemocy seksualnej nie jest gotowych, by od razu zgłosić sprawę na policję. Dziś często
							oznacza to utratę dowodów. Chcemy, żeby dało się je zabezpieczyć w szpitalu bez zgłoszenia, a decyzję o
							dalszych krokach zostawić osobie pokrzywdzonej, bez presji i pośpiechu.
						</p>
						<p>
							Korzystamy z doświadczeń Szkocji, Anglii i Szwecji, gdzie podobne rozwiązania już działają, oraz z
							materiałów organizacji pomagających osobom po przemocy.
						</p>
						<p>Niezapominajka jest na razie tylko prototypem.</p>
					</div>
					<div className='text-block' id='cel'>
						<h3>Cel:</h3>
						<p>
							Niezapominajka to projekt tworzony całkowicie od podstaw podczas tego hackathonu (przed wydarzeniem nie
							zrealizowano żadnych prac programistycznych). Naszym celem jest dostarczenie działającego prototypu, który
							obejmuje całą ścieżkę dowodową (end-to-end). System składa się z: interfejsu dla osoby pokrzywdzonej
							(zegar dowodowy i mapa szpitali), dedykowanej aplikacji dla szpitali (obsługa kodów QR, plombowanie
							próbek), bezpiecznego depozytu z podpisanym dziennikiem przechowywania oraz ekranu decyzji chronionego
							osobistym kluczem.
						</p>
					</div>
				</section>
			</main>

			<footer className='footer-section' id='kontakt'>
				Skontaktuj się z nami! niezapominajka@mail.com &nbsp;&nbsp; +48 123 456 789
			</footer>
		</div>
	)
}
