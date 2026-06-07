import { api } from './axios';

export interface StudentGoogleAuthRequest {
  email: string;
  google_uid: string;
  name?: string;
  photo_url?: string;
}

export interface StudentGoogleAuthResponse {
  exists: boolean;
  needs_registration: boolean;
  student_id?: string | null;
  student?: any | null;
  message: string;
}

export interface StudentGoogleRegisterRequest {
  name: string;
  email: string;
  google_uid: string;
  reg_no: string;
  department: string;
  year: number;
  cgpa: number;
  college_name: string;
  previous_publications?: string;
  photo_url?: string;
}

export const studentAuthApi = {
  googleAuth: async (data: StudentGoogleAuthRequest): Promise<StudentGoogleAuthResponse> => {
    const response = await api.post('/students/google-auth', data);
    return response.data;
  },

  googleRegister: async (data: StudentGoogleRegisterRequest): Promise<any> => {
    const response = await api.post('/students/google-register', data);
    return response.data;
  },
};
