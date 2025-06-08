const ICONS = {
  sun: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M128,60a68,68,0,1,0,68,68A68.07,68.07,0,0,0,128,60Zm0,128a60,60,0,1,1,60-60A60.07,60.07,0,0,1,128,188ZM32,128a4,4,0,0,1-4,4H12a4,4,0,0,1,0-8H28A4,4,0,0,1,32,128Zm196,0a4,4,0,0,1-4,4H208a4,4,0,0,1,0-8h16A4,4,0,0,1,228,128ZM55.2,55.2a4,4,0,0,1,0,5.66l-12,12a4,4,0,0,1-5.66-5.66l12-12A4,4,0,0,1,55.2,55.2Zm0,145.6-12,12a4,4,0,0,1-5.66-5.66l12-12a4,4,0,1,1,5.66,5.66ZM128,28a4,4,0,0,1,4,4V48a4,4,0,0,1-8,0V32A4,4,0,0,1,128,28Zm0,180a4,4,0,0,1,4,4v16a4,4,0,0,1-8,0V212A4,4,0,0,1,128,208Zm72-152.8a4,4,0,0,1,0-5.66l12-12a4,4,0,1,1,5.66,5.66l-12,12a4,4,0,0,1-5.66,0Zm0,145.6a4,4,0,0,1,0-5.66l12-12a4,4,0,0,1,5.66,5.66l-12,12a4,4,0,0,1-5.66,0Z"/></svg>',
  moon: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M228.11,148.7A96.09,96.09,0,0,1,107.3,27.89a4,4,0,0,0-4.73-5.37,100.15,100.15,0,0,0-75.28,75.28,100,100,0,0,0,122.91,122.91,4,4,0,0,0,5.37-4.73A96.56,96.56,0,0,1,228.11,148.7Z"/></svg>',
  eye: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M243.66,126.38c-.34-.76-8.52-18.89-26.83-37.2C199.87,72.22,170.7,52,128,52S56.13,72.22,39.17,89.18c-18.31,18.31-26.49,36.44-26.83,37.2a4.08,4.08,0,0,0,0,3.25c.34.77,8.52,18.89,26.83,37.2C56.13,183.78,85.3,204,128,204s71.87-20.22,88.83-37.17c18.31-18.31,26.49-36.43,26.83-37.2A4.08,4.08,0,0,0,243.66,126.38ZM128,196c-40.07,0-67-19.77-83.18-36C30.88,146.06,22.41,132.13,20.14,128c2.27-4.13,10.74-18.06,24.68-32C60.94,79.77,87.93,60,128,60s67.06,19.77,83.18,36C225.12,109.94,233.59,123.87,235.86,128,233.59,132.13,225.12,146.06,211.18,160,195.06,176.23,168.07,196,128,196Zm0-112a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,84Zm0,80a36,36,0,1,1,36-36A36,36,0,0,1,128,164Z"/></svg>',
  eyeClosed: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M225.28,165.06a4,4,0,0,1-5.49,1.37c-1.29-.78-43.35-25.86-91.79-2.43a4,4,0,1,1-3.58-7.16,107.64,107.64,0,0,1,31.09-9.54l-8.71-32.51a4,4,0,0,1,7.72-2.07l9.16,34.19a126.09,126.09,0,0,1,29.62,9.31l16.17-27.99a4,4,0,0,1,6.93,4l-16.4,28.39C212.46,150.84,221.21,157.59,225.28,165.06Zm-194.56,1.37a4,4,0,0,0,5.49-1.37c4.07-7.47,12.82-14.22,25.38-24.43L45.19,112.24a4,4,0,1,1,6.93-4l16.17,28a126.09,126.09,0,0,1,29.62-9.31l9.16-34.19a4,4,0,1,1,7.72,2.07l-8.71,32.51a107.64,107.64,0,0,1,31.09,9.54,4,4,0,0,1-3.58,7.16c-48.44-23.43-90.5,1.65-91.79,2.43A4,4,0,0,1,30.72,166.43Z"/></svg>',
  bar: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M224,52H32A12,12,0,0,0,20,64V192a12,12,0,0,0,12,12H224a12,12,0,0,0,12-12V64A12,12,0,0,0,224,52ZM32,60H224a4,4,0,0,1,4,4V88H28V64A4,4,0,0,1,32,60ZM224,196H32a4,4,0,0,1-4-4V96H228v96A4,4,0,0,1,224,196Z"/></svg>',
  bubble: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,200A96,96,0,1,1,224,128,96.11,96.11,0,0,1,128,224Zm-12-96a12,12,0,1,1,12,12A12,12,0,0,1,116,128Zm0-44a12,12,0,1,1,12,12A12,12,0,0,1,116,84Zm0,88a12,12,0,1,1,12,12A12,12,0,0,1,116,172Z"/></svg>',
  scroll: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M164,112a4,4,0,0,1-4,4H96a4,4,0,0,1,0-8h64A4,4,0,0,1,164,112Zm-4,28H96a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8Zm64-88V204a4,4,0,0,1-4,4H140v20a4,4,0,0,1-6.83,2.83l-20-20a4,4,0,0,1,0-5.66l20-20A4,4,0,0,1,140,188v12h76V52H140V64a4,4,0,0,1-6.83,2.83l-20-20a4,4,0,0,1,0-5.66l20-20A4,4,0,0,1,140,24V44h80A4,4,0,0,1,224,52ZM132,197.17,118.83,184,132,170.83ZM132,53.17,118.83,40,132,26.83ZM36,204V52a4,4,0,0,1,8,0V204a4,4,0,0,1-8,0Zm40,0V52a4,4,0,0,1,8,0V204a4,4,0,0,1-8,0Z"/></svg>',
  drag: '<svg width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M108,60a8,8,0,1,1-8-8A8,8,0,0,1,108,60Zm48-8a8,8,0,1,0,8,8A8,8,0,0,0,156,52Zm-56,68a8,8,0,1,0,8,8A8,8,0,0,0,100,120Zm56,0a8,8,0,1,0,8,8A8,8,0,0,0,156,120Zm-56,68a8,8,0,1,0,8,8A8,8,0,0,0,100,188Zm56,0a8,8,0,1,0,8,8A8,8,0,0,0,156,188Z"/></svg>',
  hide: '<svg width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M228,128a100,100,0,0,1-200,0c0-37.09,20.72-71.14,53.3-87.56a4,4,0,0,1,3.6,7.14C55.8,62.67,36,94.54,36,128a92,92,0,0,0,184,0c0-33.46-19.8-65.33-48.9-80.42a4,4,0,1,1,3.6-7.14C207.28,56.86,228,90.91,228,128ZM128,28a4,4,0,0,0,4-4V8a4,4,0,0,0-8,0V24A4,4,0,0,0,128,28Z"/></svg>',
  show: '<svg width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M128,84a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,84Zm0,80a36,36,0,1,1,36-36A36,36,0,0,1,128,164Z"/></svg>'
};

