export const REQUEST_LIMITS = {
  auth: {
    usernameMax: 64,
    passwordMax: 128,
    emailMax: 254,
    phoneMax: 20,
    nameMax: 128,
  },
  file: {
    fileNameMax: 255,
    // 100 MB per upload
    fileBytesMax: 100 * 1024 * 1024,
  },
} as const;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const assertMaxLength = (
  value: string,
  maxLength: number,
  fieldLabel: string,
) => {
  if (value.length > maxLength) {
    throw new Error(
      `${fieldLabel} excede o limite de ${maxLength} caracteres.`,
    );
  }
};

export const assertFileSize = (file: File, maxBytes: number, label: string) => {
  if (file.size > maxBytes) {
    throw new Error(`${label} excede o limite de ${formatBytes(maxBytes)}.`);
  }
};
