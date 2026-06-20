if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });


function bootGsap() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}
bootGsap();

/* ─── PRELOADER ─── */
function revealHero() {
  const pre = document.getElementById('preloader');
  if (pre) pre.style.display = 'none';
  document.body.classList.add('is-ready');
  if (typeof gsap === 'undefined') {
    ['#heroTitle', '#heroSub'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    const line = document.getElementById('heroLine');
    if (line) line.style.width = '56px';
    startSlideshow();
    return;
  }
  gsap.to('#heroTitle', { opacity:1, y:0, duration:1.1, ease:'power3.out', delay:0.1 });
  gsap.to('#heroLine',  { width:'56px', duration:0.8, ease:'power2.out', delay:0.6 });
  gsap.to('#heroSub',   { opacity:1, duration:0.8, ease:'power2.out', delay:0.9 });
  startSlideshow();
  initScrollAnimations();
}

function runPreloader() {
  bootGsap();
  const pre     = document.getElementById('preloader');
  const logo    = document.getElementById('preloaderLogo');
  const name    = document.getElementById('preloaderName');
  const tag     = document.getElementById('preloaderTag');
  const bar     = document.getElementById('preloaderBar');
  const percent = document.getElementById('preloaderPercent');
  const wrap    = document.querySelector('.preloader-progress-wrap');

  if (!pre) { revealHero(); return; }

  if (logo && typeof LOGO_LIGHT !== 'undefined') logo.src = LOGO_LIGHT;

  if (typeof gsap === 'undefined') {
    if (bar) bar.style.width = '100%';
    if (percent) percent.textContent = '100%';
    pre.style.display = 'none';
    revealHero();
    return;
  }

  const progress = { val: 0 };
  const updatePercent = () => {
    const n = Math.round(progress.val);
    if (percent) percent.textContent = n + '%';
    if (bar) bar.style.width = n + '%';
  };

  gsap.timeline()
    .to(logo, { opacity:1, scale:1, duration:0.7, ease:'power2.out', delay:0.15 })
    .to(name, { opacity:1, y:0, duration:0.6, ease:'power2.out' }, '-=0.35')
    .to(tag,  { opacity:1, duration:0.5, ease:'power2.out' }, '-=0.3')
    .to(wrap, { opacity:1, duration:0.4, ease:'power2.out' }, '-=0.2')
    .to(progress, {
      val: 100,
      duration: 2.4,
      ease: 'power1.inOut',
      onUpdate: updatePercent,
      onComplete: () => {
        gsap.to(pre, {
          yPercent: -100,
          duration: 0.85,
          ease: 'power3.inOut',
          delay: 0.2,
          onComplete: revealHero
        });
      }
    });
}

window.addEventListener('load', runPreloader);

setTimeout(() => {
  const pre = document.getElementById('preloader');
  if (pre && pre.style.display !== 'none') revealHero();
}, 8000);



/* ─── HERO SLIDESHOW ─── */
let slideIdx = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots   = document.querySelectorAll('.hero-dot');
let slideshowTimer = null;

function goToSlide(n) {
  if (!slides.length) return;
  slides[slideIdx]?.classList.remove('active');
  dots[slideIdx]?.classList.remove('active');
  slideIdx = n;
  slides[slideIdx]?.classList.add('active');
  dots[slideIdx]?.classList.add('active');
}
function nextSlide() {
  if (slides.length < 2) return;
  goToSlide((slideIdx + 1) % slides.length);
}
function startSlideshow() {
  if (slideshowTimer) clearInterval(slideshowTimer);
  if (slides.length < 2) return;
  slideshowTimer = setInterval(nextSlide, 4500);
}






/* ─── NAVBAR ─── */
let currentPage = 'home';

const LOGO_LIGHT = 'light_logo_transperent_2.png';
const LOGO_DARK  = 'light_logo_transperent_2.png';

function setNavStyle(isDark) {
  const nb  = document.getElementById('navbar');
  const img = document.getElementById('navLogoImg');
  if (!nb || !img) return;
  nb.classList.toggle('dark-nav',  isDark);
  nb.classList.toggle('light-nav', !isDark);
  img.setAttribute('src', isDark ? LOGO_LIGHT : LOGO_DARK);
  img.style.height = '60px';
  img.style.width  = 'auto';
  img.style.maxWidth = '220px';
}

window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  nb.classList.toggle('scrolled', window.scrollY > 60);
  if (currentPage === 'home') {
    const heroH = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    setNavStyle(window.scrollY < heroH - 80);
  }
});