const DEFAULTS = {
  theme: 'dark',
  visible: true,
  bubbleMode: false,
  scrollable: false,
  draggable: false,
  position: 'top'
};

let currentSettings = { ...DEFAULTS };
let siteKey = null;
let siteHidden = false;

const $ = (id) => document.getElementById(id);

async function loadSettings() {
  const data = await chrome.storage.local.get('wpabGlobal');
  if (data.wpabGlobal) {
    currentSettings = { ...DEFAULTS, ...data.wpabGlobal };
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      siteKey = url.hostname;
      const siteData = await chrome.storage.local.get(`wpabSite_${siteKey}`);
      if (siteData[`wpabSite_${siteKey}`]) {
        siteHidden = siteData[`wpabSite_${siteKey}`].hidden || false;
      }
    }
  } catch {
    siteKey = null;
  }

  updateUI();
}

function updateUI() {
  const popup = $('popup');
  popup.setAttribute('data-theme', currentSettings.theme);

  // Theme toggle
  const themeToggle = $('themeToggle');
  themeToggle.classList.toggle('active', currentSettings.theme === 'dark');
  $('themeIcon').innerHTML = currentSettings.theme === 'dark' ? ICONS.moon : ICONS.sun;
  $('themeLabel').textContent = currentSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode';

  // Visibility toggle
  const visToggle = $('visibilityToggle');
  visToggle.classList.toggle('active', currentSettings.visible);
  $('visibilityIcon').innerHTML = currentSettings.visible ? ICONS.eye : ICONS.eyeClosed;
  $('visibilityLabel').textContent = currentSettings.visible ? 'Visible' : 'Hidden';

  // Mode toggle
  const modeToggle = $('modeToggle');
  modeToggle.classList.toggle('active', currentSettings.bubbleMode);
  $('modeIcon').innerHTML = currentSettings.bubbleMode ? ICONS.bubble : ICONS.bar;
  $('modeLabel').textContent = currentSettings.bubbleMode ? 'Bubble Menu' : 'Default Bar';

  // Scroll toggle
  $('scrollToggle').classList.toggle('active', currentSettings.scrollable);
  $('scrollIcon').innerHTML = ICONS.scroll;

  // Drag toggle
  $('dragToggle').classList.toggle('active', currentSettings.draggable);
  $('dragIcon').innerHTML = ICONS.drag;

  // Position buttons
  document.querySelectorAll('.position-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.position === currentSettings.position);
  });

  // Site button
  const siteBtn = $('toggleSiteBtn');
  if (siteKey) {
    siteBtn.disabled = false;
    $('siteIcon').innerHTML = siteHidden ? ICONS.show : ICONS.hide;
    $('siteBtnLabel').textContent = siteHidden ? `Show on ${siteKey}` : `Hide on ${siteKey}`;
  } else {
    siteBtn.disabled = true;
    $('siteIcon').innerHTML = ICONS.hide;
    $('siteBtnLabel').textContent = 'No active site';
  }
}

