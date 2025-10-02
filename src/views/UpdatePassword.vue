<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-no-repeat text-white px-4"
       :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- overlay -->
    <div class="absolute inset-0 z-0 bg-black/50"></div>
    <div class="w-full max-w-md bg-gray-900 z-10 border border-gray-700 p-6 rounded">
      <select
          v-model="selectedLang"
          @change="changeLang"
          class="bg-gray-800 text-white px-2 py-1 rounded text-xs float-right mb-4"
      >
        <option value="sr">SR</option>
        <option value="en">EN</option>
      </select>
      <h1 class="text-xl font-bold mb-4">🔒 {{ t('auth_set_new_password') }}</h1>

      <div class="space-y-3">
        <input
            v-model="password"
            type="password"
            :placeholder="t('auth_new_password_ph')"
            class="w-full p-2 border border-gray-600 rounded bg-black text-white"
        />
        <input
            v-model="password2"
            type="password"
            :placeholder="t('auth_confirm_password_ph')"
            class="w-full p-2 border border-gray-600 rounded bg-black text-white"
        />
      </div>

      <p v-if="errorMsg" class="text-red-400 text-sm mt-3">{{ errorMsg }}</p>
      <p v-if="okMsg" class="text-green-400 text-sm mt-3">{{ okMsg }}</p>

      <button
          class="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-60"
          :disabled="loading"
          @click="updatePassword"
      >
        {{ loading ? t('saving') : t('auth_set_password_btn') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient.js'
import { useI18n } from 'vue-i18n'
import bgImage from '@/assets/login-signup-background.jpg'

const { t, locale } = useI18n()
const selectedLang = ref(locale.value)

const password = ref('')
const password2 = ref('')
const loading = ref(false)
const okMsg = ref('')
const errorMsg = ref('')

const changeLang = () => {
  locale.value = selectedLang.value
  localStorage.setItem('lang', selectedLang.value)
}

onMounted(async () => {
  const savedLang = localStorage.getItem('lang')
  if (savedLang) {
    selectedLang.value = savedLang
    locale.value = savedLang
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.warn("⚠️ Nema aktivne sesije za reset lozinke.")
  }
})

const updatePassword = async () => {
  errorMsg.value = ''
  okMsg.value = ''
  if (!password.value || password.value !== password2.value) {
    errorMsg.value = t('auth_passwords_mismatch')
    return
  }
  try {
    loading.value = true
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    okMsg.value = t('auth_password_updated')
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } catch (e) {
    errorMsg.value = e.message || t('something_wrong')
  } finally {
    loading.value = false
  }
}
</script>
