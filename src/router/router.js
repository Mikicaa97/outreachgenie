import { supabase } from '@/lib/supabaseClient'
import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/pages/Landing.vue'
import Login from '@/pages/Login.vue'
import Signup from '@/pages/Signup.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Profile from '@/pages/Profile.vue'
import Success from '@/pages/Success.vue'
import AppShell from '@/layouts/AppShell.vue'
import PrivacyPolicy from '@/pages/PrivacyPolicy.vue'
import TermsOfService from '@/pages/TermsOfService.vue'
import CookiesPolicy from '@/pages/CookiesPolicy.vue'
import Contact from '@/pages/Contact.vue'
import UpdatePassword from '@/views/UpdatePassword.vue'

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: Landing,
        meta: { requiresAuth: false }
    },
    { path: '/', name: 'Landing', component: Landing },
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/pages/Admin.vue'),
    },
    {
      path: '/weboro',
      name: 'Weboro',
      component: () => import('@/pages/Weboro.vue'),
    },
    {
        path: '/dashboard',
        component: AppShell,
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: Dashboard,
                meta: { requiresAuth: true }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: Profile,
                meta: { requiresAuth: true }
            },
            {
                path: '/my-emails',
                name: 'MyEmails',
                component: () => import('@/pages/MyEmails.vue'),
                meta: { requiresAuth: true }
            },
        ]
    },
    { path: '/success', name: 'Success', component: Success },
    { path: '/privacy', name: 'PrivacyPolicy', component: PrivacyPolicy },
    { path: '/terms', name: 'TermsOfService', component: TermsOfService },
    { path: '/cookies', name: 'CookiesPolicy', component: CookiesPolicy },
    { path: '/contact', name: 'Contact', component: Contact },
    { path: '/update-password', name: 'update-password', component: UpdatePassword },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// AUTH GUARD
router.beforeEach(async (to, from, next) => {
    const { data } = await supabase.auth.getUser()
    const user = data?.user

    if (to.meta.requiresAuth && !user) {
        next('/')
    } else if (to.path === '/' && user) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
