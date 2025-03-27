<template>
  <div id="app">
    <el-container>
      <el-header v-if="isAuthenticated">
        <nav-bar @logout="handleLogout" />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import NavBar from '@/components/NavBar.vue';

export default defineComponent({
  name: 'App',
  components: {
    NavBar
  },
  setup() {
    const store = useStore();
    const isAuthenticated = computed(() => store.state.auth.isAuthenticated);

    const handleLogout = async () => {
      await store.dispatch('auth/logout');
    };

    // Log route changes
    onMounted(() => {
      console.log('App component mounted');
      console.log('Initial auth state:', isAuthenticated.value);
    });

    return {
      isAuthenticated,
      handleLogout
    };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.el-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style> 