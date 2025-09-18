<template>
  <div v-if="!accepted"
    class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-gray-900 text-white text-sm rounded-lg shadow-lg p-4 z-50"
  >
    <p class="mb-3">
      {{t('cookies_info')}}
      <RouterLink to="/cookies" class="underline text-purple-300">{{t('cookies_button')}}</RouterLink>.
    </p>
    <div class="flex gap-3 justify-end">
      <button @click="reject" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition">
        {{t('cookies_reject')}}
      </button>
      <button @click="accept" class="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition">
        {{ t('cookies_accept') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const accepted = ref(false)

onMounted(()=>{
  if(localStorage.getItem('cookiesAccepted') === true){
    accepted.value = true
  }
})

function accept(){
  localStorage.setItem('cookiesAccepted', 'true')
  accepted.value = true
}

function reject(){
  localStorage.setItem('cookiesAccepted', 'false')
  accepted.value = false
}
</script>
