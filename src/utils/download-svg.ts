export const downloadSVG = async (svg: SVGElement, name: string = 'drawing.svg') => {
  const dataUri = `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`;

  const a = document.createElement('a');
  a.href = dataUri;
  a.download = name;
  a.click();
};
