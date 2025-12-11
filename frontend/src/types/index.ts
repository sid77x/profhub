export interface Professor {
  id: string;
  name: string;
  department: string;
  email: string;
  college_name?: string;
  qualification?: string;
  research_areas?: string;
  experience_years?: number;
  previous_publications?: string;
}

export interface Gig {
  id: string;
  professor_id: string;
  title: string;
  description: string;
  area_of_study: string;
  technologies?: string;
  target_type?: string;
  paper_type?: string;
  timeline?: string;
  year_requirement?: string;
  cgpa_requirement?: string;
  funded: boolean;
  candidate_count?: number;
  status: 'open' | 'closed' | 'on-hold';
  publication_link?: string;
  publication_venue?: string;
  paused_reason?: string;
}

export interface GigCreate {
  professor_id: string;
  title: string;
  description: string;
  area_of_study: string;
  technologies?: string;
  target_type?: string;
  paper_type?: string;
  timeline?: string;
  year_requirement?: string;
  cgpa_requirement?: string;
  funded?: boolean;
  candidate_count?: number;
}

export interface GigUpdate {
  title?: string;
  description?: string;
  area_of_study?: string;
  technologies?: string;
  target_type?: string;
  paper_type?: string;
  timeline?: string;
  year_requirement?: string;
  cgpa_requirement?: string;
  funded?: boolean;
  candidate_count?: number;
}

export interface GigClose {
  publication_link?: string;
  publication_venue?: string;
}

export interface GigHold {
  paused_reason: string;
}
