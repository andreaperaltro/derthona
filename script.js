const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-toggle-label');
const themeColor = document.querySelector('meta[name="theme-color"]');
let hasManualTheme = false;

const applySiteTheme = (theme) => {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeButton?.setAttribute('aria-pressed', String(isDark));
  themeButton?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  if (themeLabel) themeLabel.textContent = `${isDark ? 'Dark' : 'Light'} theme`;
  if (themeColor) themeColor.content = isDark ? '#2D2926' : '#FFFFFF';
  document.querySelectorAll('.theme-aware-logo').forEach((image) => {
    image.src = isDark ? image.dataset.darkSrc : image.dataset.lightSrc;
  });
};

applySiteTheme(systemTheme.matches ? 'dark' : 'light');

themeButton?.addEventListener('click', () => {
  hasManualTheme = true;
  applySiteTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

systemTheme.addEventListener('change', (event) => {
  if (!hasManualTheme) applySiteTheme(event.matches ? 'dark' : 'light');
});

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
}

const progress = document.querySelector('.progress');
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${value}%`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const setMenuOpen = (isOpen) => {
  navigation.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', isOpen);
};

menuButton.addEventListener('click', () => setMenuOpen(!navigation.classList.contains('is-open')));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

const copyStatus = document.querySelector('.copy-status');
document.querySelectorAll('.swatch').forEach((swatch) => {
  swatch.addEventListener('click', async () => {
    const color = swatch.dataset.color;
    try {
      await navigator.clipboard.writeText(color);
      copyStatus.textContent = `${color} copied to clipboard`;
    } catch {
      copyStatus.textContent = `Colour code: ${color}`;
    }
    window.setTimeout(() => { copyStatus.textContent = ''; }, 2200);
  });
});

const logoScale = document.querySelector('#logo-scale');
const scaleLogo = document.querySelector('.scale-logo');
const scaleStep = document.querySelector('.scale-step');
const scaleName = document.querySelector('.scale-readout strong');
const scaleUse = document.querySelector('.scale-readout small');
const rangeWrap = document.querySelector('.range-wrap');

const logoStates = [
  { max: 18, lightSrc: 'assets/official/horizontal.svg', darkSrc: 'assets/official/horizontal-white.svg', name: 'Horizontal version', use: 'Large formats', width: '92%', height: '170px' },
  { max: 39, lightSrc: 'assets/official/contraption.svg', darkSrc: 'assets/official/contraption-white.svg', name: 'Contraption', use: 'Medium formats', width: '62%', height: '190px' },
  { max: 60, lightSrc: 'assets/official/stacked-big.svg', darkSrc: 'assets/official/stacked-big-white.svg', name: 'Stacked big', use: 'Compact formats', width: '48%', height: '220px' },
  { max: 80, lightSrc: 'assets/official/stacked-small.svg', darkSrc: 'assets/official/stacked-small-white.svg', name: 'Stacked small', use: 'Small formats', width: '30%', height: '165px' },
  { max: 100, lightSrc: 'assets/official/lion.svg', darkSrc: 'assets/official/lion-white.svg', name: 'Lion symbol', use: 'Very small formats', width: '15%', height: '170px' }
];

logoStates.forEach(({ lightSrc, darkSrc }) => {
  [lightSrc, darkSrc].forEach((src) => { const image = new Image(); image.src = src; });
});

let activeLogoState = -1;
let scaleTimer;
const updateLogoScale = (animate = true) => {
  if (!logoScale) return;
  const value = Number(logoScale.value);
  const nextIndex = logoStates.findIndex(({ max }) => value <= max);
  const next = logoStates[nextIndex];
  rangeWrap?.style.setProperty('--range-position', `${value}%`);
  if (nextIndex === activeLogoState) return;
  activeLogoState = nextIndex;
  window.clearTimeout(scaleTimer);
  if (animate) scaleLogo.classList.add('is-changing');
  scaleTimer = window.setTimeout(() => {
    scaleLogo.dataset.lightSrc = next.lightSrc;
    scaleLogo.dataset.darkSrc = next.darkSrc;
    scaleLogo.src = document.documentElement.dataset.theme === 'dark' ? next.darkSrc : next.lightSrc;
    scaleLogo.style.setProperty('--logo-width', next.width);
    scaleLogo.style.setProperty('--logo-height', next.height);
    scaleStep.textContent = `${String(nextIndex + 1).padStart(2, '0')} / 05`;
    scaleName.textContent = next.name;
    scaleUse.textContent = next.use;
    scaleLogo.classList.remove('is-changing');
  }, animate ? 150 : 0);
};

logoScale?.addEventListener('input', () => updateLogoScale(true));
updateLogoScale(false);

const logoShowcase = document.querySelector('.logo-showcase');
const logoThemeButtons = document.querySelectorAll('[data-logo-theme]');
const logoColourButtons = document.querySelectorAll('[data-logo-colour]');
let logoThemeTimer;

const monochromeAsset = (asset) => asset.replace('assets/official/', 'assets/official/monochrome/');
const monochromeDownload = (asset) => asset.replace('assets/downloads/', 'assets/downloads/monochrome/');

document.querySelectorAll('.logo-showcase img[data-dark-src]').forEach((image) => {
  [
    image.dataset.darkSrc,
    image.dataset.monoLightSrc || monochromeAsset(image.dataset.lightSrc),
    image.dataset.monoDarkSrc || monochromeAsset(image.dataset.darkSrc),
  ].forEach((asset) => {
    const preload = new Image();
    preload.src = asset;
  });
});

document.querySelectorAll('.asset-download').forEach((link) => {
  link.dataset.assetFormat = link.dataset.lightHref.endsWith('.svg') ? 'svg' : 'raster';
});

const setLogoPreview = (theme = logoShowcase?.dataset.theme, colour = logoShowcase?.dataset.colour) => {
  if (!logoShowcase || (logoShowcase.dataset.theme === theme && logoShowcase.dataset.colour === colour)) return;
  window.clearTimeout(logoThemeTimer);
  logoShowcase.classList.add('is-switching');
  logoThemeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.logoTheme === theme)));
  logoColourButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.logoColour === colour)));
  logoThemeTimer = window.setTimeout(() => {
    logoShowcase.dataset.theme = theme;
    logoShowcase.dataset.colour = colour;
    logoShowcase.querySelectorAll('img[data-light-src]').forEach((image) => {
      const asset = theme === 'dark' ? image.dataset.darkSrc : image.dataset.lightSrc;
      const monochrome = theme === 'dark' ? image.dataset.monoDarkSrc : image.dataset.monoLightSrc;
      image.src = colour === 'monochrome' ? (monochrome || monochromeAsset(asset)) : asset;
    });
    logoShowcase.querySelectorAll('.asset-download').forEach((link) => {
      const asset = theme === 'dark' ? link.dataset.darkHref : link.dataset.lightHref;
      const monochrome = theme === 'dark' ? link.dataset.monoDarkHref : link.dataset.monoLightHref;
      link.href = colour === 'monochrome'
        ? (monochrome || (link.dataset.assetFormat === 'svg' ? monochromeAsset(asset) : monochromeDownload(asset)))
        : asset;
    });
    requestAnimationFrame(() => logoShowcase.classList.remove('is-switching'));
  }, 150);
};

logoThemeButtons.forEach((button) => button.addEventListener('click', () => setLogoPreview(button.dataset.logoTheme)));
logoColourButtons.forEach((button) => button.addEventListener('click', () => setLogoPreview(undefined, button.dataset.logoColour)));

const glyphRoot = document.querySelector('#derthona-glyphs');
const typeTester = document.querySelector('#type-tester-input');
const typeSize = document.querySelector('#type-size');
const typeSizeValue = document.querySelector('#type-size-value');
const typeAlternates = document.querySelector('#type-alternates');
const typeTracking = document.querySelector('#type-tracking');
const typeTrackingValue = document.querySelector('#type-tracking-value');

if (typeTester && typeSize && typeSizeValue) {
  if (window.matchMedia('(max-width: 700px)').matches) typeSize.value = '72';
  const updateTypeSize = () => {
    const size = `${typeSize.value}px`;
    typeTester.closest('.type-tester')?.style.setProperty('--tester-size', size);
    typeSizeValue.value = size;
    typeSizeValue.textContent = size;
  };
  updateTypeSize();
  typeSize.addEventListener('input', updateTypeSize);
  const updateTypeTracking = () => {
    if (!typeTracking || !typeTrackingValue) return;
    const value = Number(typeTracking.value);
    const display = `${value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)} em`;
    typeTester.closest('.type-tester')?.style.setProperty('--tester-tracking', `${value}em`);
    typeTrackingValue.value = display;
    typeTrackingValue.textContent = display;
  };
  updateTypeTracking();
  typeTracking?.addEventListener('input', updateTypeTracking);
  typeAlternates?.addEventListener('change', () => {
    typeTester.classList.toggle('has-alternates', typeAlternates.checked);
  });
}

const glyphGroups = [
  { name: 'Latin uppercase', codePoints: [
    ...Array.from({ length: 26 }, (_, index) => 0x0041 + index),
    0x00C0, 0x00C1, 0x00C2, 0x00C3, 0x00C4, 0x00C5, 0x00C6, 0x00C7, 0x00C8, 0x00C9, 0x00CA, 0x00CB, 0x00CC, 0x00CD, 0x00CE, 0x00CF, 0x00D0, 0x00D1, 0x00D2, 0x00D3, 0x00D4, 0x00D5, 0x00D6, 0x00D8, 0x00D9, 0x00DA, 0x00DB, 0x00DC, 0x00DD, 0x00DE,
    0x0100, 0x0102, 0x0104, 0x0106, 0x010A, 0x010C, 0x010E, 0x0110, 0x0112, 0x0116, 0x0118, 0x011A, 0x011E, 0x0120, 0x0122, 0x0126, 0x012A, 0x012E, 0x0132, 0x0136, 0x0139, 0x013B, 0x013D, 0x0141, 0x0143, 0x0145, 0x0147, 0x014C, 0x0150, 0x0152, 0x0154, 0x0156, 0x0158, 0x015A, 0x015E, 0x0160, 0x0162, 0x0164, 0x016A, 0x016E, 0x0170, 0x0172, 0x0174, 0x0176, 0x0178, 0x0179, 0x017B, 0x017D, 0x0218, 0x021A, 0x1E80, 0x1E82, 0x1E84, 0x1EF2
  ] },
  { name: 'Stylistic alternates · Set 1', feature: 'ss01', codePoints: [0x0041, 0x0042, 0x0044, 0x0045, 0x0046, 0x0048, 0x004B, 0x0050, 0x0051, 0x0052, 0x0054] },
  { name: 'Numerals', codePoints: Array.from({ length: 10 }, (_, index) => 0x0030 + index) },
  { name: 'Punctuation', codePoints: [
    0x0020, 0x00A0, 0x0021, 0x0022, 0x0023, 0x0024, 0x0025, 0x0026, 0x0027, 0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F, 0x003A, 0x003B, 0x003D, 0x003E, 0x003F, 0x0040, 0x005B, 0x005C, 0x005D, 0x005F, 0x007B, 0x007C, 0x007D,
    0x00A1, 0x00AB, 0x00B7, 0x00BB, 0x00BF, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A
  ] },
  { name: 'Symbols', codePoints: [0x00A3, 0x00A5, 0x00A6, 0x00A9, 0x00D7, 0x00F7, 0x0E3F, 0x20AC, 0x20B9, 0x20BD, 0x2190, 0x2191, 0x2192, 0x2193, 0x2196, 0x2197, 0x2198, 0x2199, 0x2260] },
  { name: 'Combining marks', codePoints: [0x0300, 0x0301, 0x0302, 0x0303, 0x0304, 0x0306, 0x0307, 0x0308, 0x030A, 0x030B, 0x030C, 0x0312, 0x0326, 0x0327, 0x0328] }
];

const formatCodePoint = (codePoint) => `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
const isCombiningMark = (codePoint) => codePoint >= 0x0300 && codePoint <= 0x036F;

