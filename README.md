# Niezapominajka: depozyt dowodów

Prototyp hackathonowy zespołu MeowDevs. System pozwala zabezpieczyć dowody po przemocy seksualnej w szpitalu, przechować próbki bez badania i dać osobie pokrzywdzonej czas na decyzję o zgłoszeniu.

Projekt składa się z trzech części:

| Część | Technologia | Katalog | Port |
|---|---|---|---|
| Backend z dziennikiem zdarzeń | Python, FastAPI, SQLite | `backend` | `8000` |
| Aplikacja szpitala | React, Vite | `szpital/app` | `5173` (domyślnie) |
| Aplikacja osoby pokrzywdzonej | React, Vite | `użytkownik/niezapominajka` | `5174` (domyślnie) |

Dziennik zdarzeń jest odporny na manipulację: każdy wpis zawiera skrót SHA-256 poprzedniego wpisu i podpis Ed25519 osoby z personelu, więc zmiana dowolnego wpisu jest od razu widoczna.

> Wszystkie dane w trybie demonstracyjnym są fikcyjne.

---

## Wymagania

- **Python 3.10** lub nowszy
- **Node.js 18** lub nowszy (zalecamy 20 LTS lub nowszy, bo nowsze wersje Vite go wymagają)
- **npm** (instaluje się razem z Node.js)

Sprawdzenie wersji:

```bash
python --version      # Windows (albo: py --version)
python3 --version     # Linux
node --version
npm --version
```

Wszystkie polecenia poniżej uruchamiaj z katalogu `depozyt`:

```bash
cd depozyt
```

Będziesz potrzebować **trzech okien terminala**: jednego na backend i po jednym na każdą aplikację.

---

## 1. Backend (FastAPI)

Backend zarządza bazą SQLite i podpisami kryptograficznymi. Działa na porcie `8000`.

### Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Jeśli `python3 -m venv` zwraca błąd na Ubuntu lub Debianie, doinstaluj moduł:

```bash
sudo apt install python3-venv
```

### Windows (PowerShell)

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Jeśli PowerShell blokuje aktywację komunikatem o zasadach wykonywania skryptów, zezwól na nie tylko w bieżącym oknie i spróbuj ponownie:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### Windows (wiersz poleceń cmd)

```bat
cd backend
py -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Sprawdzenie

Otwórz w przeglądarce `http://127.0.0.1:8000/docs`. Powinna pojawić się dokumentacja API.

Uwagi:
- `--host 0.0.0.0` udostępnia backend także innym urządzeniom w tej samej sieci, np. telefonowi. Jeśli pracujesz tylko lokalnie, możesz użyć `--host 127.0.0.1`.
- Na Windowsie przy pierwszym uruchomieniu może pojawić się pytanie zapory o dostęp do sieci. Zezwól dla sieci prywatnej.
- Po zakończeniu pracy zatrzymasz serwer skrótem `Ctrl+C`, a środowisko wyłączysz poleceniem `deactivate`.

---

## 2. Aplikacje klienckie (React, Vite)

Obie aplikacje przekazują zapytania `/api` do backendu pod adresem `http://127.0.0.1:8000` przez proxy Vite. Backend musi więc działać, zanim zaczniesz z nich korzystać.

Vite przydziela porty po kolei: pierwsza uruchomiona aplikacja dostaje `5173`, druga `5174`. Uruchamiaj je zawsze w tej samej kolejności, żeby adresy się nie zmieniały.

### Aplikacja szpitala

W nowym oknie terminala, z katalogu `depozyt`:

```bash
cd szpital/app
npm install
npm run dev
```

Adres: `http://localhost:5173`

### Aplikacja osoby pokrzywdzonej

W kolejnym oknie terminala, z katalogu `depozyt`:

Linux:

```bash
cd użytkownik/niezapominajka
npm install
npm run dev
```

Windows (PowerShell i cmd):

```powershell
cd uzytkownik\niezapominajka
npm install
npm run dev
```

Adres: `http://localhost:5174`

`npm install` wystarczy uruchomić raz, przy pierwszym starcie albo po zmianie zależności.

---

## 3. Dane demonstracyjne

