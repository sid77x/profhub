export type CollegeOption = {
  value: string;
  label: string;
};

export const manipalColleges: CollegeOption[] = [
  { value: 'MIT', label: 'Manipal Institute of Technology (MIT)' },
  { value: 'KMC', label: 'Kasturba Medical College (KMC)' },
  { value: 'MCOPS', label: 'Manipal College of Pharmaceutical Sciences (MCOPS)' },
  { value: 'MCHP', label: 'Manipal College of Health Professions (MCHP)' },
  { value: 'MSAP', label: 'Manipal School of Architecture and Planning (MSAP)' },
  { value: 'WGSHA', label: 'Welcomgroup Graduate School of Hotel Administration (WGSHA)' },
  { value: 'MIC', label: 'Manipal Institute of Communication (MIC)' },
  { value: 'MCODS', label: 'Manipal College of Dental Sciences (MCODS)' },
  { value: 'MCON', label: 'Manipal College of Nursing (MCON)' },
  { value: 'MSLS', label: 'Manipal School of Life Sciences (MSLS)' },
  { value: 'MSIS', label: 'Manipal School of Information Sciences (MSIS)' },
  { value: 'MSM', label: 'Manipal School of Management (MSM)' }
];

export const manipalDepartmentsByCollege: Record<string, string[]> = {
  MIT: [
    'School of Computer Engineering',
    'School of Civil & Chemical Engineering',
    'School of Electrical Engineering',
    'School of Mechanical Engineering',
    'School of Basic Sciences, Humanities & Management Physics'
  ],
  KMC: ['(Departments coming soon)'],
  MCOPS: ['(Departments coming soon)'],
  MCHP: ['(Departments coming soon)'],
  MSAP: ['(Departments coming soon)'],
  WGSHA: ['(Departments coming soon)'],
  MIC: ['(Departments coming soon)'],
  MCODS: ['(Departments coming soon)'],
  MCON: ['(Departments coming soon)'],
  MSLS: ['(Departments coming soon)'],
  MSIS: ['(Departments coming soon)'],
  MSM: ['(Departments coming soon)']
};