/* ─── PAGE ROUTING ─── */
const darkBgPages = ['home','commercial','wedding'];

function navigateTo(page) {
  // window.scrollTo(0, 0); 
  if (page === currentPage) return;
  if (typeof gtag !== 'undefined') gtag('event','page_view',{page_path:'/'+page});
  const outEl = document.getElementById('page-' + currentPage);
  const inEl  = document.getElementById('page-' + page);
  gsap.to(outEl, { opacity:0, duration:0.3, onComplete: () => {
    outEl.classList.remove('active');
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    inEl.classList.add('active');
    inEl.style.opacity = 0;
    gsap.to(inEl, { opacity:1, duration:0.4, ease:'power2.out' });
    currentPage = page;
    updateNavLinks(page);
    setNavStyle(darkBgPages.includes(page));
    ScrollTrigger.refresh();
    initScrollAnimations();
  }});
}

function updateNavLinks(page) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

/* ─── SCROLL ANIMATIONS ─── */
function initScrollAnimations() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el._scrollTrigger) return;
    el._scrollTrigger = true;
    gsap.fromTo(el,
      { opacity:0, y:28 },
      { opacity:1, y:0, duration:0.85, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:'play none none none' }
      }
    );
  });

  /* Counter animation */
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    if (el._counted) return;
    el._counted = true;
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el, start:'top 85%',
      onEnter: () => {
        const suffix = el.dataset.suffix || '';
        gsap.to({ val:0 }, {
          val: target, duration:1.8, ease:'power2.out',
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].val) + suffix; },
          onComplete: () => { el.textContent = target + suffix; }
        });
      }
    });
  });
}

/* ─── MOBILE MENU ─── */
function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    menu.classList.remove('open');
    ham.classList.remove('open');
    setTimeout(() => menu.style.display = 'none', 300);
  } else {
    menu.style.display = 'flex';
    requestAnimationFrame(() => menu.classList.add('open'));
    ham.classList.add('open');
  }
}















/* ═══════════════════════════════════════════════════════
   STORIES BY DARSHAN — Wedding Films Page
   wedding-films.js  (v2)
═══════════════════════════════════════════════════════ */
'use strict';

/* ──────────────────────────────────────────────────────
   1. HERO — poster fallback when video file missing
────────────────────────────────────────────────────── */
(function () {
  const vid = document.querySelector('.hero__video');
  if (!vid) return;
  vid.addEventListener('error', () => { vid.style.display = 'none'; });
  vid.play().catch(() => {});
})();


