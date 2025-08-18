export const getTimelineElement = (offsets: number[], jumpTo: (index: number, play?: boolean) => void) => {
  const timelineEl = document.createElement('div');
  timelineEl.classList.add('timeline');

  let activeIndex = -1;

  const jump = (index: number) => {
    if (index >= 0 && index < offsets.length) {
      activeIndex = index;
      timelineEl.querySelector('.active')?.classList.remove('active');
      timelineEl.querySelector(`button:nth-child(${index + 2})`)?.classList.add('active');
      jumpTo(activeIndex);
    }
  };

  const nextButton = document.createElement('button');
  nextButton.classList.add('timeline-button');
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', () => {
    jump(activeIndex + 1);
  });

  const prevButton = document.createElement('button');
  prevButton.classList.add('timeline-button');
  prevButton.textContent = 'Previous';
  prevButton.addEventListener('click', () => {
    jump(activeIndex - 1);
  });
  timelineEl.appendChild(prevButton);

  offsets.forEach((_, index) => {
    const button = document.createElement('button');
    button.classList.add('timeline-button');
    button.textContent = index.toString();
    button.addEventListener('click', () => {
      jump(index);
    });
    timelineEl.appendChild(button);
  });
  timelineEl.appendChild(nextButton);

  return timelineEl;
};
