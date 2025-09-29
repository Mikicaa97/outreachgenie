<template>
  <div
      class="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat text-white px-4 pb-4"
      :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- overlay -->
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

    <!-- Sadržaj -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo -->
      <img
          src="/src/assets/outreachgenielogo.png"
          alt="OutreachGenie Logo"
          class="w-28 sm:w-32 md:w-40 lg:w-48 mb-6 mx-auto object-contain"
      />

      <h2 class="text-2xl font-bold mb-4 text-center">{{ t('signup_title') }}</h2>

      <div class="space-y-4">
        <input
            v-model="firstName"
            type="text"
            :placeholder="t('signup_first_name') || 'First name'"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
        />

        <input
            v-model="lastName"
            type="text"
            :placeholder="t('signup_last_name') || 'Last name'"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
        />

        <input
            v-model="email"
            type="email"
            :placeholder="t('signup_email')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900/80 text-white placeholder-gray-400"
        />
        <input
            v-model="password"
            type="password"
            :placeholder="t('signup_password')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900/80 text-white placeholder-gray-400"
        />
        <button
            @click="register"
            class="bg-purple-600 w-full py-2 rounded font-semibold hover:bg-purple-700 transition cursor-pointer"
        >
          {{ t('signup_button') }}
        </button>

        <!-- ✅ Poruke -->
        <p v-if="errorMsg" class="text-red-400 text-sm mt-3 text-center">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-green-400 text-sm mt-3 text-center">{{ successMsg }}</p>

        <router-link
            to="/login"
            class="text-sm underline text-purple-300 block text-center cursor-pointer"
        >{{ t('signup_have_account') }}</router-link>

        <router-link
            to="/"
            class="text-sm underline text-purple-300 block text-center cursor-pointer"
        >{{ t('signup_back_site') }}</router-link>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { useI18n } from 'vue-i18n'
import bgImage from '@/assets/login-signup-background.jpg'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

// polja
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')

// obaveštenja
const errorMsg = ref('')
const successMsg = ref('')

const changeLang = (lang) => {
  locale.value = lang
}

const register = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!email.value || !password.value || !firstName.value || !lastName.value) {
    errorMsg.value = t('signup_error_fields') || 'Please fill in all fields.'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = t('signup_error_short') || 'Password must be at least 6 characters.'
    return
  }

  // 1️⃣ Registracija u Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        first_name: firstName.value,
        last_name: lastName.value
      }
    }
  })

  if (error) {
    errorMsg.value = (t('signup_error_general') || 'Error during signup: ') + error.message
    return
  }

  // 2️⃣ Ako je registrovan korisnik, ažuriraj first_name i last_name
  if (data.user) {
    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName.value,
          last_name: lastName.value,
        })
        .eq('id', data.user.id)   // ažurira samo njegov red
        .select()

    if (profileError) {
      console.error('❌ Greška pri upisu imena i prezimena:', profileError.message)
    }
  }

  successMsg.value = t('signup_success') || 'Check your email to confirm your account.'
}

onMounted(() => {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user && route.query.plan) {
      router.push(`/checkout?plan=${route.query.plan}`)
    }
  })
})
</script>