/* ──────────────────────────────────────────────────────
   2. SCROLL REVEAL — IntersectionObserver
────────────────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });
  els.forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────────────────
   3. WORKS CAROUSEL — ultra-smooth rAF-based infinite scroll
   Strategy:
   · Clone the card set once in JS (so HTML stays clean — no manual duplication needed)
   · Drive translateX via requestAnimationFrame for perfectly smooth motion
   · Pause on hover/touch; resume on leave
────────────────────────────────────────────────────── */
(function () {
  const track = document.getElementById('worksTrack');
  if (!track) return;

  /* ── Clone children for seamless loop ── */
  const originals = Array.from(track.children);
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  /* Tell CSS we're taking over animation */
  track.classList.add('js-driven');

  const SPEED = 0.55;
  let SPEED_DIR = -1; /* -1 = left (default), 1 = right */
  let x = 0;
  let paused = false;
  let rafId;

  function getHalfWidth() {
    /* half of total track (originals only) */
    return track.scrollWidth / 2;
  }

  function tick() {
    if (!paused) {
      x += SPEED * SPEED_DIR;
      const half = getHalfWidth();
          /* Loop in BOTH directions */
      if (x <= -half) {
        x = 0;           /* scrolled too far left — reset */
      }
      if (x > 0) {
        x = -half + 1;   /* scrolled too far right — jump to end */
      }
      track.style.transform = `translateX(${x}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  /* Pause on hover */
  // track.addEventListener('mouseenter', () => { paused = true; });
  // track.addEventListener('mouseleave', () => { paused = false; });

  const wrap = track.closest('.works__carousel-wrap') || track.parentElement;

wrap.addEventListener('mousemove', (e) => {
  const rect = wrap.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const edgeZone = rect.width * 0.12; /* 12% from each edge */

  if (x < edgeZone) {
    paused = false;
    SPEED_DIR = 1; /* scroll right (reverse) */
  } else if (x > rect.width - edgeZone) {
    paused = false;
    SPEED_DIR = -1; /* scroll left (normal) */
  } else {
    paused = true;
    SPEED_DIR = -1;
  }
});

wrap.addEventListener('mouseleave', () => {
  paused = false;
  SPEED_DIR = -1;
});




  /* Pause on touch */
  let touchX = 0;
  track.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    paused = true;
  }, { passive: true });
  track.addEventListener('touchend', () => {
    paused = false;
  }, { passive: true });

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
  });
})();


/* ──────────────────────────────────────────────────────
   4. CINEMA VIDEO — fallback poster
────────────────────────────────────────────────────── */
(function () {
  const vid = document.querySelector('.cinema__video');
  if (!vid) return;
  vid.addEventListener('error', () => { vid.style.display = 'none'; });
  vid.play().catch(() => {});
})();


/* ──────────────────────────────────────────────────────
   5. LAZY VIDEO PLAY via IntersectionObserver
   (Mosaic & any in-page videos play only when visible)
────────────────────────────────────────────────────── */
(function () {
  const videos = document.querySelectorAll('video:not(.hero__video):not(.cinema__video)');
  if (!videos.length) return;
  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.play().catch(() => {});
      } else {
        e.target.pause();
      }
    });
  }, { threshold: 0.15 });
  videos.forEach(v => vio.observe(v));
})();


/* ──────────────────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLL
────────────────────────────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();








/* ── YouTube inline card player ── */
function closeYTCard(wrap) {
  const iframe = wrap.querySelector('iframe');
  if (!iframe) return;
  iframe.remove();
  wrap.querySelector('img').classList.remove('hidden');
  wrap.querySelector('.work-card__play').classList.remove('hidden');
}

/* ── Commercial grid card player ── */
function closeCommCard(wrap) {
  const video = wrap.querySelector('video');
  if (!video) return;

  video.pause();
  video.remove();

  wrap.querySelector('img').classList.remove('hidden');
  wrap.querySelector('.vc-play').classList.remove('hidden');
}

function openCommCard(card) {
  const wrap = card.querySelector('.vc-img-wrap');
  const videoPath = wrap.getAttribute('data-video');
  if (!videoPath) return;

  /* Toggle off if already playing */
  if (wrap.querySelector('video')) {
    closeCommCard(wrap);
    return;
  }

  /* Close any other playing card */
  document.querySelectorAll('#page-commercial .vc-img-wrap video').forEach(existing => {
    closeCommCard(existing.closest('.vc-img-wrap'));
  });

  /* Hide thumbnail and play icon */
  wrap.querySelector('img').classList.add('hidden');
  wrap.querySelector('.vc-play').classList.add('hidden');

  /* Create local video */
  const video = document.createElement('video');
  video.src = videoPath;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'metadata';

  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';

  wrap.appendChild(video);
}







// function openYTCard(card) {
//   const wrap = card.querySelector('.work-card__img-wrap');
//   const ytId = wrap.getAttribute('data-yt-id');
//   if (!ytId) return;

//   /* If already playing this card — clicking again closes it */
//   if (wrap.querySelector('iframe')) {
//     closeYTCard(wrap);
//     return;
//   }

//   /* Close ANY other card that is currently playing */
//   document.querySelectorAll('.work-card__img-wrap iframe').forEach(existingIframe => {
//     closeYTCard(existingIframe.closest('.work-card__img-wrap'));
//   });

//   /* Hide thumbnail and play button */
//   wrap.querySelector('img').classList.add('hidden');
//   wrap.querySelector('.work-card__play').classList.add('hidden');

//   /* Pause the carousel while video plays */
//   const track = document.getElementById('worksTrack');
//   if (track) track.dispatchEvent(new MouseEvent('mouseenter'));

//   /* Inject YouTube iframe */
//   const iframe = document.createElement('iframe');
//   iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${window.location.origin}`;
//   iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
//   iframe.allowFullscreen = true;
//   wrap.appendChild(iframe);
// }


function openYTCard(card) {
  const wrap = card.querySelector('.work-card__img-wrap');
  const videoPath = wrap.getAttribute('data-video');
  if (!videoPath) return;

  /* If already playing, close */
  if (wrap.querySelector('video')) {
    closeYTCard(wrap);
    return;
  }

  /* Close any other playing video */
  document.querySelectorAll('.work-card__img-wrap video').forEach(existingVideo => {
    closeYTCard(existingVideo.closest('.work-card__img-wrap'));
  });

  /* Hide thumbnail and play button */
  wrap.querySelector('img').classList.add('hidden');
  wrap.querySelector('.work-card__play').classList.add('hidden');

  /* Pause carousel */
  const track = document.getElementById('worksTrack');
  if (track) track.dispatchEvent(new MouseEvent('mouseenter'));

  /* Create local video */
  const video = document.createElement('video');
  video.src = videoPath;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.style.width = '100%';
  video.style.height = '100%';

  wrap.appendChild(video);
}







// Color Grading Slider Interaction
const sliderContainers = document.querySelectorAll('.ba-slider-container');

sliderContainers.forEach(container => {
  const input = container.querySelector('.ba-slider-input');
  
  input.addEventListener('input', (e) => {
    // Updates the CSS variable dynamically as the user drags
    container.style.setProperty('--position', `${e.target.value}%`);
  });
});



/* ─── FAQ ─── */
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ─── LIGHTBOX ─── */
function openLightbox(videoId, caption) {
  document.getElementById('lightboxIframe').src =
    'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
  document.getElementById('lightboxCaption').textContent = caption;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxIframe').src = '';
  document.body.style.overflow = '';
}
function closeLightboxOutside(e) { if (e.target.id === 'lightbox') closeLightbox(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


/* ─── CONTACT FORM SUBMIT ─── */
function submitContactForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const name    = form.querySelector('input[type="text"]').value;
  const email   = form.querySelector('input[type="email"]').value;
  const phone   = form.querySelector('input[type="tel"]').value;
  const project = form.querySelector('select').value;
  const message = form.querySelector('textarea').value;
  const subject = encodeURIComponent('New Enquiry from ' + name + ' — ' + project);
  const body    = encodeURIComponent(
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'Phone: ' + phone + '\n' +
    'Project Type: ' + project + '\n\n' +
    'Message:\n' + message
  );
  window.location.href = 'mailto:arroravaibhav797@gmail.com?subject=' + subject + '&body=' + body;
}

/* ─── INIT ─── */

function initFooterLogos() {
  if (typeof LOGO_LIGHT === 'undefined') return;
  document.querySelectorAll('.footer-logo-img').forEach(img => {
    img.src = LOGO_LIGHT;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFooterLogos();
  setNavStyle(true);
  const preLogo = document.getElementById('preloaderLogo');
  if (preLogo && typeof LOGO_LIGHT !== 'undefined') preLogo.src = LOGO_LIGHT;
  initScrollAnimations();
});








// COMMERCIAL PAGE { SOUND BOX }
(function () {
  var video    = document.getElementById('commHeroVideo');
  var muteBtn  = document.getElementById('commMuteBtn');
  var muteLbl  = document.getElementById('commMuteLbl');
  var muteIcon = document.getElementById('commMuteIcon');
 
  var PATH_OFF = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z';
  var PATH_ON  = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z';
 
  if (muteBtn && video) {
    muteBtn.addEventListener('click', function () {
      video.muted = !video.muted;
      muteIcon.innerHTML = '<path d="' + (video.muted ? PATH_OFF : PATH_ON) + '"/>';
      muteLbl.textContent = video.muted ? 'Sound Off' : 'Sound On';
    });
  }
 
  /* smooth scroll for "View Our Work" */
  document.querySelectorAll('#page-commercial a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
 
  /* pause video when user navigates away from this page */
  if (video) {
    document.addEventListener('visibilitychange', function () {
      document.hidden ? video.pause() : video.play();
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════
   PROCESS SECTION — Scroll Reveal JS
   Paste this into your existing main JS file,
   OR add a <script> tag before </body>
═══════════════════════════════════════════════════════════════ */
(function () {
  var rows = document.querySelectorAll('#page-commercial .cp-row');
  if (!rows.length) return;
 
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12 });
 
  rows.forEach(function (row) { observer.observe(row); });
})();



/* ── Navbar blur on scroll ── */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();










// /* nav scroll state */
const scrollNav=document.getElementById('navbar');
if(scrollNav){
  window.addEventListener('scroll',()=>{scrollNav.classList.toggle('scrolled',window.scrollY>40);});
}


/* scroll reveal */
const revealEls=document.querySelectorAll('.reveal');
const revealObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target);}});
},{threshold:.12,rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el=>revealObs.observe(el));

/* count-up stats */
function countUp(el){
  const target=parseInt(el.dataset.count);
  let current=0;
  const step=Math.max(1,Math.ceil(target/50));
  const timer=setInterval(()=>{
    current=Math.min(current+step,target);
    el.textContent=current+(current>=target?(target>50?'+':(el.closest('.stats-row')&&el.parentElement.querySelector('.stat-label').textContent.includes('%')?'%':'+')):'');
    if(current>=target)clearInterval(timer);
  },25);
}
const statEls=document.querySelectorAll('[data-count]');
const statObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){countUp(e.target);statObs.unobserve(e.target);}});
},{threshold:.5});
statEls.forEach(el=>statObs.observe(el));

