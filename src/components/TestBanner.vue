<template>
  <div
      v-if="show"
      class="bg-purple-600 text-white text-center px-4 py-2 flex items-center justify-between text-xs sm:text-sm"
  >
    <p>
      🚀 {{ t('landing.testMode') }}
      <span class="underline font-semibold">{{ t('landing.unlimitedEmails') }}</span>
    </p>
    <button
        @click="close"
        class="ml-4 text-white hover:text-gray-200 font-bold"
        aria-label="Zatvori"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const show = ref(true)

const close = () => {
  show.value = false
}
</script>
