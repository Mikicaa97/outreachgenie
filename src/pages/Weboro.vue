<template>
  <header-weboro/>
  <div class="bg-black text-white min-h-screen font-sans">
    <!-- Hero Section -->
<!--    <hero-line/>-->

    <!-- OutreachGenie Sekcija -->
    <section class="py-20 px-6 md:px-20 animate-slide-up bg-black">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        <!-- Tekst -->
        <div class="md:w-1/2 text-gray-300">
          <img
              src="/src/assets/OutreachGenie-Logo.png"
              alt="OutreachGenie Logo"
              class="w-28 sm:w-32 md:w-40 lg:w-48 xl:w-26 mb-3 mx-auto object-contain"
          />
          <p class="mb-4 text-lg">Naš interni SaaS alat koji je pomogao hiljadama frilensera, agencija i konsultanata da napišu personalizovane i efektivne cold email poruke.</p>
          <p class="mb-6">Integrisan sa OpenAI, Vue.js i Supabase – OutreachGenie štedi vreme i povećava šanse za odgovor. Dostupan kao zaseban proizvod i primer naše sposobnosti da gradimo rešenja koja stvarno funkcionišu.</p>
          <a href="/outreachgenie" class="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-300 transition">
            Pogledaj više
          </a>
        </div>

        <!-- Video Placeholder -->
        <div class="md:w-1/2 w-full aspect-video bg-zinc-800 rounded-xl flex items-center justify-center">
          <span class="text-gray-500">Ovde dolazi video demo aplikacije</span>
          <!-- Primer video playera kad budeš imao snimak:
          <video controls class="rounded-xl w-full h-auto">
            <source src="/videos/outreachgenie-demo.mp4" type="video/mp4" />
            Tvoj browser ne podržava video tag.
          </video>
          -->
        </div>

      </div>
    </section>


    <!-- Shopify Sekcija -->
    <section class="py-24 px-6 md:px-20 bg-zinc-950 animate-slide-up">
      <div class="max-w-5xl mx-auto flex flex-col items-start gap-12">

        <!-- Tekstualni deo -->
        <div class="w-full">
          <h2 class="text-4xl font-bold text-white mb-6">Shopify eCommerce</h2>
          <p class="text-gray-300 mb-4 text-lg">
            Gradimo <span class="text-white font-semibold">brze i skalabilne eCommerce sisteme</span> koristeći <strong>Shopify</strong> za <em>MVP prototipe</em> i poslovnu automatizaciju.
          </p>
          <ul class="list-disc list-inside text-gray-400 text-base space-y-2 mt-4">
            <li>Brz izlazak na tržište bez gubitka kvaliteta</li>
            <li>Idealno za startape, eCommerce brendove i agencije</li>
            <li>Povezivanje sa CRM-ovima, Google Sheetovima, AI-jem i više</li>
          </ul>
          <a href="#kontakt" class="inline-block mt-8 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-300 transition">
            Počni svoj projekat
          </a>
        </div>

        <!-- UI Mockup deo -->
        <div class="w-full bg-zinc-800 p-6 rounded-2xl shadow-lg relative">
          <!-- Ikonica u uglu -->
          <div class="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-black shadow">
            Shopify
          </div>

          <!-- Placeholder za mockup / video -->
          <div class="aspect-video w-full bg-zinc-700 rounded-xl flex items-center justify-center text-gray-500 text-sm">
            UI prikaz dolazi ovde (mockup ili video)
          </div>
        </div>

      </div>
    </section>

    <!-- Marketing Sekcija -->
    <section class="py-24 px-6 md:px-20 bg-zinc-900 animate-fade-in">
      <div class="max-w-7xl mx-auto">
        <!-- Header + opis -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">📣 Marketing & Outreach Sistemi</h2>
          <p class="text-lg text-gray-300 max-w-3xl mx-auto">
            Pomažemo brendovima da rastu kroz **digitalne strategije**, alate i automatizaciju.
            Od **Google Ads** do **Outreach sistema**, kreiramo skalabilne kanale za konverziju i prepoznatljivost.
          </p>
        </div>
        <!-- GRID sa karticama -->
        <div class="grid md:grid-cols-3 gap-8 text-gray-300">

          <!-- Google Ads -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">🎯 Google Ads & Retargeting</h3>
            <p class="text-sm">
              Izrada i optimizacija PPC kampanja – Search, Display, YouTube. Napredni retargeting i konverzioni funneli.
            </p>
          </div>

          <!-- Google Analytics -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">📊 Google Analytics & Praćenje</h3>
            <p class="text-sm">
              Merenje svega što se dešava na sajtu. Povezivanje sa ciljevima, heatmapama, događajima i funnel analizama.
            </p>
          </div>

          <!-- Social Media -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">📱 Social Media Kampanje</h3>
            <p class="text-sm">
              Instagram, TikTok, Facebook – kreiranje sadržaja, vođenje profila, growth strategije i promotivne objave.
            </p>
          </div>

          <!-- Email & Cold Outreach -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">✉️ Email Marketing & Outreach</h3>
            <p class="text-sm">
              Automatske sekvence, segmentacija, personalizacija i integracija sa OutreachGenie i AI alatima.
            </p>
          </div>

          <!-- SEO & Content -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">🔍 SEO & Content Strategije</h3>
            <p class="text-sm">
              Optimizacija sajtova, blogova i landing stranica za vidljivost u Google pretragama i organski rast.
            </p>
          </div>

          <!-- Konverzija i CRO -->
          <div class="bg-zinc-800 p-6 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition">
            <h3 class="text-xl font-semibold text-white mb-2">⚡️ Konverzija & UX Analiza</h3>
            <p class="text-sm">
              Unapređenje korisničkog puta, brzine sajta i performansi za veći broj prodaja, zakazivanja i kontakata.
            </p>
          </div>

        </div>

        <!-- Slika ili video -->
        <div class="w-full aspect-video bg-zinc-800 mt-20 rounded-xl flex items-center justify-center text-gray-500 text-sm">
          Ovde dolazi ilustracija / animacija / video (opciono)
        </div>

        <!-- CTA dugme -->
        <div class="text-center mt-12">
          <a href="#kontakt" class="inline-block px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-300 transition">
            Zakaži besplatan konsulting
          </a>
        </div>

      </div>
    </section>



    <!-- Usluge koje nudimo -->
    <section class="py-16 px-6 md:px-20 animate-slide-up">
      <h2 class="text-3xl font-bold text-center mb-12">Usluge koje nudimo</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">💡 SaaS Razvoj</h3>
          <p class="text-gray-400">Vue.js, Supabase, Stripe i AI integracije.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">🛒 Shopify & WordPress</h3>
          <p class="text-gray-400">eCommerce rešenja za brendove svih veličina.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">🎨 UI/UX & Branding</h3>
          <p class="text-gray-400">Od logotipa do kompletnog vizuelnog identiteta.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">📈 Growth strategije</h3>
          <p class="text-gray-400">Outreach sistemi, cold email, content marketing.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">📸 Video produkcija</h3>
          <p class="text-gray-400">Snimanje događaja, montaža, titlovi, Instagram/TikTok edit.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">🎤 Event voditeljstvo</h3>
          <p class="text-gray-400">Iskustvo vođenja i predstavljanja na velikim događajima.</p>
        </div>
        <div class="bg-zinc-900 p-6 rounded-xl shadow-md hover:scale-105 transition">
          <h3 class="text-xl font-semibold mb-2">📲 Društvene mreže</h3>
          <p class="text-gray-400">Strategije, planiranje sadržaja i vođenje profila.</p>
        </div>
      </div>
    </section>

    <!-- Tehnologije koje koristimo -->
    <section class="py-16 px-6 md:px-20 animate-fade-in">
      <h2 class="text-3xl font-bold text-center mb-12">Tehnologije koje koristimo</h2>
      <div class="flex flex-wrap justify-center gap-6">
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Vue.js</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Supabase</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Tailwind CSS</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Stripe</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Shopify</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">WordPress</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Figma</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Adobe Suite</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Softr</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Make.com</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">Premiere Pro</span>
        <span class="bg-zinc-800 px-4 py-2 rounded-full">CapCut</span>
      </div>
    </section>

    <!-- Tim koji stoji iza Weboro -->
    <section class="py-16 px-6 md:px-20 animate-slide-up">
      <h2 class="text-3xl font-bold text-center mb-8">Ko stoji iza Weboro?</h2>
      <div class="max-w-3xl mx-auto text-center text-gray-300">
        <p class="mb-4">Weboro je tim predvođen Mihailom Vlajkovićem, graditeljem sistema koji funkcionišu. U svakom projektu težimo jednostavnosti, efikasnosti i dizajnu koji donosi rezultate.</p>
        <p>Poseban deo tima čini i Jelena – sa iskustvom event predstavljanja i rada pred kamerom, kao i produkcijom sadržaja za društvene mreže velikih događaja.</p>
      </div>
    </section>

    <!-- Kontakt sekcija -->
    <section class="py-16 px-6 md:px-20 text-center animate-fade-in">
      <h2 class="text-3xl font-bold mb-6">Spremni da napravimo nešto sjajno?</h2>
      <p class="mb-8 text-gray-300">Imate ideju? Mi znamo kako da je pretvorimo u proizvod.</p>
      <button class="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-300 transition">Kontaktiraj nas</button>
    </section>

    <!-- Footer -->
    <footer class="bg-zinc-950 py-10 text-center text-gray-500 text-sm">
      <p class="mb-2">© 2025 Weboro. Sva prava zadržana.</p>
      <div class="flex justify-center gap-4">
        <a href="/outreachgenie" class="hover:underline">OutreachGenie</a>
        <a href="/lumawear" class="hover:underline">LumaWear</a>
        <a href="/kontakt" class="hover:underline">Kontakt</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeaderWeboro from "@/components/HeaderWeboro.vue";
import HeroLine from "@/components/HeroLine.vue";
</script>

<style>
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 1s ease-out;
}
</style>
