import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import store from '@/store';
import Login from '@/views/Login.vue';
import EmailForm from '@/components/EmailForm.vue';
import AuthCallback from '@/views/AuthCallback.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: to => {
      const isAuthenticated = store.getters['auth/isAuthenticated'];
      return isAuthenticated ? '/send-email' : '/login';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { requiresAuth: false }
  },
  {
    path: '/send-email',
    name: 'SendEmail',
    component: EmailForm,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  console.log('Router navigation:', {
    to: to.path,
    from: from.path,
    query: to.query
  });
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  console.log('Auth state:', { requiresAuth, isAuthenticated });

  // Allow OAuth callback to proceed
  if (to.path === '/auth/callback') {
    console.log('Processing OAuth callback');
    next();
    return;
  }

  // If we're on the login page and already authenticated, redirect to send-email
  if (to.path === '/login' && isAuthenticated) {
    console.log('Already authenticated, redirecting to send-email');
    next('/send-email');
    return;
  }

  // If the route requires auth and we're not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    console.log('Route requires auth but not authenticated, redirecting to login');
    next('/login');
    return;
  }

  // If we're authenticated and trying to access a non-auth route, redirect to send-email
  if (isAuthenticated && !requiresAuth && to.path !== '/auth/callback') {
    console.log('Authenticated but accessing non-auth route, redirecting to send-email');
    next('/send-email');
    return;
  }

  next();
});

export default router; 