<template>
  <header class="w-full fixed top-0 left-0 z-50 bg-black bg-opacity-80 backdrop-blur-md border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center justify-center">
          <img
              src="/src/assets/outreachgenielogo.png"
              alt="OutreachGenie Logo"
              class="max-w-[140px] sm:max-w-[160px] md:max-w-[140px] lg:max-w-[150px] xl:max-w-[120px] h-auto mt-1 object-contain"
          />
        </router-link>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center space-x-8 text-sm text-gray-300 font-medium">
          <a href="#features" class="hover:text-white transition">{{ $t('nav_features') }}</a>
          <a href="#demo" class="hover:text-white transition">{{ $t('nav_demo') }}</a>
          <a href="#livedemo" class="hover:text-yellow-400 transition">{{ $t('nav_livedemo') }}</a>
          <a href="#pricing" class="hover:text-white transition">{{ $t('nav_pricing') }}</a>
          <a href="#faq" class="hover:text-white transition">{{ $t('nav_faq') }}</a>
          <RouterLink to="/contact" class="hover:text-white transition">{{ $t('nav_contact') }}</RouterLink>
        </nav>

        <div class="flex items-center gap-4">
          <!-- CTA dugme -->
          <div class="hidden md:block">
            <router-link to="/signup">
              <button class="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                {{ $t('nav_try_free') }}
              </button>
            </router-link>
          </div>

          <!-- Language switch -->
          <button
              @click="switchLang"
              class="text-sm border border-zinc-700 px-3 py-1 rounded hover:border-yellow-400 text-white"
          >
            {{ locale.toUpperCase() }}
          </button>

          <!-- Mobile Menu toggle -->
          <div class="md:hidden">
            <button @click="isOpen = !isOpen" class="text-white focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <transition name="slide-fade">
      <div v-if="isOpen" class="md:hidden bg-black text-white px-4 py-4 space-y-4 border-t border-gray-800">
        <a href="#features" class="block hover:text-yellow-400">{{ $t('nav_features') }}</a>
        <a href="#demo" class="block hover:text-yellow-400">{{ $t('nav_demo') }}</a>
        <a href="#livedemo" class="block hover:text-yellow-400">{{ $t('nav_livedemo') }}</a>
        <a href="#pricing" class="block hover:text-yellow-400">{{ $t('nav_pricing') }}</a>
        <a href="#faq" class="block hover:text-yellow-400">{{ $t('nav_faq') }}</a>
        <a href="/contact" class="block hover:text-yellow-400">{{ $t('nav_contact') }}</a>

        <router-link to="/signup" class="block">
          <button class="w-full mt-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
            {{ $t('nav_try_free') }}
          </button>
        </router-link>

        <!-- Language switch -->
        <button
            @click="switchLang"
            class="w-full mt-4 text-sm border border-zinc-700 px-3 py-2 rounded hover:border-yellow-400"
        >
          {{ locale.toUpperCase() }}
        </button>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const isOpen = ref(false)
const { locale } = useI18n()

const switchLang = () => {
  locale.value = locale.value === 'sr' ? 'en' : 'sr'
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
