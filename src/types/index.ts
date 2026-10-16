export interface Lead {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  event: string;
  notes: string;
  followUpStatus: 'pending' | 'in-progress' | 'completed' | 'not-needed';
  aiSummary?: string;
  aiDraftMessage?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone?: string;
  event: string;
  notes: string;
  followUpStatus: 'pending' | 'in-progress' | 'completed' | 'not-needed';
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
