# HASZNÁLATI ÚTMUTATÓ
# DocuReview – Webes Dokumentum-Véleményező és Korrektúra Rendszer
# [Teszt verzió!]
Üdvözöljük a DocuReview használati útmutatójában! Ez a dokumentum részletesen bemutatja a rendszer működését, a különböző felhasználói szerepkörökhöz tartozó munkafolyamatokat, valamint a beépített tesztkörnyezet használatát.

## 📌 1. A Rendszer Áttekintése és Célja

A DocuReview egy vállalati szintű, szerepkör-alapú webalkalmazás, amely belső dokumentumok (szabályzatok, szerződések, megállapodások és tervezetek) strukturált egyeztetésére, javítására és jóváhagyására szolgál. A rendszer célja, hogy kiváltsa a kaotikus e-mailes verziókövetést egy biztonságos, auditálható, visszakövethető és automatizált munkafolyamattal.

### Főbb jellemzők:

- Valódi Word (.docx) megőrzés: A feltöltött eredeti dokumentumok és a jóváhagyott végleges változatok bináris (Base64) formátumban tárolódnak, így a letöltésnél a dokumentumok megőrzik az eredeti margókat, egyedi stílusokat, fejléceket/lábléceket és formázásokat.
Bekezdés-szintű célzás: A véleményezők nem az egész szöveget írják át ömlesztve, hanem bekezdésről bekezdésre tehetnek pontos javítási javaslatokat.

- Valós idejű összefűzés: A jóváhagyó döntései (elfogadás/elutasítás) alapján a rendszer automatikusan és azonnal frissíti a dokumentum folyó szövegét.
Adatperzisztencia: Minden adat a böngésző biztonságos helyi tárhelyén (localStorage) perzisztálódik, így a munkafolyamat állapota nem vész el.

## 🔐 2. Szerepkörök és Jogosultságok

A rendszerben `négy különböző szerepkör` létezik, amelyek szigorú jogkörrel  rendelkeznek:

- Beterjesztő (Submitter): A dokumentumok gazdája. Új tervezeteket tölthet fel (.docx/.txt formátumban), követheti a véleményezési folyamatot, és letöltheti a lezárt, véglegesített dokumentumokat.

- Véleményező (Reviewer): A szakmai ellenőr. Bekezdés-szintű javítási javaslatokat (korrektúrákat) tehet indoklással, és a véleményezés végén továbbíthatja a dokumentumot jóváhagyásra.

- Jóváhagyó (Approver): A döntéshozó vezető. Elbírálja (elfogadja vagy elutasítja) a javasolt korrektúrákat, majd a dokumentumot véglegesen lezárja (zárolja és aláírja).

- Rendszergazda (Admin): A platform kezelője. Felhasználói fiókokat regisztrálhat, szerkeszthet és törölhet, valamint monitorozza a VPS erőforrásait és Docker állapotát.

## 👥 3. Beépített Tesztfelhasználók (Demonstrációs Hozzáférések)

A bejelentkező képernyőn a gyors tesztelés érdekében az alábbi előre definiált fiókok állnak rendelkezésre:

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Kovács Péter** | Beterjesztő (Submitter) | `kovacs.peter@vps.hu` | `beterjeszto123` |
| **Szabó Anna** | Véleményező (Reviewer)  | `szabo.anna@vps.hu` | `velemenyezo123` |
| **Tóth Gábor** |Jóváhagyó (Approver)  | `toth.gabor@vps.hu` | `jovahagyo123` |
| **Nagy Zsolt** | Administrator (Admin) | `admin@vps.hu` | `adminsecure123` |

## 4. A Dokumentum Életciklusa (Státuszok)

Egy dokumentum az alábbi állapotokon megy keresztül:

- Tervezet (Draft): A Beterjesztő által feltöltött vagy sablonból létrehozott dokumentum, amely még szerkeszthető, és nincs beküldve véleményezésre.
- Véleményezés alatt (Under Review): A beterjesztett dokumentum. A Véleményezők láthatják és korrektúrázhatják.
- Véleményezett (Reviewed): A Véleményező befejezte a munkát és lezárta a véleményezési szakaszt. A dokumentum a Jóváhagyó elé kerül.
- Jóváhagyva / Lezárva (Approved): A Jóváhagyó elbírálta a javaslatokat és véglegesítette a dokumentumot. Ebben a státuszban a dokumentum zárolva van, nem módosítható, és letölthető a végleges változat.

## 💻 5. Részletes Használati Útmutató Szerepkörök Szerint

