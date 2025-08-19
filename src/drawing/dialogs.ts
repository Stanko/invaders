import { initDialog } from '../utils/dialog';

const aboutDialog = document.querySelector('.dialog--about') as HTMLDialogElement;
const galleryDialog = document.querySelector('.dialog--gallery') as HTMLDialogElement;
const aboutButton = document.querySelector('.nav-about-button') as HTMLDialogElement;
const galleryButton = document.querySelector('.nav-gallery-button') as HTMLDialogElement;

// About dialog
const { open: openAbout } = initDialog(aboutDialog);
aboutButton.addEventListener('click', openAbout);

// Gallery dialog
const { open: openGallery, close: closeGallery } = initDialog(galleryDialog);
galleryButton.addEventListener('click', openGallery);

export { closeGallery };
