<template>
  <div class="nav-bar">
    <div class="logo">Email Service</div>
    <div class="user-info">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{ user?.name }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { ArrowDown } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'NavBar',
  components: {
    ArrowDown
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const store = useStore();
    const user = computed(() => store.state.auth.user);

    const handleCommand = (command: string) => {
      if (command === 'logout') {
        emit('logout');
      }
    };

    return {
      user,
      handleCommand
    };
  }
});
</script>

<style scoped>
.nav-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style> 