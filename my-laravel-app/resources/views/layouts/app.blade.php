<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planotajs</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800">

<header class="bg-red-600 text-white shadow-xl">
    <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div class="flex items-center gap-3">
            <span class="text-2xl font-extrabold tracking-wide">
                Planotajs
            </span>
        </div>

        <nav class="space-x-8 text-sm font-semibold uppercase tracking-wide">
            <a href="/" class="hover:underline">Home</a>
            <a href="/about" class="hover:underline">About Us</a>
        </nav>
    </div>
</header>

<main>
    @yield('content')
</main>

<footer class="bg-slate-900 text-slate-400 mt-24">
    <div class="max-w-7xl mx-auto px-6 py-8 text-center text-sm">
        © {{ date('Y') }} Planotajs — Plan smarter.
    </div>
</footer>

</body>
</html>
