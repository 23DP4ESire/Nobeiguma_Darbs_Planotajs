@extends('layouts.app')

@section('content')

<section class="bg-gradient-to-r from-red-600 to-red-500 text-white">
    <div class="max-w-7xl mx-auto px-6 py-28 text-center">
        <h1 class="text-6xl font-extrabold mb-6 drop-shadow">
            Plan Your Day with <span class="underline decoration-white">Planotajs</span>
        </h1>

        <p class="text-xl max-w-3xl mx-auto opacity-95">
            A powerful planning tool to manage tasks, time, and productivity —
            built for modern life.
        </p>


    </div>
</section>

<section id="features" class="max-w-7xl mx-auto px-6 py-24">
    <h2 class="text-4xl font-bold text-center mb-16">
        Why <span class="text-red-600">Planotajs</span>?
    </h2>

    <div class="grid md:grid-cols-3 gap-10">
        <div class="card">
            <h3 class="text-2xl font-semibold mb-3 text-red-600">
                Easy Planning
            </h3>
            <p class="text-slate-600">
                Create, edit, and manage your plans with zero friction.
            </p>
        </div>

        <div class="card">
            <h3 class="text-2xl font-semibold mb-3 text-red-600">
                Stay Focused
            </h3>
            <p class="text-slate-600">
                Visual clarity helps you focus on what really matters.
            </p>
        </div>

        <div class="card">
            <h3 class="text-2xl font-semibold mb-3 text-red-600">
                Modern Design
            </h3>
            <p class="text-slate-600">
                Clean, fast, and responsive on every device.
            </p>
        </div>
    </div>
</section>

@endsection
