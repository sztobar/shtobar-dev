import ImageProcessor, { ImageProcessConfig } from './image-processor';

interface ProcessImagesConfig {
  baseDir: string;
  outDir: string;
  images: ImageProcessConfig[];
}

const processImages = async ({
  baseDir,
  outDir,
  images,
}: ProcessImagesConfig) => {
  try {
    const imageProcessor = new ImageProcessor({
      baseDir,
      outDir,
    });

    for (let image of images) {
      await imageProcessor.process(image);
    }

    await imageProcessor.close();
  } catch (error) {
    console.error(error);
  }
};

export default processImages;
