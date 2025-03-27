<template>
  <div class="auth-callback">
    <el-card class="callback-card">
      <template #header>
        <h2>Processing Authentication</h2>
      </template>
      <div class="callback-content">
        <el-icon class="loading-icon"><loading /></el-icon>
        <p>Please wait while we complete your sign-in...</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'AuthCallback',
  components: {
    Loading
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    onMounted(async () => {
      try {
        console.log('Auth callback mounted');
        console.log('Current route:', route.path);
        console.log('Route query:', route.query);
        console.log('Route params:', route.params);
        
        const token = route.query.token as string;
        if (!token) {
          console.error('No token received in callback');
          throw new Error('No token received');
        }
        console.log('Token received, attempting login...');
        
        // Set the token and initial state
        await store.dispatch('auth/login', token);
        console.log('Login successful, waiting before redirect...');
        
        // Add a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the auth state before redirecting
        const authState = store.state.auth;
        console.log('Auth state before redirect:', {
          isAuthenticated: authState.isAuthenticated,
          hasUser: !!authState.user,
          hasToken: !!authState.token
        });
        
        if (authState.isAuthenticated && authState.token) {
          console.log('Auth state verified, redirecting to send-email');
          await router.replace('/send-email');
        } else {
          console.error('Auth state verification failed');
          throw new Error('Auth state verification failed');
        }
      } catch (error) {
        console.error('Auth error:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        await router.replace('/login?error=auth_failed');
      }
    });
  }
});
</script>

<style scoped>
.auth-callback {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.callback-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.callback-content {
  padding: 20px 0;
}

.loading-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 20px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

h2 {
  margin: 0;
  color: #409EFF;
}
</style> 