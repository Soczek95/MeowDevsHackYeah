# Research prawny

**Stan weryfikacji: 8 października 2026 r.** Fakty sprawdzono na stronach instytucji, w tekstach aktów prawnych i w źródłach wymienionych przy każdej pozycji.

> [!CAUTION]
> To nie jest porada prawna. Dokument zbiera przepisy i fakty potrzebne do zaprojektowania systemu. Każde zastosowanie w konkretnej sprawie wymaga konsultacji z prawniczką lub prawnikiem.

| Znak | Znaczenie |
|---|---|
| ✅ | Zweryfikowane w źródle pierwotnym: tekst aktu albo oficjalna strona instytucji. |
| 🟡 | Sprawdzone w źródle wtórnym, na przykład w serwisie z tekstami przepisów albo w omówieniu organizacji. |
| ❓ | Otwarte pytanie, które wymaga konsultacji. Nie zgadujemy. |

## Najważniejsze wnioski dla projektu

1. ❓ **W Polsce nie ma dziś ogólnokrajowej procedury zabezpieczania dowodów po przemocy seksualnej bez zgłoszenia sprawy.** Dlatego pierwszym etapem wdrożenia jest analiza prawna. Docelowo potrzebna jest regulacja ustawowa, tak jak w Szkocji.
2. ✅ **Zgwałcenie jest ścigane z urzędu od 27 stycznia 2014 r.** Po zgłoszeniu postępowanie toczy się niezależnie od późniejszej woli osoby pokrzywdzonej, więc system musi o tym uprzedzić przed decyzją o przekazaniu sprawy policji. ([Informacyjny Serwis Policyjny](https://isp.policja.pl/isp/aktualnosci/4774,Wchodza-w-zycie-zmiany-dotyczace-scigania-sprawcow-gwaltow.html))
3. 🟡 **Art. 240 § 1 kodeksu karnego nakłada obowiązek zawiadomienia** na każdego, kto ma wiarygodną wiadomość o czynach z listy, w tym z art. 197 § 3–5 (m.in. zgwałcenie wspólnie z inną osobą albo wobec małoletniego poniżej 15 lat), art. 198 (wykorzystanie bezradności) i art. 156 (ciężki uszczerbek na zdrowiu). Osoba pokrzywdzona nie podlega karze za niezawiadomienie (§ 2a). ([Standardy Prawa, art. 240 kk](https://standardyprawa.pl/akt/1/art/368))
4. ❓ **Art. 198 może obejmować sytuacje po podaniu substancji**, gdy sprawca wykorzystał bezradność osoby. Ekran poufności w aplikacji wymienia dziś wiek poniżej 15 lat, kilku sprawców i poważne obrażenia, ale nie wymienia tej sytuacji. Kwalifikację i zakres obowiązku personelu medycznego trzeba sprawdzić z prawnikami.
5. ❓ **Wartość dowodowa próbek** zabezpieczonych bez zgłoszenia zależy od procedury, którą zaakceptują prokuratura i zakład medycyny sądowej. System dokumentuje, kto, kiedy i gdzie wykonał każdą czynność, ale akceptację trzeba potwierdzić w pilotażu.
6. 🟡 **Pilotaż może sfinansować samorząd.** Art. 48 ust. 1 ustawy o świadczeniach opieki zdrowotnej finansowanych ze środków publicznych pozwala ministrom i jednostkom samorządu terytorialnego opracowywać, wdrażać, realizować i finansować programy polityki zdrowotnej. ([Lexlege, art. 48](https://lexlege.pl/ustawa-o-swiadczeniach-opieki-zdrowotnej-finansowanych-ze-srodkow-publicznych/art-48/))
7. ❓ **Ochrona danych.** Przed pilotażem trzeba ustalić administratora danych i przeprowadzić ocenę skutków dla ochrony danych (DPIA), bo sam fakt prowadzenia sprawy jest informacją bardzo wrażliwą.

## Szkocja: model, na którym się wzorujemy

| Fakt | Status | Źródło |
|---|---|---|
| Publiczne zarządy zdrowia (health boards) mają ustawowy obowiązek prowadzić badania sądowo-lekarskie i przechowywać dowody, także bez zgłoszenia na policję. | ✅ | [Forensic Medical Services (Victims of Sexual Offences) (Scotland) Act 2021, Explanatory Notes](https://www.legislation.gov.uk/asp/2021/3/notes?view=plain) |
| Samodzielne zabezpieczenie dowodów jest niedostępne dla osób poniżej 16 lat. | ✅ | jw. |
| Prośba o zniszczenie dowodów ma 30 dni na zmianę zdania. | ✅ | jw. |
| Przepisy o okresie przechowania obowiązują od 1 kwietnia 2022 r. | ✅ | [SSI 2022/89, reg. 1](https://www.legislation.gov.uk/ssi/2022/89/regulation/1/made) |
| Dowody są przechowywane przez 26 miesięcy. | ✅ | [projekt rozporządzenia, reg. 2](https://www.legislation.gov.uk/sdsi/2022/9780111053171/contents), [NHS inform](https://www.nhsinform.scot/turn-to-sarcs/7-days-and-under/what-happens-to-evidence-from-a-forensic-medical-examination-fme) |
| Próbki nie są badane, dopóki sprawa nie zostanie zgłoszona na policję. | ✅ | [NHS inform](https://www.nhsinform.scot/turn-to-sarcs/7-days-and-under/what-happens-to-evidence-from-a-forensic-medical-examination-fme) |
| Usługę świadczy NHS dla osób od 16. roku życia. | 🟡 | [Scottish Women’s Rights Centre](https://www.scottishwomensrightscentre.org.uk/news/news/the-forensic-medical-services-act-what-you-need-to-know/) |

Niezapominajka przejmuje z tego modelu cztery zasady: badanie bez zgłoszenia, przechowanie bez analizy, decyzję osoby pokrzywdzonej i 30 dni na zmianę zdania przy zniszczeniu. Domyślny okres przechowania w prototypie to 12 miesięcy z możliwością przedłużenia, a docelowy powinien określić przepis.

## Szwecja

| Fakt | Status | Źródło |
|---|---|---|
| Zaleca się przechowywanie zestawu z zabezpieczonymi śladami w ramach ochrony zdrowia przez dwa lata od badania. | ✅ | [NCK, Uppsala universitet](https://www.uu.se/centrum/nck/for-yrkesverksamma/webbstodforvarden/omhandertagande-och-sparsakring/omhandertagande-och-sparsakring-efter-sexuellt-overgrepp/fragor-och-svar-om-undersokning-efter-sexuellt-overgrepp) |

## Dane i fakty medyczne użyte w aplikacji i prezentacji

| Fakt | Status | Źródło |
|---|---|---|
| Substancja nazywana pigułką gwałtu znika z krwi po 8 godzinach, a po 12 nie da się jej wykryć w moczu. | ✅ | [Policja.pl, Szklanka pod kontrolą](https://policja.pl/pol/aktualnosci/56124,Szklanka-pod-kontrola.html) |
| 94,1% przypadków przemocy seksualnej, których doświadczyły badane kobiety, nie zgłoszono na policję (Fundacja STER, 2016). | 🟡 | [Feminoteka, Skutki przemocy seksualnej](https://feminoteka.pl/edukacja/skutki-przemocy-seksualnej) |
| Praktyczne informacje o zabezpieczaniu śladów i pomocy medycznej po przemocy seksualnej. | 🟡 | [Feminoteka, Praktyczne informacje dla osób pokrzywdzonych](https://feminoteka.pl/edukacja/poradnik-dla-pokrzywdzonych) |

## Telefony pomocowe

| Numer | Kiedy i dla kogo | Status | Źródło |
|---|---|---|---|
| 888 88 33 88 (Feminoteka) | pon.–pt., 11:00–19:00, kobiety i dziewczęta powyżej 15. roku życia | ✅ | [feminoteka.pl](https://feminoteka.pl/uzyskaj-pomoc/telefon-przeciwprzemocowy) |
| 800 107 777 (Centrum Praw Kobiet) | linia interwencyjna całodobowo po wybraniu 9 | ✅ | [cpk.org.pl](https://cpk.org.pl/pomoc/pomoc-telefoniczna/) |
| 800 120 002 (Niebieska Linia) | całodobowo, osoby doznające przemocy domowej i świadkowie | ✅ | [niebieskalinia.info](https://niebieskalinia.info/kontakt/telefon/) |
| 116 111 (Telefon Zaufania dla Dzieci i Młodzieży) | codziennie, całą dobę | ✅ | [116111.pl](https://116111.pl/) |
| 112 | numer alarmowy | ✅ | |
