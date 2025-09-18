<template>
  <HeaderLanding />
  <div class="min-h-screen bg-black text-white font-sans">

    <div
        class="sticky top-16 w-full bg-purple-600 text-white text-center z-40 shadow-md"
    >
      <p class="text-sm sm:text-base font-medium py-2 px-4">
        🚀 {{ t('landing.testMode') }}
        <span class="underline font-semibold">{{ t('landing.unlimitedEmails') }}</span>
      </p>
    </div>

    <!-- HERO -->
    <section class="bg-black text-white px-6 sm:px-12 py-24 sm:py-32">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
        <div>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 font-mono">
            <span v-html="typedHeroHeadline"></span>
            <span class="blinking-cursor">|</span>
          </h1>

          <p class="text-lg sm:text-xl text-gray-300 mb-8">
            {{ t('hero_subtitle') }}
          </p>

          <router-link to="/signup">
            <button class="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg text-lg hover:bg-yellow-600 transition duration-300">
              {{ t('hero_cta') }}
            </button>
          </router-link>
        </div>

        <div class="relative">
          <img
              src="/OutreachGenieHero.png"
              alt="Hero demo slika"
              class="w-full max-w-md sm:max-w-lg mx-auto rounded-xl shadow-2xl border border-gray-700"
          />
        </div>
      </div>
    </section>

    <!-- BENEFITI -->
    <section class="px-4 py-16 bg-gray-900 text-center" id="features">
      <h2 class="text-3xl font-semibold mb-4">{{ t('benefits_title') }}</h2>
      <p class="text-gray-400 mb-12 max-w-xl mx-auto">{{ t('benefits_subtitle') }}</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div class="p-6 bg-gray-800 rounded-lg shadow hover:shadow-xl transition">
          <h3 class="font-bold text-lg mb-2">🧠 {{ t('benefit_1_title') }}</h3>
          <p class="text-sm text-gray-300">{{ t('benefit_1_desc') }}</p>
        </div>
        <div class="p-6 bg-gray-800 rounded-lg shadow hover:shadow-xl transition">
          <h3 class="font-bold text-lg mb-2">⏱️ {{ t('benefit_2_title') }}</h3>
          <p class="text-sm text-gray-300">{{ t('benefit_2_desc') }}</p>
        </div>
        <div class="p-6 bg-gray-800 rounded-lg shadow hover:shadow-xl transition">
          <h3 class="font-bold text-lg mb-2">📬 {{ t('benefit_3_title') }}</h3>
          <p class="text-sm text-gray-300">{{ t('benefit_3_desc') }}</p>
        </div>
      </div>
    </section>

    <!-- DEMO PORUKA -->
    <section ref="demoSection" class="pt-32 py-20 px-4 bg-black text-white text-center" id="demo">
      <h2 class="text-3xl font-bold mb-6">{{ t('demo_title') }}</h2>
      <div class="max-w-6xl mx-auto p-6 rounded-lg bg-gray-900 border border-gray-700 shadow-md">
        <div class="text-left text-base sm:text-lg font-mono whitespace-pre-line min-h-[180px] hover:scale-[1.01]">
          <span v-html="displayedText"></span><span v-if="isDemoTyping" class="animate-pulse">|</span>
        </div>
      </div>
    </section>

    <!-- LIVE DEMO -->
    <LiveDemo id="livedemo" />

    <!-- PRICING -->
    <section id="pricing" class="bg-white py-24 px-4 text-center">
      <h2 class="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900">{{ t('pricing_title') }}</h2>
      <p class="text-gray-600 text-lg mb-12">{{ t('pricing_subtitle') }}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- FREE -->
        <div class="border rounded-xl p-8 shadow-sm flex flex-col">
          <h3 class="text-gray-900 text-xl font-semibold mb-2">Free</h3>
          <p class="text-gray-900 text-4xl font-bold mb-4">
            €0<span class="text-base font-medium text-gray-500">/{{ t('month') }}</span>
          </p>
          <ul class="text-gray-600 mb-6 space-y-2 text-left">
            <li>✅ {{ t('free_1') }}</li>
            <li>✅ {{ t('free_2') }}</li>
            <li>❌ {{ t('free_3') }}</li>
          </ul>
          <!-- FREE -->
          <router-link to="/signup?plan=free" class="mt-auto">
            <button class="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
              {{ t('free_cta') }}
            </button>
          </router-link>
        </div>

        <!-- PRO -->
        <div class="border-2 border-yellow-500 rounded-xl p-8 shadow-lg flex flex-col bg-yellow-50 relative">
          <div class="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
            {{ t('pro_badge') }}
          </div>
          <h3 class="text-gray-900 text-xl font-semibold mb-2">Pro</h3>
          <p class="text-gray-900 text-4xl font-bold mb-4">
            €8<span class="text-base font-medium text-gray-500">/{{ t('month') }}</span>
          </p>
          <ul class="text-gray-600 mb-6 space-y-2 text-left">
            <li>✅ {{ t('pro_1') }}</li>
            <li>✅ {{ t('pro_2') }}</li>
            <li>✅ {{ t('pro_3') }}</li>
          </ul>
          <!-- PRO -->
          <router-link to="/signup?plan=pro" class="mt-auto">
            <button class="w-full bg-yellow-500 text-black py-2 rounded-lg hover:bg-yellow-600 transition">
              {{ t('pro_cta') }}
            </button>
          </router-link>
        </div>

        <!-- AGENCY -->
        <div class="border rounded-xl p-8 shadow-sm flex flex-col">
          <h3 class="text-gray-900 text-xl font-semibold mb-2">Agency</h3>
          <p class="text-gray-900 text-4xl font-bold mb-4">
            €49<span class="text-base font-medium text-gray-500">/{{ t('month') }}</span>
          </p>
          <ul class="text-gray-600 mb-6 space-y-2 text-left">
            <li>✅ {{ t('agency_1') }}</li>
            <li>✅ {{ t('agency_2') }}</li>
            <li>✅ {{ t('agency_3') }}</li>
          </ul>
          <!-- AGENCY -->
          <router-link to="/signup?plan=agency" class="mt-auto">
            <button class="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
              {{ t('agency_cta') }}
            </button>
          </router-link>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-gray-100 py-20 px-4 text-center" id="faq">
      <h2 class="text-3xl font-bold mb-12 text-gray-800">{{ t('faq_title') }}</h2>
      <div class="max-w-4xl mx-auto space-y-8 text-left">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">❓ {{ t('faq_q1') }}</h3>
          <p class="text-gray-600">{{ t('faq_a1') }}</p>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">📦 {{ t('faq_q2') }}</h3>
          <p class="text-gray-600">{{ t('faq_a2') }}</p>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">🔐 {{ t('faq_q3') }}</h3>
          <p class="text-gray-600">{{ t('faq_a3') }}</p>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">💳 {{ t('faq_q4') }}</h3>
          <p class="text-gray-600">{{ t('faq_a4') }}</p>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="bg-white py-20 px-4">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">{{ t('testimonials_title') }}</h2>
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
        >
          <p class="text-gray-700 mb-4 italic">“{{ testimonial.quote }}”</p>
          <div class="flex items-center gap-3">
            <img :src="testimonial.avatar" alt="avatar" class="w-10 h-10 rounded-full" />
            <div>
              <p class="font-semibold text-gray-800">{{ testimonial.name }}</p>
              <p class="text-sm text-gray-500">{{ testimonial.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-yellow-400 py-20 px-6 text-center text-black">
      <h2 class="text-4xl sm:text-5xl font-extrabold mb-6">{{ t('cta_title') }}</h2>
      <p class="text-lg sm:text-xl mb-10 max-w-2xl mx-auto">{{ t('cta_subtitle') }}</p>
      <router-link to="/signup">
        <button class="bg-black text-white px-8 py-4 text-lg font-bold rounded-lg hover:bg-gray-900 transition duration-300">
          {{ t('cta_button') }}
        </button>
      </router-link>
    </section>

    <!-- TRUST -->
    <section class="bg-black py-12 px-6 text-center">
      <h3 class="text-2xl font-semibold text-white mb-4">{{ t('trust_title') }}</h3>
      <p class="text-gray-400 max-w-xl mx-auto mb-8">{{ t('trust_subtitle') }}</p>
      <div class="flex flex-wrap justify-center items-center gap-6">
        <div class="text-white text-lg opacity-60 hover:opacity-100 transition">Freelancer</div>
        <div class="text-white text-lg opacity-60 hover:opacity-100 transition">Upwork</div>
        <div class="text-white text-lg opacity-60 hover:opacity-100 transition">Fiverr</div>
        <div class="text-white text-lg opacity-60 hover:opacity-100 transition">Shopify</div>
      </div>
    </section>
  </div>
  <Footer/>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import HeaderLanding from '@/components/HeaderLanding.vue'
import LiveDemo from '@/components/LiveDemo.vue'
import Footer from "@/components/Footer.vue";

const { t, locale } = useI18n()

const typedHeroHeadline = ref('')
const displayedText = ref('')
const isHeroTyping = ref(false)
const isDemoTyping = ref(false)
const demoSection = ref(null)

const testimonials = [
  { name: t('testi_1_name'), title: t('testi_1_title'), quote: t('testi_1_quote'), avatar: '/avatars/maja.jpg' },
  { name: t('testi_2_name'), title: t('testi_2_title'), quote: t('testi_2_quote'), avatar: '/avatars/luka.jpg' },
  { name: t('testi_3_name'), title: t('testi_3_title'), quote: t('testi_3_quote'), avatar: '/avatars/jovana.jpg' },
]

function startHeroTyping() {
  typedHeroHeadline.value = ''
  isHeroTyping.value = true
  const text = t('hero_headline')
  let i = 0
  const interval = setInterval(() => {
    typedHeroHeadline.value = text.slice(0, i++)
    if (i > text.length) {
      isHeroTyping.value = false
      clearInterval(interval)
    }
  }, 35)
}

function startDemoTyping() {
  displayedText.value = ''
  isDemoTyping.value = true
  const text = t('demo_full_text')
  let i = 0
  const interval = setInterval(() => {
    displayedText.value = text.slice(0, i++)
    if (i > text.length) {
      isDemoTyping.value = false
      clearInterval(interval)
    }
  }, 18)
}

function observeDemoSection() {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      startDemoTyping()
      observer.disconnect()
    }
  }, { threshold: 0.4 })
  if (demoSection.value) observer.observe(demoSection.value)
}

