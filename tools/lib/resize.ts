interface GetResizeConfigParams {
  width: number;
  height: number;
  resize: number;
}

export function getResizeConfig({
  width,
  height,
  resize,
}: GetResizeConfigParams) {
  return {
    resize: {
      enabled: true,
      width: width * resize,
      height: height * resize,
      method: 'lanczos3',
      fitMethod: 'stretch',
      premultiply: true,
      linearRGB: true,
    },
  };
}
