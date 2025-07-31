const ANIMATION_DURATION = 400;

export const initDialog = (dialog: HTMLDialogElement) => {
  let timeout: ReturnType<typeof setTimeout> | 0 = 0;

  const open = () => {
    dialog.showModal();
    // const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      document.documentElement.classList.add('no-scroll');
    }, ANIMATION_DURATION);
  };

  const close = () => {
    dialog.close();

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      document.documentElement.classList.remove('no-scroll');
    }, ANIMATION_DURATION);
  };

  dialog.addEventListener('close', () => {
    close();
  });

  dialog.querySelector('.dialog-backdrop')?.addEventListener('click', () => {
    close();
  });

  return {
    open,
    close,
  };
};