onMounted(() => {
  startHeroTyping()
  observeDemoSection()

  const imageUrl = `${window.location.origin}/OutreachGenie-Preview.png`

  // 📌 SEO meta tagovi
  document.title = 'OutreachGenie — AI alat za cold emailove'
  document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', 'Generiši cold emailove koji donose klijente uz pomoć AI-ja.')

  // 📲 Open Graph
  const ogTags = [
    { property: 'og:title', content: 'OutreachGenie — AI alat za cold emailove' },
    { property: 'og:description', content: 'Generiši cold emailove koji donose klijente uz pomoć AI-ja.' },
    { property: 'og:image', content: imageUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href }
  ]

  ogTags.forEach(tag => {
    let el = document.querySelector(`meta[property='${tag.property}']`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', tag.property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', tag.content)
  })

  // 🐦 Twitter Card
  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'OutreachGenie — AI alat za cold emailove' },
    { name: 'twitter:description', content: 'Generiši cold emailove koji donose klijente uz pomoć AI-ja.' },
    { name: 'twitter:image', content: imageUrl }
  ]

  twitterTags.forEach(tag => {
    let el = document.querySelector(`meta[name='${tag.name}']`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', tag.name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', tag.content)
  })
})


watch(locale, () => {
  startHeroTyping()
  startDemoTyping()
})
</script>

<style scoped>
.blinking-cursor {
  animation: blink 0.8s steps(2, start) infinite;
}
@keyframes blink {
  to { visibility: hidden; }
}
</style>
