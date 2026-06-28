export type FileType = {
  id: string;
  user_id: string;
  storage_id: string;
  file_id: string;
  file_type: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  blob?: string;
};

export type DashBoardType = {
  total_files: number;
  used_size: number;
  total_size: number;
  free_space: number;
  recent_files: FileType[];
  weekly_usage: {
    day: string;
    file_amount: number;
  }[];
};

// ── Multi-bucket types ───────────────────────────────────────────────────────

export type Bucket = {
  bucket_id: string;
  user_id: string;
  name: string;
  r2_name: string;
  status: "pending" | "active" | "error";
  created_at: string;
};

export type Directory = {
  dir_id: string;
  bucket_id: string;
  name: string;
  created_at: string;
};

export type MediaFile = {
  key: string;
  size: number;
  last_modified: string;
  public_url: string;
};
