import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to add auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized response
      store.dispatch('auth/logout');
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(router);
app.use(store);

// Initialize app with authentication check
const initializeApp = async () => {
  console.log('Initializing app...');
  
  // Check if we're on the callback route
  const isCallbackRoute = window.location.pathname === '/auth/callback';
  console.log('Is callback route:', isCallbackRoute);
  
  if (!isCallbackRoute) {
    const token = localStorage.getItem('token');
    console.log('Initial token:', token ? 'Present' : 'Not present');
    
    if (token) {
      try {
        console.log('Checking auth state...');
        const user = await store.dispatch('auth/checkAuth');
        
        if (user) {
          console.log('Auth state valid, navigating to send-email');
          // Only redirect if we're not already on the send-email page
          if (window.location.pathname !== '/send-email') {
            await router.push('/send-email');
          }
        } else {
          console.log('No auth state, redirecting to login');
          await router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await router.push('/login');
      }
    }
  }
  
  // Mount app after auth check is complete
  console.log('Mounting app...');
  app.mount('#app');
  console.log('App mounted');
};

initializeApp(); 