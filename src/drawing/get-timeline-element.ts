export const getTimelineElement = (offsets: number[], jumpTo: (index: number, play?: boolean) => void) => {
  const timelineEl = document.createElement('div');
  timelineEl.classList.add('timeline');

  offsets.forEach((_, index) => {
    const button = document.createElement('button');
    button.classList.add('timeline-button');
    button.textContent = index.toString();
    button.addEventListener('click', () => {
      jumpTo(index);
    });
    timelineEl.appendChild(button);
  });

  return timelineEl;
};
