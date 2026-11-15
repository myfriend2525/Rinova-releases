// Rinova landing: enlaces de descarga, entrada del hero y los cinco efectos (basado en la web de Lince Browser).
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const whenVisible = (element, callback, threshold = .35) => {
  if (!('IntersectionObserver' in window)) return callback();
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    callback();
  }, { threshold });
  observer.observe(element);
};

// Enlaces de config.js. Los href del HTML ya funcionan sin JavaScript; esto solo los centraliza.
const links = window.RINOVA_LINKS || {};
const releases = (links.releases || '').replace(/\/+$/, '');
const destinations = { apk: links.apk, apkLegacy: links.apkLegacy, releases, allReleases: releases && `${releases}/releases` };
document.querySelectorAll('[data-link]').forEach((link) => {
  if (destinations[link.dataset.link]) link.href = destinations[link.dataset.link];
});

// Número de la última versión junto a los botones (solo informativo).
const repositoryPath = releases.match(/github\.com\/([^/]+\/[^/]+)/)?.[1];
if (repositoryPath && 'fetch' in window) {
  fetch(`https://api.github.com/repos/${repositoryPath}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => (response.ok ? response.json() : null))
    .then((release) => {
      const tag = release?.tag_name;
      if (!tag) return;
      document.querySelectorAll('[data-version]').forEach((label) => { label.textContent = `Versión ${tag.replace(/^v/, '')}`; });
    })
    .catch(() => {});
}

// 1. Navegación flotante al hacer scroll.
const nav = document.querySelector('[data-floating-nav]');
const updateNav = () => nav.classList.toggle('is-floating', nav.dataset.floatingNav === 'always' || scrollY > 24);
addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Entrada del hero: una sola línea de tiempo.
const entranceDone = (() => {
  if (reduceMotion || !('animate' in Element.prototype)) return Promise.resolve();
  const ease = 'cubic-bezier(.2, .9, .25, 1)';
  const steps = {
    drop: { keyframes: [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }], duration: 700, easing: ease },
    unblur: { keyframes: [{ opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0)' }], duration: 800, easing: ease },
    spring: { keyframes: [{ opacity: 0, filter: 'blur(14px)', transform: 'translateY(60px) scale(.96)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], duration: 900, easing: 'cubic-bezier(.3, 1.45, .45, 1)' },
    rise: { keyframes: [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], duration: 750, easing: ease },
  };
  const delays = { drop: [0, 60, 120], unblur: [320], spring: [520, 680] };
  let riseAt = 1000;
  const animations = [...document.querySelectorAll('[data-enter]')].map((element) => {
    const kind = element.dataset.enter;
    const delay = kind === 'rise' ? (riseAt += 110) - 110 : (delays[kind].shift() ?? 0);
    const { keyframes, duration, easing } = steps[kind];
    return element.animate(keyframes, { duration, easing, delay, fill: 'backwards' }).finished;
  });
  return Promise.all(animations).catch(() => {});
})();

// 2. Palabra que rota: las letras aparecen una a una con los colores del arcoíris de la app.
const word = document.querySelector('[data-rotating-word]');
if (word && !reduceMotion) {
  const words = word.dataset.rotatingWord.split(',');
  const rainbow = ['#ff3b30', '#ff9500', '#ffd60a', '#30d158', '#40c8e0', '#0a84ff', '#bf5af2', '#ff375f'];
  const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const colorAt = (position) => {
    const scaled = position * (rainbow.length - 1);
    const lower = Math.floor(scaled);
    const upper = Math.min(lower + 1, rainbow.length - 1);
    const t = scaled - lower;
    const [a, b] = [toRgb(rainbow[lower]), toRgb(rainbow[upper])];
    return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * t)).join(',')})`;
  };
  const show = (text) => {
    word.replaceChildren(...[...text].map((char, i, letters) => {
      const letter = document.createElement('span');
      letter.textContent = char === ' ' ? ' ' : char;
      letter.style.color = colorAt(i / Math.max(letters.length - 1, 1));
      letter.animate(
        [{ opacity: 0, filter: 'blur(20px)' }, { opacity: 1, filter: 'blur(0)' }],
        { duration: 500, delay: i * 45, easing: 'cubic-bezier(.33, 1, .68, 1)', fill: 'backwards' },
      );
      return letter;
    }));
    setTimeout(() => word.querySelectorAll('span').forEach((letter) => { letter.style.color = ''; }), text.length * 45 + 900);
  };
  entranceDone.then(async () => {
    let index = 0;
    while (true) {
      await wait(2600);
      if (document.hidden) continue;
      index = (index + 1) % words.length;
      show(words[index]);
    }
  });
}

// 3. Títulos que se arman letra por letra al aparecer.
document.querySelectorAll('[data-letters]').forEach((title) => {
  const text = title.textContent.trim();
  title.setAttribute('aria-label', text);
  let i = 0;
  title.replaceChildren(...text.split(' ').flatMap((part, wordIndex, parts) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'w';
    wordSpan.setAttribute('aria-hidden', 'true');
    [...part].forEach((char) => {
      const letter = document.createElement('span');
      letter.className = 'ch';
      letter.style.setProperty('--i', i++);
      letter.textContent = char;
      wordSpan.append(letter);
    });
    return wordIndex < parts.length - 1 ? [wordSpan, ' '] : [wordSpan];
  }));
  title.classList.add('split');
  whenVisible(title, () => title.classList.add('is-in'), .4);
});

// 4. Cifras que cuentan hacia arriba.
document.querySelectorAll('[data-count]').forEach((figure) => {
  const target = Number(figure.dataset.count);
  if (reduceMotion || target === 0) return;
  figure.textContent = '0';
  whenVisible(figure, () => {
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      figure.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, .6);
});

// 5. Pasos de instalación que avanzan solos mientras se ven.
const stepList = document.querySelector('[data-steps]');
if (stepList) {
  const steps = [...stepList.querySelectorAll('.step')];
  const activate = (next) => {
    steps.forEach((step, index) => {
      const active = index === next;
      step.classList.toggle('is-active', active);
      step.querySelector('button').setAttribute('aria-pressed', String(active));
      if (active) {
        const bar = step.querySelector('.step-bar i');
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
      }
    });
  };
  steps.forEach((step, index) => {
    step.querySelector('button').addEventListener('click', () => activate(index));
    step.querySelector('.step-bar i').addEventListener('animationend', () => activate((index + 1) % steps.length));
  });
  if ('IntersectionObserver' in window) {
    stepList.classList.add('is-paused');
    new IntersectionObserver(([entry]) => stepList.classList.toggle('is-paused', !entry.isIntersecting), { threshold: .5 }).observe(stepList);
  }
}
