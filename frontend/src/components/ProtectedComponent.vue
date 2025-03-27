<template>
  <div class="protected-component">
    <div v-if="isAuthenticated">
      <h2>Welcome, {{ currentUser?.email }}</h2>
      <p>Your tenant ID: {{ currentUser?.tenantId }}</p>
      <el-button type="danger" @click="handleLogout">Logout</el-button>
    </div>
    <div v-else>
      <p>Please log in to access this content</p>
      <el-button type="primary" @click="$router.push('/login')">Login</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ProtectedComponent',
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const currentUser = computed(() => store.getters['auth/currentUser']);

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    return {
      isAuthenticated,
      currentUser,
      handleLogout
    };
  }
});
</script>

<style scoped>
.protected-component {
  padding: 20px;
  text-align: center;
}

h2 {
  color: #409EFF;
  margin-bottom: 20px;
}

.el-button {
  margin-top: 20px;
}
</style> 