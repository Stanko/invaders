export const downloadSVG = async (svg: SVGElement, name: string = 'invader.svg') => {
  const dataUri = `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`;

  const a = document.createElement('a');
  a.href = dataUri;
  a.download = name;
  a.click();
};

export const downloadPNG = async (svg: SVGElement, size: number, scale: number, name: string = 'invader.png') => {
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;

  const img = new Image();

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  img.addEventListener('load', () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = dataUri;
    a.download = name;
    a.click();
  });

  img.src = `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`;
};
