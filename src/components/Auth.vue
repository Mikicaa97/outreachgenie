<template>
  <div class="flex flex-col item-center justify-between min-h-screen bg-black text-white px-4">
    <img src="/src/assets/OutreachGenie-Logo.png" alt="OutreachGenie Logo" class="w-1/12 mx-auto" />
    <h2 class="text-2xl text-center font-bold mb-4">OutreachGenie – Registracija/Prijava</h2>
    <div class="space-y-4 mb-10 w-full max-w-xl mx-auto">
    <input v-model="email" type="email" placeholder="Email" class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400" />
    <input v-model="password" type="password" placeholder="Lozinka" class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400" />

    <button @click="login" class="hover:underline w-1/2 text-white font-semibold py-2 px-4 rounded mb-2">Prijavi se</button>
    <button @click="register" class="hover:underline w-1/2 text-white font-semibold py-2 px-4 rounded">Registruj se</button>
    </div>
  </div>
</template>


<script setup>
import {ref} from "vue";
import {supabase} from "../supabase.js";

const email = ref('')
const password = ref('')

const login = async () => {
  const {error} = await supabase.auth.signInWithPassword({email: email.value, password: password.value})
  if(error) alert('Greška pri prijavi: ' + error.message)
  else window.location.reload()
}

const register = async () => {
  if (!email.value || !password.value) {
    alert("Unesi email i lozinku.");
    return;
  }

  if (password.value.length < 6) {
    alert("Lozinka mora imati bar 6 karaktera.");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Greška pri registraciji: " + error.message);
    console.error("Greška:", error);
  } else {
    alert("Uspešna registracija! Proveri email.");
  }
}


</script>