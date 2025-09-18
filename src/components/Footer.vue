<template>
  <footer class="bg-black text-gray-400 text-sm py-6 border-t border-gray-800">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">

      <p class="text-center sm:text-left">
        {{t('footer_rights')}}
      </p>

      <nav class="flex flex-wrap gap-4 justify-center">
        <RouterLink to="/privacy" class="hover:text-white transition">Privacy Policy</RouterLink>
        <RouterLink to="/terms" class="hover:text-white transition">Terms of Service</RouterLink>
        <RouterLink to="/cookies" class="hover:text-white transition">Cookies Policy</RouterLink>
        <RouterLink to="/contact" class="hover:text-white transition">Contact</RouterLink>
      </nav>

    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {ref} from "vue";


const { t, locale } = useI18n()
const selectedLang = ref(locale.value)
</script>
