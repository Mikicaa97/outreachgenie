<template>
  <div
      class="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat text-white px-4 bg-[length:cover] bg-center"
      style="background-image: url('/src/assets/login-signup-background.jpg');"
  >
    <!-- overlay (ako hoćeš da zatamniš sliku) -->
    <div class="absolute inset-0 bg-black/70"></div>

    <!-- 🌐 JEZICI -->
    <div class="absolute top-4 right-4 flex gap-2 z-10">
      <button
          @click="changeLang('sr')"
          :class="locale === 'sr' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'"
          class="px-3 py-1 rounded text-sm font-semibold transition"
      >
        SR
      </button>
      <button
          @click="changeLang('en')"
          :class="locale === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'"
          class="px-3 py-1 rounded text-sm font-semibold transition"
      >
        EN
      </button>
    </div>

    <!-- Sadržaj (da bude iznad overlay-a) -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo -->
      <img
          src="/src/assets/outreachgenielogo.png"
          alt="OutreachGenie Logo"
          class="w-28 sm:w-32 md:w-40 lg:w-48 mb-6 mx-auto object-contain"
      />

      <h2 class="text-2xl font-bold mb-4 text-center">{{ t('login_title') }}</h2>

      <div class="space-y-4">
        <input
            v-model="email"
            type="email"
            :placeholder="t('login_email')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900/80 text-white placeholder-gray-400"
        />
        <input
            v-model="password"
            type="password"
            :placeholder="t('login_password')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900/80 text-white placeholder-gray-400"
        />
        <button
            @click="login"
            class="bg-purple-600 w-full py-2 rounded font-semibold hover:bg-purple-700 transition"
        >
          {{ t('login_button') }}
        </button>

        <button
            type="button"
            class="text-sm underline text-purple-300 block text-center mx-auto"
            @click="openReset = true"
        >
          {{ t('auth_forgot_password') }}
        </button>

        <!-- Modal reset lozinke -->
        <div v-if="openReset" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div class="bg-gray-900 border border-gray-700 p-4 rounded w-[80%] sm:w-full max-w-md mx-auto">
            <h3 class="text-white font-semibold mb-2">{{ t('auth_reset_title') }}</h3>
            <input
                v-model="resetEmail"
                type="email"
                placeholder="you@example.com"
                class="w-full p-2 border border-gray-600 rounded bg-black text-white mb-3"
            />
            <div class="flex justify-end gap-2">
              <button class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" @click="openReset=false">
                {{ t('close') }}
              </button>
              <button class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white" @click="sendReset">
                {{ t('auth_send_link') }}
              </button>
            </div>
            <p v-if="resetInfo" class="text-green-400 text-sm mt-3">{{ resetInfo }}</p>
            <p v-if="resetError" class="text-red-400 text-sm mt-2">{{ resetError }}</p>
          </div>
        </div>

        <router-link to="/signup" class="text-sm underline text-purple-300 block text-center">
          {{ t('login_no_account') }}
        </router-link>

        <router-link to="/" class="text-sm underline text-purple-300 block text-center">
          {{ t('login_back_site') }}
        </router-link>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')

const openReset = ref(false)
const resetEmail = ref('')
const resetInfo = ref('')
const resetError = ref('')

const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

const sendReset = async () => {
  resetInfo.value = ''
  resetError.value = ''
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${siteUrl}/update-password`,
    })
    if (error) throw error
    resetInfo.value = t('auth_reset_sent')
  } catch (e) {
    resetError.value = e.message || t('auth_reset_error')
  }
}

const changeLang = (lang) => {
  locale.value = lang
}

const login = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    alert(t('login_error') + error.message)
  } else {
    router.push('/dashboard')
  }
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session?.user) {
    router.push('/dashboard')
  }
})
</script>