async function saveSettings() {
  await chrome.storage.local.set({ wpabGlobal: currentSettings });
  notifyContentScript();
}

async function saveSiteSettings() {
  if (!siteKey) return;
  await chrome.storage.local.set({ [`wpabSite_${siteKey}`]: { hidden: siteHidden } });
  notifyContentScript();
}

async function notifyContentScript() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'WPAB_APPLY_SETTINGS',
        settings: currentSettings,
        siteHidden
      });
    }
  } catch {}
}

// Event listeners
$('themeToggle').addEventListener('click', () => {
  currentSettings.theme = currentSettings.theme === 'dark' ? 'light' : 'dark';
  saveSettings();
  updateUI();
});

$('visibilityToggle').addEventListener('click', () => {
  currentSettings.visible = !currentSettings.visible;
  saveSettings();
  updateUI();
});

$('modeToggle').addEventListener('click', () => {
  currentSettings.bubbleMode = !currentSettings.bubbleMode;
  saveSettings();
  updateUI();
});

$('scrollToggle').addEventListener('click', () => {
  currentSettings.scrollable = !currentSettings.scrollable;
  saveSettings();
  updateUI();
});

$('dragToggle').addEventListener('click', () => {
  currentSettings.draggable = !currentSettings.draggable;
  saveSettings();
  updateUI();
});

document.querySelectorAll('.position-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSettings.position = btn.dataset.position;
    saveSettings();
    updateUI();
  });
});

$('toggleSiteBtn').addEventListener('click', () => {
  if (!siteKey) return;
  siteHidden = !siteHidden;
  saveSiteSettings();
  updateUI();
});

$('resetBtn').addEventListener('click', async () => {
  currentSettings = { ...DEFAULTS };
  siteHidden = false;
  await chrome.storage.local.set({ wpabGlobal: currentSettings });
  if (siteKey) {
    await chrome.storage.local.remove(`wpabSite_${siteKey}`);
  }
  notifyContentScript();
  updateUI();
});

loadSettings();
