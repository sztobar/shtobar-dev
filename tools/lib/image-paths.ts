import path from 'node:path';
import glob from 'glob';

export type ImagePathConfig = { imagePath: string } | { imagePaths: string[] };

export async function getImagePaths(baseDir: string, config: ImagePathConfig) {
  const imagePatterns = getImagePatterns(config);
  const globs = imagePatterns.map((imagePath) =>
    promiseGlob(path.join(baseDir, imagePath))
  );
  const matchGroups = await Promise.all(globs);
  return matchGroups.flat();
}

export async function isProcessedFileExist(filePath: string) {
  try {
    const globPattern = `${filePath}.*`;
    const matches = await promiseGlob(globPattern);
    return matches.length > 0;
  } catch {
    return false;
  }
}

function getImagePatterns(config: ImagePathConfig) {
  return 'imagePath' in config ? [config.imagePath] : config.imagePaths;
}

function promiseGlob(pattern: string) {
  return new Promise<string[]>((resolve, reject) =>
    glob(pattern, (err, matches) => (err ? reject(err) : resolve(matches)))
  );
}