### 📥 5.1. Beterjesztő (Submitter) Munkafolyamat

A Beterjesztő a `Beterjesztői Irányítópult` felületen dolgozik.

#### A) Új dokumentum létrehozása / feltöltése:

- Feltöltés `drag-and-drop` módszerrel: \
Húzza be a kívánt .docx vagy .txt fájlt a szaggatott vonallal jelzett `feltöltő zónába`, vagy kattintson rá a tallózáshoz.
A felugró ablakban állítsa be a `Véleményezési határidőt` és adjon meg egy opcionális megjegyzést a véleményezőknek.
Kattintson a `Fájl importálása és beküldése` gombra. A rendszer beolvassa a szöveget, miközben a háttérben biztonságosan tárolja az eredeti Word fájl binárisát a formázások megtartásához.

- Feltöltés `tallózással`: \
Kattintson a `feltöltő zónára` és adja meg a feltöltendő fájl nevét és elérési útvonalát.

#### B) Dokumentumok nyomon követése és kezelése:

- Aktív folyamatok: A bal oldali listában láthatja a saját beterjesztett dokumentumait a státuszukkal (pl. Véleményezés alatt, Véleményezett, Jóváhagyva).
Részletek megtekintése: Kattintson egy dokumentumra a listában, hogy megtekinthesse annak bekezdéseit, a jelenlegi módosításokat, a beállított határidőt, valamint a teljes dokumentum-történetet (naplót).

- Határidő meghosszabbítása (Extension):
Ha a véleményezési határidő közeledik, a Beterjesztő a dokumentum részletes nézetében kezdeményezheti a határidő meghosszabbítását.
*Szabály*: A határidő legfeljebb 1 alkalommal hosszabbítható meg a folyamat integritásának biztosítása érdekében!
`Törlés`: A még el nem fogadott vagy szükségtelenné vált tervezetek a kuka ikonra kattintva törölhetők.

### 📝 5.2. Véleményező (Reviewer) Munkafolyamat
A Véleményező a `Szakmai Véleményező Workbench` felületen dolgozik.

#### A) Dokumentum kiválasztása:
A bal oldali `Véleményezésre váró dokumentumok` listából válassza ki azt a dokumentumot, amelyet át szeretne vizsgálni.

#### B) Korrektúrák és javaslatok tétele:
Kattintson arra a bekezdésre a dokumentum törzsében, amelyet módosítani vagy véleményezni szeretne. A bekezdés kijelölésre kerül, és a jobb oldalon megnyílik a `Javaslat tétele` panel.

Válasszon a 4 módosítási típus közül:
- Módosítás / Csere (Modify): Írja be a javasolt új szöveget, amely felváltaná a kijelölt bekezdést.
- Törlés (Delete): Javasolja a teljes bekezdés törlését.
- Beszúrás (Insert): Írja be a szöveget, amelyet közvetlenül a kijelölt bekezdés után szeretne beilleszteni.
- Megjegyzés / Jegyzet (Comment): Írjon szakmai megjegyzést a bekezdéshez anélkül, hogy javasolná a szöveg megváltoztatását.
- Indoklás megadása (Kötelező): Minden javaslathoz meg kell adni egy rövid szakmai indoklást/érvelést, hogy a Jóváhagyó megértse a változtatás szükségességét.
Kattintson a `Javaslat rögzítése` gombra. A javaslat azonnal megjelenik a bekezdés alatt színes kártyaként, vizuálisan megkülönböztetve (pl. a törlés piros, a beszúrás zöld, a módosítás sárga szegéllyel).

#### C) Valós Word (.docx) alapú frissítés:
Húzza be a lokálisan javított Microsoft Word fájlt a `Korrektúrázott Word fájl (.docx) importálása` zónába.
A rendszer beolvassa a javított Word fájl bekezdéseit, és frissíti a dokumentum tartalmát, miközben megőrzi a munkafolyamatot.

#### D) Véleményezés lezárása:
Miután minden javítást elhelyezett, kattintson a jobb felső sarokban található `Véleményezés lezárása és továbbítás` gombra.

Ezzel a dokumentum státusza `Véleményezett` (Reviewed) lesz, és átkerül a Jóváhagyó munkaasztalára. Ezt követően a Véleményező már nem módosíthatja a dokumentumot.

### 🏛️ 5.3. Jóváhagyó (Approver) Munkafolyamat
A Jóváhagyó a `Vezetői Jóváhagyó & Aláíró Központ` felületen dolgozik.

