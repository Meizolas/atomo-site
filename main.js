// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Stat counters
const counters = document.querySelectorAll('[data-count]');
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimal || '0', 10);
    const dur = 1600;
    const start = performance.now();
    const fmt = (v) => {
      if (dec) return v.toFixed(dec).replace('.', ',');
      return Math.round(v).toLocaleString('pt-BR');
    };
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * ease);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(end);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach(c => cio.observe(c));

// Cases carousel
(function(){
  const track = document.getElementById('ccTrack');
  if(!track) return;
  const slides = track.children;
  const total = slides.length;
  const dots = document.querySelectorAll('#ccDots .cc-dot');
  const bar = document.getElementById('ccBar');
  const curEl = document.getElementById('ccCur');
  const prev = document.getElementById('ccPrev');
  const next = document.getElementById('ccNext');
  let idx = 0, autoplay = null, autoplayMs = 6500, progressStart = 0, raf;
  const animatedSet = new Set();

  function animateNum(el){
    if(animatedSet.has(el)) return;
    animatedSet.add(el);
    const end = parseFloat(el.dataset.end);
    const start = performance.now();
    const dur = 1500;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if(p < 1) requestAnimationFrame(tick);
      else el.textContent = end;
    };
    requestAnimationFrame(tick);
  }

  function goTo(n, user){
    idx = (n + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    [...dots].forEach((d,i) => d.classList.toggle('active', i===idx));
    curEl.textContent = String(idx+1).padStart(2,'0');
    const numEl = slides[idx].querySelector('.cc-num');
    if(numEl){ numEl.textContent = '0'; animatedSet.delete(numEl); setTimeout(()=>animateNum(numEl), 250); }
    if(user) restartAutoplay();
    progressStart = performance.now();
  }

  function tickBar(t){
    if(!progressStart) progressStart = t;
    const p = Math.min(1, (t - progressStart) / autoplayMs);
    bar.style.width = (p*100)+'%';
    raf = requestAnimationFrame(tickBar);
  }
  function startAutoplay(){
    clearInterval(autoplay);
    cancelAnimationFrame(raf);
    progressStart = performance.now();
    raf = requestAnimationFrame(tickBar);
    autoplay = setInterval(()=>goTo(idx+1), autoplayMs);
  }
  function restartAutoplay(){ startAutoplay(); }

  prev.addEventListener('click', ()=>goTo(idx-1, true));
  next.addEventListener('click', ()=>goTo(idx+1, true));
  dots.forEach(d=>d.addEventListener('click', ()=>goTo(parseInt(d.dataset.i,10), true)));

  const wrap = document.getElementById('casesCarousel');
  wrap.addEventListener('mouseenter', ()=>{ clearInterval(autoplay); cancelAnimationFrame(raf); });
  wrap.addEventListener('mouseleave', startAutoplay);

  // Touch / drag
  let startX=0, dx=0, dragging=false;
  const onDown = (e)=>{ dragging=true; startX = (e.touches?e.touches[0].clientX:e.clientX); track.style.transition='none'; };
  const onMove = (e)=>{ if(!dragging) return; dx = (e.touches?e.touches[0].clientX:e.clientX) - startX; track.style.transform = `translateX(calc(-${idx*100}% + ${dx}px))`; };
  const onUp = ()=>{
    if(!dragging) return; dragging=false;
    track.style.transition='';
    if(Math.abs(dx) > 80){ goTo(idx + (dx<0?1:-1), true); } else { goTo(idx); }
    dx = 0;
  };
  track.addEventListener('mousedown', onDown);
  track.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, {passive:true});
  track.addEventListener('touchmove', onMove, {passive:true});
  track.addEventListener('touchend', onUp);

  const startIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const numEl = slides[0].querySelector('.cc-num');
        if(numEl) animateNum(numEl);
        startAutoplay();
        startIO.disconnect();
      }
    });
  }, {threshold:.3});
  startIO.observe(wrap);
})();

// Portfolio carousel
(function(){
  const track = document.getElementById('pfTrack');
  if(!track) return;
  const slides = track.children;
  const total = slides.length;
  const dots = document.querySelectorAll('#pfDots .pf-dot');
  const curEl = document.getElementById('pfCur');
  const prev = document.getElementById('pfPrev');
  const next = document.getElementById('pfNext');
  let idx = 0, autoplay = null, autoplayMs = 5500;

  function goTo(n, user){
    idx = (n + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    [...dots].forEach((d,i) => d.classList.toggle('active', i===idx));
    [...slides].forEach((s,i) => s.classList.toggle('active', i===idx));
    curEl.textContent = String(idx+1).padStart(2,'0');
    if(user) restartAutoplay();
  }
  function startAutoplay(){
    clearInterval(autoplay);
    autoplay = setInterval(()=>goTo(idx+1), autoplayMs);
  }
  function restartAutoplay(){ startAutoplay(); }

  prev.addEventListener('click', ()=>goTo(idx-1, true));
  next.addEventListener('click', ()=>goTo(idx+1, true));
  dots.forEach(d=>d.addEventListener('click', ()=>goTo(parseInt(d.dataset.i,10), true)));

  const wrap = document.getElementById('pfCarousel');
  wrap.addEventListener('mouseenter', ()=>clearInterval(autoplay));
  wrap.addEventListener('mouseleave', startAutoplay);

  // Touch / drag
  let startX=0, dx=0, dragging=false;
  const onDown = (e)=>{ dragging=true; startX = (e.touches?e.touches[0].clientX:e.clientX); track.style.transition='none'; };
  const onMove = (e)=>{ if(!dragging) return; dx = (e.touches?e.touches[0].clientX:e.clientX) - startX; track.style.transform = `translateX(calc(-${idx*100}% + ${dx}px))`; };
  const onUp = ()=>{
    if(!dragging) return; dragging=false;
    track.style.transition='';
    if(Math.abs(dx) > 80){ goTo(idx + (dx<0?1:-1), true); } else { goTo(idx); }
    dx = 0;
  };
  track.addEventListener('mousedown', onDown);
  track.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, {passive:true});
  track.addEventListener('touchmove', onMove, {passive:true});
  track.addEventListener('touchend', onUp);

  const startIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ startAutoplay(); startIO.disconnect(); } });
  }, {threshold:.25});
  startIO.observe(wrap);
})();

// Form handler
function handleSubmit(form){
  const btn = form.querySelector('button[type=submit]');
  const original = btn.innerHTML;
  btn.innerHTML = 'Enviando...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✓ Recebido. Retornaremos em até 24h.';
    btn.style.background = '#5cd071';
    btn.style.borderColor = '#5cd071';
    form.reset();
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 4000);
  }, 900);
}

// Particles.js init
if (typeof particlesJS !== 'undefined') {
  particlesJS('particles-js', {
    particles: {
      number: { value: 90, density: { enable: true, value_area: 900 } },
      color: { value: ['#E10600', '#ff5a52', '#ffffff'] },
      shape: { type: 'circle' },
      opacity: {
        value: 0.55,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.15 }
      },
      size: {
        value: 2.6,
        random: true,
        anim: { enable: true, speed: 2, size_min: 0.6 }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#E10600',
        opacity: 0.28,
        width: 1
      },
      move: { enable: true, speed: 1.4, random: true, out_mode: 'bounce' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        grab: { distance: 200, line_linked: { opacity: 0.6 } },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  });
}
