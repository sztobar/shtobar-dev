import fs from 'fs/promises';
import path from 'path';
// @ts-expect-error
import { ImagePool } from '@squoosh/lib';
import { getImagePaths, ImagePathConfig } from './image-paths';
import { getResizeConfig } from './resize';
import { RenameConfig, renameFile } from './rename';

type EncodeConfig = object;

interface ImageConfig {
  resize?: number;
  encode: EncodeConfig;
  rename?: RenameConfig;
}

export type ImageProcessConfig = {
  config?: ImageConfig | ImageConfig[];
} & ImagePathConfig;

interface ImageProcessorParams {
  baseDir: string;
  outDir: string;
}

class ImageProcessor {
  private imagePool: ImagePool;
  private processes: Array<Promise<void>>;
  private baseDir: string;
  private outDir: string;

  constructor({ baseDir, outDir }: ImageProcessorParams) {
    this.baseDir = baseDir;
    this.outDir = outDir;
    this.imagePool = new ImagePool();
    this.processes = [];
  }

  async process({ config, ...imagePathConfig }: ImageProcessConfig) {
    const imagePaths = await getImagePaths(this.baseDir, imagePathConfig);
    if (config) {
      const configs = Array.isArray(config) ? config : [config];
      return this.processWithConfig(imagePaths, configs);
    } else {
      return this.copyFiles(imagePaths);
    }
  }

  async processWithConfig(imagePaths: string[], configs: ImageConfig[]) {
    for (const imagePath of imagePaths) {
      for (const singleConfig of configs) {
        this.processes.push(this.processImage(imagePath, singleConfig));
      }
    }
  }

  async copyFiles(imagePaths: string[]) {
    for (const imagePath of imagePaths) {
      this.processes.push(this.copyImage(imagePath));
    }
  }

  private async processImage(
    imagePath: string,
    { resize, encode, rename }: ImageConfig
  ) {
    console.log(`Processing ${imagePath}`);
    const image = this.imagePool.ingestImage(imagePath);

    const imageData: {
      bitmap: { width: number; height: number };
      size: number;
    } = await image.decoded;
    const imagePathObj = path.parse(imagePath);
    let imageOutName = imagePathObj.name;

    if (resize) {
      await image.preprocess(
        getResizeConfig({
          width: imageData.bitmap.width,
          height: imageData.bitmap.height,
          resize,
        })
      );
    }

    if (rename) {
      imageOutName = renameFile(imagePathObj.name, rename);
    }

    await image.encode(encode);

    const newImagePath = path.join(
      this.outDir,
      imagePathObj.dir.substring(this.baseDir.length),
      imageOutName
    );
    const encodedImages = Object.values(image.encodedWith) as Array<
      Promise<{
        extension: string;
        binary: string;
      }>
    >;
    await fs.mkdir(path.dirname(newImagePath), { recursive: true });

    for await (const encodedImage of encodedImages) {
      const outPath = `${newImagePath}.${encodedImage.extension}`;
      console.log(`Writing ${imagePath} as ${outPath}`);
      await fs.writeFile(outPath, encodedImage.binary);
    }

    if (!encode.hasOwnProperty('mozjpeg')) {
      const outPath = `${newImagePath}${imagePathObj.ext}`;
      console.log(`Writing ${imagePath} as ${outPath}`);
      await fs.copyFile(imagePath, outPath);
    }

    return;
  }

  private async copyImage(imagePath: string) {
    const imagePathObj = path.parse(imagePath);
    let imageOutName = imagePathObj.name;

    const newImagePath = path.join(
      this.outDir,
      imagePathObj.dir.substring(this.baseDir.length),
      imageOutName
    );
    await fs.mkdir(path.dirname(newImagePath), { recursive: true });

    const outPath = `${newImagePath}${imagePathObj.ext}`;
    console.log(`Writing ${imagePath} as ${outPath}`);
    await fs.copyFile(imagePath, outPath);

    return;
  }

  async close() {
    await Promise.all(this.processes);
    return this.imagePool.close();
  }
}

export default ImageProcessor;
