import { getKey } from './get-key';
import type { Options } from './options-type';

export class Gallery {
  static LS_KEYS = 'invader-gallery-keys';
  static LS_HTML = 'invader-gallery-html';

  static MAX_ITEMS = 24;

  keys: string[] = [];
  html: string[] = [];

  galleryElement = document.querySelector('.gallery') as HTMLDivElement;

  constructor() {
    const savedKeys = localStorage.getItem(Gallery.LS_KEYS);
    const savedSVGs = localStorage.getItem(Gallery.LS_HTML);

    if (savedKeys && savedSVGs) {
      try {
        this.keys = JSON.parse(savedKeys);
        this.html = JSON.parse(savedSVGs);
      } catch (e) {
        console.log('Error while parsing history data', e);
        localStorage.removeItem(Gallery.LS_KEYS);
        localStorage.removeItem(Gallery.LS_HTML);
      }
    }

    const content = [];
    for (let i = this.html.length - 1; i >= 0; i--) {
      content.push(this.html[i]);
    }

    this.galleryElement.innerHTML = content.join('');
  }

  add(options: Options, svg: SVGElement) {
    const key = getKey(options);

    if (this.keys.includes(key)) {
      return;
    }

    const link = this.getLink(svg);

    this.keys.push(key);
    this.html.push(link.outerHTML);

    if (this.keys.length > Gallery.MAX_ITEMS) {
      this.keys.shift();
      this.html.shift();
    }

    localStorage.setItem(Gallery.LS_KEYS, JSON.stringify(this.keys));
    localStorage.setItem(Gallery.LS_HTML, JSON.stringify(this.html));

    this.galleryElement.prepend(link);
    if (this.galleryElement.children.length > Gallery.MAX_ITEMS && this.galleryElement.lastElementChild) {
      this.galleryElement.removeChild(this.galleryElement.lastElementChild);
    }
  }

  getLink(svg: SVGElement) {
    const link = document.createElement('a');
    link.href = window.location.hash;
    link.append(svg);

    return link;
  }
}