if (glyphRoot) {
  glyphGroups.forEach(({ name, codePoints, feature }) => {
    const section = document.createElement('section');
    section.className = 'glyph-section';
    if (feature) section.dataset.feature = feature;
    const heading = document.createElement('h4');
    heading.textContent = name;
    const grid = document.createElement('div');
    grid.className = 'glyph-grid';

    codePoints.forEach((codePoint) => {
      const card = document.createElement('div');
      card.className = 'glyph-card';
      const character = document.createElement('span');
      character.className = 'glyph-character';
      if (feature) character.classList.add('is-alternate');
      const glyph = codePoint === 0x0020 ? '␣' : codePoint === 0x00A0 ? '⍽' : String.fromCodePoint(codePoint);
      character.textContent = isCombiningMark(codePoint) ? `◌${glyph}` : glyph;
      if (isCombiningMark(codePoint)) character.classList.add('is-combining');
      const code = document.createElement('span');
      code.className = 'glyph-code';
      code.textContent = feature ? `${feature.toUpperCase()} · ${formatCodePoint(codePoint)}` : formatCodePoint(codePoint);
      card.title = `${feature ? `${feature.toUpperCase()} alternate · ` : ''}${formatCodePoint(codePoint)} · ${codePoint === 0x0020 ? 'Space' : codePoint === 0x00A0 ? 'No-break space' : glyph}`;
      card.append(character, code);
      grid.appendChild(card);
    });

    section.append(heading, grid);
    glyphRoot.appendChild(section);
  });
}

const lightbox = document.querySelector('.image-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('figcaption');
const lightboxCanvas = lightbox?.querySelector('.lightbox-canvas');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
let lightboxTrigger = null;

const openLightbox = (sourceImage) => {
  if (!lightbox || !lightboxImage) return;
  lightboxTrigger = sourceImage;
  const source = sourceImage.currentSrc || sourceImage.src;
  const description = sourceImage.alt || 'Derthona Basket brand asset';
  lightboxImage.src = source;
  lightboxImage.alt = description;
  lightboxCaption.textContent = description;
  lightboxCanvas.classList.toggle('is-dark', /white\.svg|white\.png/i.test(source));
  lightbox.showModal();
  lightboxClose.focus();
};

document.querySelectorAll('main img').forEach((image) => {
  image.dataset.lightboxReady = '';
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Open image: ${image.alt || 'Derthona Basket asset'}`);
  image.addEventListener('click', () => openLightbox(image));
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  const bounds = lightbox.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) lightbox.close();
});
lightbox?.addEventListener('close', () => {
  lightboxImage.src = '';
  lightboxTrigger?.focus();
});
