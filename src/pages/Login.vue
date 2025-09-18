<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">

    <!-- 🌐 JEZICI -->
    <div class="absolute top-4 right-4 flex gap-2">
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

    <!-- Logo -->
    <img
        src="/src/assets/OutreachGenie-Logo.png"
        alt="OutreachGenie Logo"
        class="w-28 sm:w-32 md:w-40 lg:w-48 xl:w-56 mb-6 mx-auto object-contain"
    />

    <h2 class="text-2xl font-bold mb-4">{{ t('login_title') }}</h2>

    <div class="space-y-4 w-full max-w-md">
      <input
          v-model="email"
          type="email"
          :placeholder="t('login_email')"
          class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <input
          v-model="password"
          type="password"
          :placeholder="t('login_password')"
          class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <button
          @click="login"
          class="bg-purple-600 w-full py-2 rounded font-semibold hover:bg-purple-700 transition"
      >
        {{ t('login_button') }}
      </button>

      <router-link to="/signup" class="text-sm underline text-purple-300 block text-center">
        {{ t('login_no_account') }}
      </router-link>

      <router-link to="/" class="text-sm underline text-purple-300 block text-center">
        {{ t('login_back_site') }}
      </router-link>
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
    router.push('/dashboard') // ✅ ili '/' ako želiš odmah na landing
  }
}

// 📝 Ako je korisnik već ulogovan, odmah ga preusmeri
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session?.user) {
    router.push('/dashboard')
  }
})
</script>
