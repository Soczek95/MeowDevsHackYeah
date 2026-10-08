# Model zagrożeń

Dokument opisuje, przed kim i przed czym chroni Niezapominajka w obecnym prototypie oraz jakie ryzyka zostają. Tam, gdzie prototyp upraszcza rozwiązanie na potrzeby pokazu, mówimy o tym wprost.

## Przeciwnicy

1. **Osoba stosująca przemoc**, która ma dostęp do telefonu albo komputera osoby pokrzywdzonej. Może przeglądać historię przeglądarki, pliki i powiadomienia, ale nie jest ekspertem od kryminalistyki cyfrowej.
2. **Osoba z dostępem do bazy danych**, na przykład nieuczciwy pracownik, administrator albo włamywacz, która chce zmienić historię próbki tak, żeby nikt tego nie zauważył.
3. **Osoba podszywająca się** pod osobę pokrzywdzoną (zna kod sprawy) albo pod personel szpitala.
4. **Atakujący w sieci**, który podsłuchuje albo modyfikuje ruch między przeglądarką a serwerem.

## Cele ochrony

W kolejności ważności:

1. **Bezpieczeństwo osoby pokrzywdzonej:** korzystanie z systemu nie może jej narażać.
2. **Decyzja należy do osoby pokrzywdzonej:** tylko osoba z kluczem może przekazać sprawę, przedłużyć przechowanie albo ją zamknąć.
3. **Integralność łańcucha dowodowego:** da się wykazać, że historii próbki nikt nie zmienił.
4. **Poufność:** system wie o sprawie jak najmniej.
5. **Dostępność:** próbki i ich historia nie mogą łatwo przepaść.

## Zagrożenia, zabezpieczenia i ryzyka, które zostają

| # | Zagrożenie | Co robi Niezapominajka | Co zostaje (ryzyko rezydualne) |
|---|---|---|---|
| 1 | Przeciwnik przegląda telefon | Nie ma aplikacji do zainstalowania ani konta. Klucz sprawy nie jest zapisywany w przeglądarce, tylko trzymany w pamięci strony. | Adres strony zostaje w historii przeglądarki. Pobrany plik z kodem i kluczem trafia do folderu pobranych plików. Strona wypisuje kod i klucz w konsoli przeglądarki (`console.log`), co trzeba usunąć. |
| 2 | Przeciwnik podchodzi w trakcie | Kwiatek w nagłówku natychmiast przenosi na neutralną stronę przez `location.replace`, więc przycisk „Wstecz” do niej nie wraca. | Strona główna nie ma jeszcze przycisku szybkiego wyjścia. Kilka sekund widoczności, zanim osoba zareaguje. |
| 3 | Odgadnięcie klucza sprawy | Klucz ma 16 znaków z alfabetu 31 znaków (około 2⁷⁹ możliwości) i jest losowany przez moduł `secrets`. Serwer przechowuje tylko skrót SHA-256. | Brak limitu prób logowania. Przy tej długości klucza zgadywanie jest niepraktyczne, ale limit trzeba dodać przed wdrożeniem. |
| 4 | Podmiana wpisu w bazie | Każdy wpis zawiera skrót poprzedniego i podpis Ed25519. `GET /api/ledger/verify` wskazuje pierwszy zmieniony wpis (pokaz: `POST /api/demo/tamper`). | **W prototypie klucze prywatne są w tej samej bazie**, a podpisy składa serwer. Osoba z pełnym dostępem do bazy mogłaby przeliczyć i podpisać łańcuch od nowa. Docelowo klucze zostają na urządzeniach personelu, a skróty łańcucha są regularnie zapisywane poza systemem (tabela `anchors` jest na to przygotowana). |
| 5 | Usunięcie ostatnich wpisów | Każdy wpis ma kolejny numer w obrębie sprawy. | Usunięcie wpisów z końca łańcucha nie przerywa go. Wykryje to dopiero zewnętrzne zapisywanie skrótów (punkt 4). |
| 6 | Podszywanie się pod personel | Backend przyjmuje tylko dozwolone przejścia stanów próbki. | **Prototyp nie ma logowania personelu.** Aplikacja szpitala działa jako jedna osoba demonstracyjna (`ST-A41`), a nagłówek `X-Staff-Token` nie jest sprawdzany. Każdy z dostępem do API może przyjąć sprawę albo zmienić status próbki. |
| 7 | Przekazanie sprawy policji bez zgody | Decyzja `RELEASE` wymaga klucza sprawy i jest możliwa tylko dla próbek w depozycie. Otwarcie pakietu przez policję zapisuje się w dzienniku jako `UZYSKANO_DOSTEP`. | Token pakietu ma 8 znaków szesnastkowych, nie wygasa i nie ma limitu prób. Przed wdrożeniem potrzebny jest dłuższy token z terminem ważności albo uwierzytelnienie policji. |
| 8 | Wyciek bazy danych | Baza nie zawiera nazwisk, danych kontaktowych, danych medycznych ani wyników badań. | Daty, typy próbek i identyfikator szpitala nadal są wrażliwe. Przed pilotażem potrzebna jest ocena skutków dla ochrony danych (DPIA). |
| 9 | Podsłuch w sieci | Aplikacja szpitala działa lokalnie przez HTTPS, bo wymaga tego aparat. | Strona osoby pokrzywdzonej i backend działają lokalnie przez HTTP, a CORS jest otwarty dla wszystkich adresów. W każdym wdrożeniu poza komputerem deweloperskim potrzebne są HTTPS i ograniczony CORS. |
| 10 | Wyczyszczenie bazy przez obce żądanie | Endpointy demonstracyjne są wydzielone pod `/api/demo`. | `POST /api/demo/reset` usuwa wszystkie dane i jest dostępny bez uwierzytelnienia. Poza pokazem musi być wyłączony. |
| 11 | Utrata klucza przez osobę pokrzywdzoną | Klucz można zapisać w pliku razem z kodem QR. | Bez klucza nikt nie może podjąć decyzji, co jest celowe. Procedurę odzyskania, na przykład osobiście w placówce, trzeba zaprojektować w pilotażu. |
| 12 | Obowiązek zawiadomienia | Przed utworzeniem sprawy strona informuje, kiedy personel musi powiadomić policję. | Lista na stronie nie obejmuje wszystkich czynów z art. 240 § 1 kodeksu karnego, na przykład art. 198. Szczegóły w [research prawny](research-prawny.md). |

## Poza zakresem prototypu

- Oprogramowanie szpiegujące zainstalowane na telefonie osoby pokrzywdzonej.
- Fizyczne bezpieczeństwo próbek, plomb i chłodni. To zadanie placówki i zakładu medycyny sądowej, a system śledzi tylko historię zdarzeń.
- Atak osoby, która ma jednocześnie dostęp do serwera i do kluczy wszystkich osób z personelu.
