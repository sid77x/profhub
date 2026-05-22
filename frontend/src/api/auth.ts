import { api } from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
  qualification?: string;
  college_name?: string;
  research_areas?: string;
  experience_years?: number;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface OtpSendResponse {
  message: string;
  expires_in_seconds: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  professor_id?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  requestRegisterOtp: async (data: RegisterRequest): Promise<OtpSendResponse> => {
    const response = await api.post('/auth/register/request-otp', data);
    return response.data;
  },

  verifyRegisterOtp: async (data: OtpVerifyRequest): Promise<any> => {
    const response = await api.post('/auth/register/verify-otp', data);
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<any> => {
    const response = await api.get(`/auth/me?token=${token}`);
    return response.data;
  },
};
