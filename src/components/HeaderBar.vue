<template>
  <header class="bg-black text-white w-full border-b border-gray-800 sticky top-0 z-40">
    <!-- 🟣 Test mode baner -->
    <div
        v-if="showTestBanner"
        class="bg-purple-600 text-white text-center px-4 py-2 flex items-center justify-between text-xs sm:text-sm"
    >
      <p>
        🚀 {{ t('landing.testMode') }}
        <span class="underline font-semibold">{{ t('landing.unlimitedEmails') }}</span>
      </p>
      <button
          @click="showTestBanner = false"
          class="ml-4 text-white hover:text-gray-200 font-bold"
          aria-label="Zatvori"
      >
        ✕
      </button>
    </div>

    <div class="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">

      <!-- Plan badge -->
      <div class="hidden sm:flex items-center gap-1 text-xs sm:text-sm">
        {{ t('header_plan') }}:
        <span :class="['px-2 py-1 rounded text-white font-semibold', planBadgeColor(userPlan)]">
          {{ userPlan || '—' }}
        </span>
      </div>

      <router-link to="/" class="flex-1 flex justify-center">
        <img
            src="/src/assets/outreachgenielogo.png"
            alt="OutreachGenie Logo"
            class="max-w-[100px] sm:max-w-[160px] md:max-w-[140px] lg:max-w-[150px] xl:max-w-[120px] h-auto mt-1 object-contain"
        />
      </router-link>

      <!-- Right side (Admin + Language Switcher) -->
      <div class="flex items-center gap-3">
        <template v-if="user?.is_admin">
          <RouterLink
              to="/admin"
              class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
          >
            🛠 {{ t('header_admin') }}
          </RouterLink>
        </template>

        <!-- Language switch -->
        <select v-model="selectedLang" @change="changeLang" class="bg-gray-800 text-white px-2 py-1 rounded text-xs">
          <option value="sr">SR</option>
          <option value="en">EN</option>
        </select>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-2 ml-4">
        <button @click="navigateTo('home')" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_generator') }}</button>
        <button @click="navigateTo('profile')" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_profile') }}</button>
        <SubscribeButton />
        <button @click="logout" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_logout') }}</button>
      </nav>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
            @click="open = !open"
            class="p-2 rounded hover:bg-gray-800 transition"
            aria-label="Menu"
        >
          <span v-if="!open">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div v-if="open" class="md:hidden border-t border-gray-800">
      <div class="max-w-6xl mx-auto px-3 py-2 flex flex-col gap-2">

        <!-- Plan prikaz -->
        <div class="sm:hidden text-xs text-gray-300 mb-1 flex items-center gap-1">
          {{ t('header_plan') }}:
          <span :class="['px-2 py-1 rounded text-white font-semibold', planBadgeColor(userPlan)]">
            {{ userPlan || '—' }}
          </span>
        </div>

        <button @click="navigateTo('home'); open = false" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_generator') }}</button>
        <button @click="navigateTo('profile'); open = false" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_profile') }}</button>
        <SubscribeButton />
        <button @click="logout" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_logout') }}</button>

        <template v-if="user?.is_admin">
          <RouterLink
              to="/admin"
              class="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-blue-400"
          >
            🛠 {{ t('header_admin') }}
          </RouterLink>
        </template>

        <!-- Language switch mobile -->
        <select v-model="selectedLang" @change="changeLang" class="bg-gray-800 text-white px-2 py-1 rounded text-xs mt-2">
          <option value="sr">SR</option>
          <option value="en">EN</option>
        </select>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import SubscribeButton from "@/components/SubscribeButton.vue"
import { useI18n } from 'vue-i18n'

const router = useRouter()
const open = ref(false)
const userPlan = ref('')
const user = ref(null)

const { t, locale } = useI18n()
const selectedLang = ref(locale.value)

// Promeni jezik
const changeLang = () => {
  locale.value = selectedLang.value
  localStorage.setItem('lang', selectedLang.value)
}

// Učitaj prethodno sačuvan jezik
onMounted(() => {
  const savedLang = localStorage.getItem('lang')
  if (savedLang) {
    selectedLang.value = savedLang
    locale.value = savedLang
  }
})

// Navigacija
function navigateTo(view) {
  if (view === 'home') {
    router.push('/dashboard')
  } else if (view === 'profile') {
    router.push('/dashboard/profile')
  }
}

// Logout
const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

// Odredi klasu za badge boju plana
const planBadgeColor = (plan) => {
  switch (plan?.toLowerCase()) {
    case 'pro': return 'bg-green-600';
    case 'agency': return 'bg-purple-600';
    case 'enterprise': return 'bg-yellow-600 text-black';
    case 'free': return 'bg-gray-600';
    default: return 'bg-gray-700';
  }
}

// Učitaj podatke
onMounted(async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (authUser) {
    const uid = authUser.id

    // Plan
    const { data: planData, error: planError } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('id', uid)
        .maybeSingle()
    if (!planError && planData) userPlan.value = planData.plan

    // Admin
    const { data: adminData, error: adminError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', uid)
        .single()
    if (!adminError && adminData) user.value = adminData
  }
})
</script>
