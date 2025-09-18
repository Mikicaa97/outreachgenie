<template>
  <HeaderLanding/>
  <div class="bg-black text-white min-h-screen py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">{{ t('terms_title') }}</h1>
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-6 text-gray-300 leading-relaxed">
        <p>{{ t('terms_intro') }}</p>

        <h2 class="text-2xl font-semibold mt-10 mb-3">{{ t('terms_usage_title') }}</h2>
        <p>{{ t('terms_usage_text') }}</p>

        <h2 class="text-2xl font-semibold mt-10 mb-3">{{ t('terms_responsibility_title') }}</h2>
        <p>{{ t('terms_responsibility_text') }}</p>

        <p class="pt-10 text-sm text-gray-500 text-center">
          {{ t('last_updated') }}: 01.09.2025.
        </p>
      </div>
    </div>
  </div>
  <Footer/>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import HeaderLanding from "@/components/HeaderLanding.vue";
import Footer from "@/components/Footer.vue";
const { t } = useI18n()
</script>
