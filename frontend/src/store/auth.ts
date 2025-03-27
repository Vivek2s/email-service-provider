import { Module, ActionContext } from 'vuex';
import axios from 'axios';
import store from '../store';

interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  tenantId?: string;
  userId?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const state: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false
};

const mutations = {
  SET_TOKEN(state: AuthState, token: string) {
    state.token = token;
    localStorage.setItem('token', token);
  },
  SET_USER(state: AuthState, user: User) {
    state.user = user;
    state.isAuthenticated = true;
  },
  CLEAR_AUTH(state: AuthState) {
    state.token = null;
    state.user = null;
    state.isAuthenticated = false;
    localStorage.removeItem('token');
  }
};

const actions = {
  async login({ commit }: ActionContext<AuthState, any>, token: string) {
    console.log('Auth store: Setting token');
    commit('SET_TOKEN', token);
    
    try {
      // Verify the token with backend
      const response = await axios.get(`${process.env.VUE_APP_API_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data) {
        commit('SET_USER', response.data);
        return response.data;
      }
      throw new Error('No user data received');
    } catch (error) {
      console.error('Login verification failed:', error);
      commit('CLEAR_AUTH');
      throw error;
    }
  },

  async checkAuth({ commit, state }: ActionContext<AuthState, any>) {
    if (!state.token) {
      console.log('No token found in state');
      return null;
    }

    try {
      console.log('Checking auth with token');
      const response = await axios.get(`${process.env.VUE_APP_API_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data) {
        commit('SET_USER', response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Auth check failed:', error);
      commit('CLEAR_AUTH');
      return null;
    }
  },

  async logout({ commit }: ActionContext<AuthState, any>) {
    try {
      await axios.post(`${process.env.VUE_APP_API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      commit('CLEAR_AUTH');
    }
  }
};

const getters = {
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  currentUser: (state: AuthState) => state.user,
  token: (state: AuthState) => state.token
};

export const auth: Module<AuthState, any> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 