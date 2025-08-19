export type File = {
  id: string;
  user_id: string;
  storage_id: string;
  file_id: string;
  file_type: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
};

export type DashBoardType = {
  total_files: number;
  used_size: number;
  total_size: number;
  free_space: number;
  recent_files: File[];
};
