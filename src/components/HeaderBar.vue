<template>
  <header class="bg-black text-white w-full border-b border-gray-800 sticky top-0 z-40">
    <!-- 🟣 Test mode baner -->
    <div
        v-if="showTestBanner"
        class="bg-purple-600 text-white text-center px-3 py-2 flex items-center justify-between text-xs sm:text-sm"
    >
      <p class="flex-1 text-center">
        🚀 {{ t('landing.testMode') }}
        <span class="underline font-semibold">{{ t('landing.unlimitedEmails') }}</span>
      </p>
      <button
          @click="showTestBanner = false"
          class="ml-2 text-white hover:text-gray-200 font-bold"
          aria-label="Zatvori"
      >
        ✕
      </button>
    </div>

    <!-- Gornja traka -->
    <div class="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">

      <!-- Plan badge + ime -->
      <div class="sm:flex items-center gap-2 text-xs sm:text-sm">
        {{ t('header_plan') }}:
        <span :class="['px-2 py-1 rounded text-white font-semibold', planBadgeColor(userPlan)]">
          {{ userPlan || '—' }}
        </span>
        <span v-if="userName" class="ml-2 text-gray-400">| {{ userName }}</span>
      </div>

      <!-- Logo -->
      <router-link to="/" class="flex-1 flex justify-center">
        <img
            src="/src/assets/outreachgenielogo.png"
            alt="OutreachGenie Logo"
            class="max-h-20 sm:max-h-20 object-contain"
        />
      </router-link>

      <!-- Right side (Admin + Language Switcher) -->
      <div class="flex items-center gap-2">
        <template v-if="user?.is_admin">
          <RouterLink
              to="/admin"
              class="hidden sm:block bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-xs sm:text-sm"
          >
            🛠 {{ t('header_admin') }}
          </RouterLink>
        </template>

        <!-- Language switch -->
        <button
            @click="switchLang"
            class="text-sm border border-zinc-700 px-3 py-1 rounded hover:border-yellow-400 text-white"
        >
          {{ locale.toUpperCase() }}
        </button>
      </div>

      <!-- Desktop navigation -->
<!--      <nav class="hidden md:flex items-center gap-2 ml-4">-->
<!--        <button @click="navigateTo('home')" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_generator') }}</button>-->
<!--        <button @click="navigateTo('profile')" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_profile') }}</button>-->
<!--        <SubscribeButton />-->
<!--        <button @click="logout" class="px-3 py-1 rounded hover:bg-gray-800 transition">{{ t('header_logout') }}</button>-->
<!--      </nav>-->

      <nav class="hidden md:flex items-center gap-2 ml-4">
        <button
            @click="navigateTo('home')"
            class="px-3 py-1 rounded hover:bg-gray-800 transition"
        >
          {{ t('header_generator') }}
        </button>

        <button
            @click="navigateTo('emails')"
            class="px-3 py-1 rounded hover:bg-gray-800 transition"
        >
          {{ t('header_myemails') }}
        </button>

        <button @click="navigateTo('contacts')" class="px-3 py-1 rounded hover:bg-gray-800">Contacts</button>
        <button @click="navigateTo('campaigns')" class="px-3 py-1 rounded hover:bg-gray-800">Campaigns</button>

        <RouterLink to="/campaigns/send" class="px-3 py-1 rounded hover:bg-gray-800">Send Campaign</RouterLink>


        <button
            @click="navigateTo('profile')"
            class="px-3 py-1 rounded hover:bg-gray-800 transition"
        >
          {{ t('header_profile') }}
        </button>

        <SubscribeButton />
        <button
            @click="logout"
            class="px-3 py-1 rounded hover:bg-gray-800 transition"
        >
          {{ t('header_logout') }}
        </button>
      </nav>


      <!-- Mobile menu button -->
      <div class="md:hidden ml-2">
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

    <!-- Mobile navigation -->
    <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="open" class="md:hidden border-t border-gray-800">
        <div class="max-w-6xl mx-auto px-3 py-3 flex flex-col gap-2">

          <!-- Nav links -->
          <button @click="navigateTo('home'); open = false" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_generator') }}</button>
          <button
              @click="navigateTo('emails'); open = false"
              class="w-full text-left px-3 py-2 rounded hover:bg-gray-800"
          >
            {{ t('header_myemails') }}
          </button>

          <button @click="navigateTo('contacts')" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">Contacts</button>
          <button @click="navigateTo('campaigns')" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">Campaigns</button>

          <RouterLink to="/campaigns/send" class="hover:text-purple-300 text-gray-300">Send Campaign</RouterLink>


          <button @click="navigateTo('profile'); open = false" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_profile') }}</button>
          <SubscribeButton />
          <button @click="logout" class="w-full text-left px-3 py-2 rounded hover:bg-gray-800">{{ t('header_logout') }}</button>

          <!-- Admin link (mobile only) -->
          <template v-if="user?.is_admin">
            <RouterLink
                to="/admin"
                class="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-blue-400"
            >
              🛠 {{ t('header_admin') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </transition>
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
const userName = ref('')
const user = ref(null)

const { t, locale } = useI18n()
const selectedLang = ref(locale.value)

const switchLang = () => {
  locale.value = locale.value === 'sr' ? 'en' : 'sr'
}


// Navigacija
function navigateTo(view) {
  if (view === 'home') {
    router.push('/dashboard')
  } else if (view === 'emails') {
    router.push('/my-emails')
  }
  else if (view === 'contacts') {
    router.push('/contacts')
  }
  else if (view === 'campaigns') {
    router.push('/campaigns')
  }
  else if (view === 'profile') {
    router.push('/dashboard/profile')
  }
}

// Logout
async function logout() {
  try {
    await supabase.auth.signOut({ scope: 'global' })
  } catch (err) {
    console.warn('⚠️ Signout ignoriše grešku:', err.message)
  }
  localStorage.clear()
  window.location.href = '/login'
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

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('plan, is_admin, first_name')
        .eq('id', uid)
        .single()

    if (!error && profile) {
      userPlan.value = profile.plan
      user.value = profile
      userName.value = `${profile.first_name || ''}`.trim()
    }
  }
})
</script>
