/* ============================================================
   NADIYA'S SUBTITLES (English translation of her voice note)

   Timings are worked out automatically: once the audio loads,
   each line gets a share of the recording's length based on
   how long that phrase is in the original (w = its length).
   If a line appears too early or too late, raise or lower its w,
   or change LEAD (silence at the start) / TAIL (silence at the end).
   ============================================================ */

(function () {
  const LEAD = 0.4; // seconds of silence before Nadiya starts speaking
  const TAIL = 0.5; // seconds of silence after she finishes

  const cues = [
  { w:  90, text: "At first, I started going to the speaking club to practise my English," },
  { w:  72, text: "but luckily for me, I also made some great friends there." },
  { w:  58, text: "And it's not just one or two people. It's a whole group." },
  { w:  49, text: "We've formed our own circle of friends," },
  { w:  62, text: "and it turns out we've been friends for almost a year and a half." },
  { w:  84, text: "At the beginning, I never thought I could make friends there." },
  { w:  66, text: "But now I see how great it is that I chose Chatterbox." },
  { w:  49, text: "I was looking at other speaking clubs too," },
  { w:  66, text: "but in the end I chose this one. I guess it just happened by chance." },
  { w:  89, text: "Over this year, month by month, we got to know each other better and better." },
  { w:  69, text: "Now a really big part of my life, most of my time," },
  { w:  32, text: "goes to my friends." },
  { w:  71, text: "We meet several times a week and stay in touch every day." },
  { w:  49, text: "And I think in that way, I've been really lucky." }
  ];

  // Placeholder timings until the audio file reports its length
  cues.forEach((c, i) => { c.start = i * 5; c.end = i * 5 + 5; });
  window.SUBTITLES = cues;

  function fitToAudio(audio) {
    if (!audio || !isFinite(audio.duration) || audio.duration <= 0) return;
    const speech = Math.max(audio.duration - LEAD - TAIL, 1);
    const total = cues.reduce((sum, c) => sum + c.w, 0);
    let t = LEAD;
    cues.forEach(c => {
      c.start = t;
      t += speech * (c.w / total);
      c.end = t;
    });
    // refresh the times shown in the transcript list
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    document.querySelectorAll('#transcript .t').forEach((el, i) => {
      if (cues[i]) el.textContent = fmt(cues[i].start);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('sub-audio');
    if (!audio) return;
    if (audio.readyState >= 1) fitToAudio(audio);
    audio.addEventListener('loadedmetadata', () => fitToAudio(audio));
    audio.addEventListener('durationchange', () => fitToAudio(audio));
  });
})();
