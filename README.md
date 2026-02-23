# Planotajs - Mājas Projektu Planotājs

## Apraksts

**Planotajs** ir vienkāršs un pieejams mājas projektu plānošanas risinājums privātpersonām un uzņēmumiem. Mēs piedāvājam profesionālus mājas projektus ar pieņemamām cenām. Planotajs palīdz klientiem redzēt savu sapņu māju projektus pirms to uzbūvēšanas.

---

## Sistēmas prasības

- **PHP** 8.3+
- **Node.js** 18+
- **Composer** (PHP pakotņu menedžeris)
- **npm** (Node.js pakotņu menedžeris)

---

## Instalācija

### 1. Klonēt repozitoriju

```bash
git clone https://github.com/23DP4ESire/Nobeiguma_Darbs_Planotajs.git
cd Nobeiguma_Darbs_Planotajs
```

### 2. Backend instalācija

```bash
cd backend
composer install
```

Kopējiet `.env.example` uz `.env` (ja nepieciešams):
```bash
cp .env.example .env
```

Ģenerējiet aplikācijas atslēgu:
```bash
php artisan key:generate
```

Izveidojiet datu bāzi un palaidiet migrācijas:
```bash
php artisan migrate
```

### 3. Frontend instalācija

```bash
cd ../frontend
npm install
```

---

## Serveru palaišana

### Backend servera palaišana

```bash
cd run
php ./run-backend.sh
```

**Backend būs pieejams:** `http://localhost:8000`

### Frontend servera palaišana

Atvērt jaunu termināla logu/tab:

```bash
cd run
npm ./run-backend.sh
```

**Frontend būs pieejams:** `http://localhost:5173`

### Abi serveri vienlaicīgi (opcija)

Ja vēlaties palaist abu serveru daļas vienlaicīgi:

**Terminal 1:**
```bash
cd run
./run-both.sh
```
**Lai beigtu serverus**
```bash
pkill -f 'php -S' && pkill -f 'vite'
```

---

## Projekta struktūra

```
Nobeiguma_Darbs_Planotajs/
├── backend/              # Laravel API
│   ├── app/             # Aplikācijas loģika
│   ├── config/          # Konfigurācija
│   ├── database/        # Migrācijas un seederi
│   ├── routes/          # API maršruti
│   └── ...
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── pages/       # React lapas (Home, About)
│   │   ├── App.jsx      # Galvenais komponentes
│   │   └── ...
│   ├── public/          # Statiskos faili (attēli, etc.)
│   └── ...
└── README.md            # Šis fails
```

---


## API Endpoints

Backend API pieejams uz `http://localhost:8000/api`

**Pamatendpunkti:**
- `GET /api/test` - Testa endpoint
- Papildu endpoints var pievienot jaunu parametru modelim

---

## Pieejamās lapas

### Frontend marvirā

- **Sākums** (`/`) - Mājas projektu apraksts un galerija
- **Par mums** (`/about`) - Informācija par Planotāju, misija, vērtības
- **Pakalpojumi** - Nākotnē
- **Kontakti** - Nākotnē

---


## Licencija

Šis projekts ir privāts un paredzēts mācībām.

---

## Autors

**23DP4ESire** - Nobeiguma darbs


