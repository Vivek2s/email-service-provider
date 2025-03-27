<template>
  <div class="email-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Send Email</h3>
          <el-tag type="info">
            Quota: {{ quota.remainingQuota }}/{{ quota.dailyQuota }}
          </el-tag>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="To" prop="toAddress">
          <el-input
            v-model="form.toAddress"
            placeholder="recipient@example.com"
            type="email"
          />
        </el-form-item>

        <el-form-item label="Subject" prop="subject">
          <el-input
            v-model="form.subject"
            placeholder="Enter email subject"
          />
        </el-form-item>

        <el-form-item label="Body" prop="body">
          <el-input
            v-model="form.body"
            type="textarea"
            :rows="6"
            placeholder="Enter email body"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="quota.remainingQuota <= 0"
          >
            Send Email
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';

interface Quota {
  dailyQuota: number;
  remainingQuota: number;
  usedQuota: number;
}

export default defineComponent({
  name: 'EmailForm',
  setup() {
    const store = useStore();
    const formRef = ref<FormInstance>();
    const loading = ref(false);
    const quota = ref<Quota>({
      dailyQuota: 0,
      remainingQuota: 0,
      usedQuota: 0
    });

    const form = ref({
      toAddress: '',
      subject: '',
      body: ''
    });

    const rules = {
      toAddress: [
        { required: true, message: 'Please enter recipient email', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
      ],
      subject: [
        { required: true, message: 'Please enter email subject', trigger: 'blur' },
        { min: 3, max: 100, message: 'Length should be 3 to 100 characters', trigger: 'blur' }
      ],
      body: [
        { required: true, message: 'Please enter email body', trigger: 'blur' },
        { min: 10, message: 'Email body should be at least 10 characters', trigger: 'blur' }
      ]
    };

    const fetchQuota = async () => {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/email/quota`, {
          headers: {
            Authorization: `Bearer ${store.state.auth.token}`
          }
        });
        quota.value = await response.json();
      } catch (error) {
        console.error('Error fetching quota:', error);
        ElMessage.error('Failed to fetch email quota');
      }
    };

    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      try {
        await formRef.value.validate();
        loading.value = true;

        const response = await fetch(`${process.env.VUE_APP_API_URL}/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${store.state.auth.token}`
          },
          body: JSON.stringify(form.value)
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        ElMessage.success('Email queued successfully');
        form.value = {
          toAddress: '',
          subject: '',
          body: ''
        };
        await fetchQuota();
      } catch (error) {
        console.error('Error sending email:', error);
        ElMessage.error('Failed to send email');
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchQuota);

    return {
      formRef,
      form,
      rules,
      loading,
      quota,
      handleSubmit
    };
  }
});
</script>

<style scoped>
.email-form {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h3 {
  margin: 0;
  color: #409EFF;
}

.el-tag {
  font-size: 14px;
}
</style> 