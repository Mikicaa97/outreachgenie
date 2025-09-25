<template>
  <!-- Dugme -->
  <button
      v-if="!isPro"
      @click="showTestNote = true"
      :class="[
        'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded',
        size === 'lg' ? 'text-lg px-6 py-3' : ''
      ]"
  >
    {{ t('upgrade_to_pro') || 'Try for free' }}
  </button>

  <!-- Modal -->
  <div
      v-if="showTestNote"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  >
    <div class="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold text-white mb-4">{{ t('test_version_title') }}</h2>
      <p class="text-gray-300 mb-6" v-html="t('test_version_text')"></p>

      <div class="flex justify-end gap-3">
        <button
            @click="showTestNote = false"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>

  <!-- 👇 Stripe dugme zakomentarisano dok ne krene plaćanje -->
  <!--
  <button
      v-if="!isPro"
      @click="handleUpgrade"
      :class="[
        'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded',
        size === 'lg' ? 'text-lg px-6 py-3' : ''
      ]"
  >
    {{ t('upgrade_to_pro') }}
  </button>
  -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
// import { upgrade } from '@/utils/upgrade'  // 👈 koristimo kasnije za Stripe
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  size: {
    type: String,
    default: 'base',
  },
})

const isPro = ref(false)
const email = ref('')

// state za modal
const showTestNote = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  email.value = data.user?.email

  const { data: userData } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', userId)
      .single()

  if (userData?.plan === 'pro') {
    isPro.value = true
  }
})

// Stripe handle (čuvamo za kasnije)
// const handleUpgrade = () => {
//   upgrade('pro', email.value)
// }
</script>
