# TvojGrad Mobile

Ovo je odvojena Capacitor mobilna kopija aplikacije. Desktop/web projekat je u folderu `TvojGrad Frontend` i ne mora da se mijenja za mobilni build.

## Prvi put

1. Instaliraj Android Studio.
2. U Android Studio instaliraj Android SDK i napravi emulator.
3. U ovom folderu instaliraj pakete:

```bash
npm install
```

4. Napravi Android projekat:

```bash
npx cap add android
```

5. Kopiraj primjer env fajla:

```bash
copy .env.example .env
```

Za Android emulator `VITE_API_BASE_URL=http://10.0.2.2:8080` znači: aplikacija u emulatoru gađa backend koji radi na tvom računaru na portu `8080`.

Ako testiraš na pravom telefonu, `10.0.2.2` ne radi. Tada stavi IP adresu računara, npr:

```env
VITE_API_BASE_URL=http://192.168.1.20:8080
```

Telefon i računar moraju biti na istoj Wi-Fi mreži.

## Pokretanje

Backend pokreni kao i do sada u folderu `TvojGrad beckend`.

Zatim u ovom folderu:

```bash
npm run mobile:build
npm run mobile:open
```

`mobile:open` otvara Android Studio. U Android Studio izaberi emulator ili telefon i klikni Run.

Može i direktno iz terminala:

```bash
npm run mobile:run
```

## Poslije izmjena koda

Svaki put kad mijenjaš React kod u ovom mobilnom folderu:

```bash
npm run mobile:build
```

Ako je Android Studio već otvoren, nakon toga samo ponovo pokreni aplikaciju iz Android Studija.

## Korisne komande

```bash
npm run build
npm run mobile:sync
npm run mobile:open
npm run mobile:run
```
