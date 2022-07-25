#!/usr/bin/env ts-node
import { encodeLow, encodeMedium } from './lib/configs';
import processImages from './lib/process-images';

processImages({
  baseDir: 'images',
  outDir: 'public/assets/images',
  images: [
    {
      imagePath: 'bg/*',
      config: [
        {
          rename: {
            append: '-2x'
          },
          encode: encodeLow,
        },
        {
          encode: encodeMedium,
        }
      ],
    },
    {
      imagePaths: ['avatars/*', 'games/*'],
      config: [
        {
          rename: {
            append: '-2x'
          },
          resize: 2,
          encode: encodeLow,
        },
        {
          encode: encodeMedium,
        },
      ],
    },
    {
      imagePaths: ['posts/*'],
    },
  ],
});
