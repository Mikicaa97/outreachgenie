<template>
  <div
      v-if="visible"
      class="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black p-3 text-sm rounded-lg shadow-lg flex flex-col gap-2 transition transform animate-slide-in w-[380px] max-w-[90%] sm:w-[360px] md:w-[380px]"
  >
    <div class="flex justify-between items-start">
      <p class="text-md font-semibold">{{ t('free_plan_limit_reached') }}</p>
      <button
          @click="closeBanner"
          class="ml-2 text-black hover:text-gray-800 text-lg leading-none"
          aria-label="Close"
      >
        ✕
      </button>
    </div>

    <div class="flex gap-2 mt-2">
      <SubscribeButton
          class="bg-black text-white rounded px-4 py-2 text-sm hover:bg-gray-800 transition w-1/2 text-center"
      />

      <a
          href="https://buy.stripe.com/test_14A28t9hD7LB8lYcKbaVa01"
          class="bg-black text-white rounded px-4 py-2 text-sm hover:bg-gray-800 transition w-1/2 text-center"
          target="_blank"
      >
        {{ t('new_plan_soon') }}
      </a>
    </div>
  </div>
</template>

<script setup>
import SubscribeButton from "@/components/SubscribeButton.vue"
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()
const visible = ref(true)

const closeBanner = () => {
  visible.value = false
}
</script>
