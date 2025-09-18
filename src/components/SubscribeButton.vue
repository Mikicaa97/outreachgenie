<template>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { upgrade } from '@/utils/upgrade'
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

const handleUpgrade = () => {
  upgrade('pro', email.value)
}
</script>
