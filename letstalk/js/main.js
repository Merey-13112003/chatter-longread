/* ============================================================
   LET'S TALK — shared script for every page
   ============================================================ */

document.documentElement.classList.add('js');

/* Page order. To add, remove or rename a page, edit only this list
   (and set data-page="N" on the <body> of each page, starting at 0). */
const PAGES = [
  { file: 'index.html',                title: "Let's Talk" },
  { file: 'friday.html',               title: 'Friday, 7 PM' },
  { file: 'the-hard-part.html',        title: 'The Hard Part' },
  { file: 'why-friends.html',          title: 'Why We Need Friends' },
  { file: 'nadiya.html',               title: "Nadiya's Reason" },
  { file: 'what-brings-them.html',     title: 'What Brings Them Here' },
  { file: 'didar.html',                title: 'More Than a Club' },
  { file: 'strangers-to-friends.html', title: 'From Strangers to Friends' },
  { file: 'friday-9pm.html',           title: 'Friday, 9 PM' }
];

const pageIndex = parseInt(document.body.dataset.page || '0', 10);
const pad = n => String(n).padStart(2, '0');

/* ---------- Counter "03 / 09" ---------- */
const counter = document.querySelector('.counter');
if (counter) counter.textContent = pad(pageIndex + 1) + ' / ' + pad(PAGES.length);

/* ---------- Bottom pager: previous · dots · next ---------- */
const pager = document.querySelector('.pager');
if (pager) {
  const prev = PAGES[pageIndex - 1];
  const next = PAGES[pageIndex + 1];
  const prevHtml = prev
    ? `<a class="pager-link prev" href="${prev.file}">← <span>${prev.title}</span></a>`
    : '<span></span>';
  const dotsHtml = '<div class="dots">' + PAGES.map((p, i) =>
    `<a href="${p.file}" title="${p.title}" aria-label="${p.title}"${i === pageIndex ? ' class="active" aria-current="page"' : ''}></a>`
  ).join('') + '</div>';
  const nextHtml = next
    ? `<a class="pager-link next" href="${next.file}"><span>${next.title}</span> →</a>`
    : `<a class="pager-link next" href="${PAGES[0].file}"><span>Back to the start</span> ↺</a>`;
  pager.innerHTML = prevHtml + dotsHtml + nextHtml;
}

/* ---------- Arrow keys switch pages ---------- */
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (['input', 'textarea', 'audio', 'video', 'select', 'button'].includes(tag)) return;
  if (e.key === 'ArrowRight' && PAGES[pageIndex + 1]) location.href = PAGES[pageIndex + 1].file;
  if (e.key === 'ArrowLeft' && PAGES[pageIndex - 1]) location.href = PAGES[pageIndex - 1].file;
});

/* ---------- Photo slots: show the photo once the file exists ---------- */
document.querySelectorAll('.photo-slot img, .slide img').forEach(img => {
  const holder = img.closest('.photo-slot, .slide');
  const markLoaded = () => holder.classList.add('loaded');
  if (img.complete && img.naturalWidth > 0) markLoaded();
  else img.addEventListener('load', markLoaded);
});

/* ---------- Cover slideshow: a new photo every 2 seconds ---------- */
const SLIDE_INTERVAL = 2000; // milliseconds
const slides = Array.from(document.querySelectorAll('.slideshow .slide'));
if (slides.length) {
  let current = 0;
  slides[0].classList.add('active');
  if (slides.length > 1) {
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, SLIDE_INTERVAL);
  }
}

/* ---------- Fade-in on scroll ---------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(el => io.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

/* ---------- Synced subtitles (Nadiya's page) ----------
   Lines come from js/nadiya-subtitles.js (window.SUBTITLES). */
(function initSubtitles() {
  const audio = document.getElementById('sub-audio');
  const line = document.getElementById('sub-line');
  if (!audio || !line || !Array.isArray(window.SUBTITLES)) return;

  const cues = window.SUBTITLES.slice().sort((a, b) => a.start - b.start);
  const list = document.getElementById('transcript');
  const idleText = line.textContent;
  const fmt = s => Math.floor(s / 60) + ':' + pad(Math.floor(s % 60));

  const items = cues.map(cue => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = fmt(cue.start);
    const txt = document.createElement('span');
    txt.textContent = cue.text;
    btn.append(t, txt);
    btn.addEventListener('click', () => { audio.currentTime = cue.start + 0.01; audio.play(); });
    li.appendChild(btn);
    if (list) list.appendChild(li);
    return li;
  });

  let shown = -2;
  function show(index) {
    if (index === shown) return;
    shown = index;
    items.forEach((li, i) => li.classList.toggle('active', i === index));
    line.classList.add('fading');
    setTimeout(() => {
      if (index >= 0) {
        line.textContent = cues[index].text;
        line.classList.remove('idle');
      } else if (audio.currentTime < 0.05 || audio.ended) {
        line.textContent = idleText;
        line.classList.add('idle');
      } else {
        line.textContent = ' ';
        line.classList.remove('idle');
      }
      line.classList.remove('fading');
    }, 150);
  }

  function update() {
    const t = audio.currentTime;
    show(cues.findIndex(c => t >= c.start && t < c.end));
  }

  let raf = null;
  function loop() { update(); raf = requestAnimationFrame(loop); }
  audio.addEventListener('play', () => { cancelAnimationFrame(raf); loop(); });
  audio.addEventListener('pause', () => { cancelAnimationFrame(raf); update(); });
  audio.addEventListener('ended', () => { cancelAnimationFrame(raf); update(); });
  audio.addEventListener('seeked', update);

  audio.addEventListener('error', () => {
    const note = document.getElementById('audio-missing');
    if (note) note.hidden = false;
  });
})();
