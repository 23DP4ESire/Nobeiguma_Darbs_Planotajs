# Planotajs - Majas Projektu Planotajs

## Apraksts

Planotajs ir majas projektu planosanas lietotne ar divam dalam:

- Laravel backend (`backend/`)
- React + Vite frontend (`frontend/`)

## Sistemas prasibas

- PHP 8.2+
- Composer
- Node.js 18+
- npm

## Versijas (pašreiz izmantotās)

- PHP: ^8.2
- Laravel: ^12.0 (Laravel 12.x)
- Vite: frontend ^7.3.x, backend ^7.0.x
- React: ^19.x
- Node.js: 18+

## Instalacija (vienu reizi)

### 1. Klonet repozitoriju

```bash
git clone https://github.com/23DP4ESire/Nobeiguma_Darbs_Planotajs.git
cd Nobeiguma_Darbs_Planotajs
```

### 2. Iestatīt backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

### 3. Iestatīt frontend

```bash
cd ../frontend
npm install
```

## Projekta palaisana

Atver 2 terminalus projekta saknes mape.

### Terminalis 1 - Backend

```bash
cd backend
php artisan serve
```

Backend adrese: `http://127.0.0.1:8000`

### Terminalis 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend adrese: `http://127.0.0.1:5173`

## Serveru apturesana

Nospied `Ctrl + C` katra terminali, kura serveris darbojas.

## API

- API baze: `http://127.0.0.1:8000/api`
- Testa endpoints: `GET /api/test`
- Frontend pieprasijumi uz `/api` tiek novirziti caur Vite proxy uz backend

## Projekta struktura

```text
Nobeiguma_Darbs_Planotajs/
|- backend/   # Laravel API
|- frontend/  # React + Vite
`- README.md
```

## Licence

Sis projekts ir privats un paredzets macibam.

## Autors

23DP4ESire (Emils Sire, DP3-4)
