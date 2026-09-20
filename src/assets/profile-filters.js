document.querySelectorAll('[data-publication-grid]').forEach(section => {
  const buttons = [...section.querySelectorAll('[data-topic]')];
  const cards = [...section.querySelectorAll('[data-topics]')];
  const status = section.querySelector('[data-publication-count]');
  for (const button of buttons) {
    button.disabled = false;
    button.addEventListener('click', () => {
      const topic = button.dataset.topic;
      for (const option of buttons) option.setAttribute('aria-pressed', String(option === button));
      for (const card of cards) card.hidden = topic !== 'all' && !card.dataset.topics.split(' ').includes(topic);
      const count = cards.filter(card => !card.hidden).length;
      status.textContent = `${count} ${count === 1 ? 'paper' : 'papers'}`;
    });
  }
});
