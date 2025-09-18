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

    <h2 class="text-2xl font-bold mb-4">{{ t('signup_title') }}</h2>

    <div class="space-y-4 w-full max-w-md">
      <input
          v-model="email"
          type="email"
          :placeholder="t('signup_email')"
          class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <input
          v-model="password"
          type="password"
          :placeholder="t('signup_password')"
          class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <button
          @click="register"
          class="bg-purple-600 w-full py-2 rounded font-semibold hover:bg-purple-700 transition"
      >
        {{ t('signup_button') }}
      </button>

      <router-link
          to="/login"
          class="text-sm underline text-purple-300 block text-center"
      >{{ t('signup_have_account') }}</router-link>

      <router-link
          to="/"
          class="text-sm underline text-purple-300 block text-center"
      >{{ t('signup_back_site') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')

const changeLang = (lang) => {
  locale.value = lang
}

const register = async () => {
  if (!email.value || !password.value) {
    alert(t('signup_error_fields'))
    return
  }

  if (password.value.length < 6) {
    alert(t('signup_error_short'))
    return
  }

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    alert(t('signup_error_general') + error.message)
  } else {
    alert(t('signup_success'))
  }
}

onMounted(() => {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user && route.query.plan) {
      router.push(`/checkout?plan=${route.query.plan}`)
    }
  })
})
</script>
