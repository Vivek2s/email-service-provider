<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>Welcome to Email Service</h2>
      </template>
      <div class="login-content">
        <p>Please sign in with your Google account to continue</p>
        <el-button
          type="primary"
          size="large"
          @click="handleGoogleLogin"
          :loading="loading"
        >
          <el-icon><connection /></el-icon>
          Sign in with Google
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Connection } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'LoginView',
  components: {
    Connection
  },
  setup() {
    const loading = ref(false);

    const handleGoogleLogin = async () => {
      loading.value = true;
      try {
        window.location.href = `${process.env.VUE_APP_API_URL}/auth/google`;
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      handleGoogleLogin
    };
  }
});
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-content {
  text-align: center;
  padding: 20px 0;
}

.el-button {
  margin-top: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

h2 {
  margin: 0;
  color: #409EFF;
}
</style> 