Żeby przetestować aplikację bez ręcznego tworzenia kluczy i przechodzenia całej ścieżki od zera, backend ma endpoint, który przywraca system do stanu demonstracyjnego i odtwarza kompletną historię spraw.

Uruchom jedno z poniższych poleceń przy działającym backendzie.

Linux:

```bash
curl -X POST http://127.0.0.1:8000/api/demo/reset -H "accept: application/json"
```

Windows (PowerShell):

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/demo/reset
```

Windows (cmd):

```bat
curl.exe -X POST http://127.0.0.1:8000/api/demo/reset -H "accept: application/json"
```

Możesz też zrobić to w przeglądarce: otwórz `http://127.0.0.1:8000/docs`, znajdź `POST /api/demo/reset` i kliknij **Try it out**, a potem **Execute**.

Poprawna odpowiedź:

```json
{"message": "Database reset and seeded successfully."}
```

Jeśli aplikacje były już otwarte, odśwież je w przeglądarce.

> Reset usuwa wszystkie dane z bazy i wczytuje dane demonstracyjne od nowa.

---

## Szybki start

| Okno | Linux | Windows (PowerShell) |
|---|---|---|
| 1. Backend | `cd depozyt/backend`<br>`source venv/bin/activate`<br>`python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` | `cd depozyt\backend`<br>`.\venv\Scripts\Activate.ps1`<br>`python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| 2. Szpital | `cd depozyt/szpital/app`<br>`npm run dev` | `cd depozyt\szpital\app`<br>`npm run dev` |
| 3. Osoba pokrzywdzona | `cd depozyt/użytkownik/niezapominajka`<br>`npm run dev` | `cd depozyt\użytkownik\niezapominajka`<br>`npm run dev` |
| 4. Dane demo | `curl -X POST http://127.0.0.1:8000/api/demo/reset` | `Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/demo/reset` |

Polecenia z tabeli zakładają, że środowisko i pakiety są już zainstalowane (kroki 1 i 2).

---

## Testowanie na telefonie (opcjonalnie)

Żeby otworzyć aplikację na telefonie w tej samej sieci Wi‑Fi, uruchom Vite z dostępem z sieci:

```bash
npm run dev -- --host
```

Vite wypisze adres sieciowy, np. `http://192.168.1.20:5173`.

Skaner kodów QR korzysta z aparatu, a przeglądarki udostępniają aparat tylko na `localhost` albo przez HTTPS. Na telefonie aplikacja musi więc być otwarta przez HTTPS, np. przez tunel `cloudflared` albo `ngrok` skierowany na port aplikacji szpitala.

---

## Rozwiązywanie problemów

**`python` nie jest rozpoznawane (Windows)**
Użyj `py` zamiast `python` albo zainstaluj Pythona z [python.org](https://www.python.org/downloads/) z zaznaczoną opcją *Add python.exe to PATH*.

**Port 8000 jest zajęty**
Sprawdź, co go używa:

```bash
# Linux
ss -ltnp | grep 8000
```

```powershell
# Windows
netstat -ano | findstr :8000
```

Możesz też uruchomić backend na innym porcie, np. `--port 8001`. Wtedy zmień adres proxy w plikach `vite.config.*` obu aplikacji.

**Aplikacja się ładuje, ale nie ma danych albo widać błędy sieci**
1. Sprawdź, czy backend działa: `http://127.0.0.1:8000/docs`.
2. Sprawdź, czy proxy w `vite.config.*` wskazuje na `http://127.0.0.1:8000`, np.:

   ```js
   server: {
     proxy: {
       "/api": "http://127.0.0.1:8000",
     },
   },
   ```

3. Uruchom reset danych demonstracyjnych (punkt 3) i odśwież stronę.

**Aplikacje zamieniły się portami**
Zatrzymaj obie (`Ctrl+C`) i uruchom je ponownie w kolejności: najpierw szpital, potem aplikacja osoby pokrzywdzonej.

**`curl` w PowerShellu zachowuje się dziwnie**
W starszym Windows PowerShell `curl` jest skrótem do innego polecenia. Użyj `curl.exe` albo `Invoke-RestMethod`, jak w punkcie 3.
