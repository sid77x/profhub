export interface Application {
  id: string;
  gig_id: string;
  student_name: string;
  student_email: string;
  student_year?: string;
  student_cgpa?: string;
  resume_link: string;
  cover_letter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

export interface ApplicationCreate {
  gig_id: string;
  student_name: string;
  student_email: string;
  student_year?: string;
  student_cgpa?: string;
  resume_link: string;
  cover_letter?: string;
}