// /* services carousel buttons */
// const svcCarousel=document.getElementById('svcCarousel');
// document.getElementById('svcPrev').addEventListener('click',()=>svcCarousel.scrollBy({left:-380,behavior:'smooth'}));
// document.getElementById('svcNext').addEventListener('click',()=>svcCarousel.scrollBy({left:380,behavior:'smooth'}));

/* work filter */
const filterBtns=document.querySelectorAll('.filter-btn');
const workCards=document.querySelectorAll('.work-card');
filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    workCards.forEach(card=>{
      card.classList.toggle('hidden', f!=='all' && card.dataset.cat!==f);
    });
  });
});

/* faq accordion */
document.querySelectorAll('.faq-item').forEach(item=>{
  const q=item.querySelector('.faq-q');
  const a=item.querySelector('.faq-a');
  q.addEventListener('click',()=>{
    const isOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight=null;
    });
    if(!isOpen){
      item.classList.add('open');
      a.style.maxHeight=a.scrollHeight+'px';
    }
  });
});

/* smooth anchor scroll */
document.querySelectorAll('.scc-home a[href^="#"]').forEach(a=>{
  const href = a.getAttribute('href');
  if(!href || href === '#' || href.length < 2) return;
  a.addEventListener('click',e=>{
    const target=document.querySelector(href);
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});