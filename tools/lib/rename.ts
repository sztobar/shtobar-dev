
export interface RenameConfig {
  append?: string;
}

export function renameFile(filename: string, config: RenameConfig) {
  if (config.append) {
    return `${filename}${config.append}`;
  }
  return filename;
}