#### A) Javaslatok elbírálása:
Válasszon ki egy dokumentumot a bal oldali `Döntésre váró Corrected fájlok` listából.
A dokumentum szövegében a rendszer kiemelve mutatja a Véleményező által javasolt korrektúrákat.
Minden javaslat mellett két gomb található:
- Zöld pipa (Elfogadás): Elfogadja a korrektúrát.
- Módosítás esetén: A bekezdés szövege azonnal átíródik a javasolt változatra.
- Törlés esetén: A bekezdés azonnal törlődik a szövegből.
- Beszúrás esetén: Az új bekezdés beillesztésre kerül a szövegfolyamba.
- Piros X (Elutasítás): Elutasítja a javaslatot. A javaslat törlődik, az eredeti szöveg változatlan marad.

#### B) Véglegesítés és lezárás:
Miután minden javaslatot elbírált, kattintson a `Dokumentum véglegesítése és zárolása` gombra.
Figyelmeztetés: Ha vannak még el nem bírált (függő) javaslatok a dokumentumban, a rendszer figyelmeztetést küld. Ha így is véglegesíti, az el nem bírált javaslatok automatikusan elutasításra kerülnek.
A megerősítés után a dokumentum státusza `Approved` (Jóváhagyva) lesz. A szöveg zárolásra kerül, és rákerül a digitális pecsét/aláírás.

#### C) Exportálás és letöltés:
A lezárt dokumentumoknál az alábbi lehetőségek állnak rendelkezésre:

- Download (*.docx): Letölti a dokumentumot Microsoft Word formátumban. Ha a dokumentum eredetileg feltöltött fájl volt, a rendszer a megőrzött Base64 binárist tölti le a pontos eredeti stílusokkal és formázásokkal.
- Download (*.txt): Letölti a dokumentumot tiszta szöveges formátumban.
- Másolás: A "Tiszta szöveg másolása" gombbal a formázásoktól mentes, véglegesített szöveg egyetlen kattintással a vágólapra helyezhető.

### 🛠️ 5.4. Rendszergazda (Admin) Munkafolyamat
A Rendszergazda a `Felhasználók és Jogosultságok Kezelése` felületen dolgozik.

#### A) Új felhasználó létrehozása:
Töltse ki az `Új Felhasználó Létrehozása` űrlapot a bal oldalon:

```md 
Teljes név:
E-mail cím (ez lesz a belépési azonosító)
Jelszó (legalább 6 karakter hosszú):
Felhasználói Szerepkör (Beterjesztő, Véleményező, Jóváhagyó vagy Admin):
```

Kattintson a `Felhasználó Létrehozása` gombra. A fiók azonnal aktívvá válik, és az új munkatárs beléphet a megadott adatokkal.

#### B) Felhasználók karbantartása és törlése:
- Szerkesztés (Edit): A táblázatban a ceruza ikonra kattintva módosíthatja bármely felhasználó nevét, e-mail címét, jelszavát vagy szerepkörét.
- Törlés (Delete): A kuka ikonra kattintva törölheti a felhasználó hozzáférését. A saját fiókját az adminisztrátor nem törölheti.

#### C) VPS Állapot és Erőforrás Monitorozás:
Az irányítópult jobb felső sarkában valós idejű visszajelzés látható a VPS Docker tároló státuszáról (pl. VPS Docker: ON, Kapacitás: 98% szabad).
Ez a modul biztosítja az üzemeltető számára, hogy a háttérben futó konténerek megfelelően működnek-e.

## 🐳 6. VPS Docker Alapú Üzemeltetési Útmutató (Rendszergazdáknak)
Az alkalmazás VPS környezetben való futtatásához a projekt gyökérkönyvtárában az alábbi konfigurációs fájlok találhatóak meg:

- Dockerfile: Kétlépcsős (multi-stage) build folyamat, amely Node.js környezetben lefordítja a React alkalmazást, majd egy minimalista Nginx konténerbe helyezi a statikus fájlokat.
- nginx.conf: Konfigurálja az Nginx szervert, biztosítja a React SPA útvonalválasztást (try_files $uri $uri/ /index.html), és beállítja az eszközök gyorsítótárazását.
- docker-compose.yml: Lehetővé teszi az egyszerű, egygombos indítást és port-átirányítást (alapértelmezetten a VPS 3000-es portjára képezi le az alkalmazást).

Konténer indítása a VPS-en:
Lépjen be SSH-n a VPS-re, navigáljon a projekt mappájába, majd futtassa a következő parancsot:

```sh
bash

docker compose up --build -d
#Az alkalmazás ezután elérhetővé válik a http://<VPS_IP_CIME>:3000 címen.
```


