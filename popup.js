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
  $('themeToggle').classList.toggle('active', currentSettings.theme === 'dark');
  $('themeIcon').src = currentSettings.theme === 'dark' ? 'icons/moon.svg' : 'icons/sun.svg';
  $('themeLabel').textContent = currentSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode';

  // Visibility toggle
  $('visibilityToggle').classList.toggle('active', currentSettings.visible);
  $('visibilityIcon').src = currentSettings.visible ? 'icons/eye.svg' : 'icons/eye-closed.svg';
  $('visibilityLabel').textContent = currentSettings.visible ? 'Visible' : 'Hidden';

  // Mode toggle
  $('modeToggle').classList.toggle('active', currentSettings.bubbleMode);
  $('modeIcon').src = currentSettings.bubbleMode ? 'icons/bubble.svg' : 'icons/bar.svg';
  $('modeLabel').textContent = currentSettings.bubbleMode ? 'Bubble Menu' : 'Default Bar';

  // Scroll toggle
  $('scrollToggle').classList.toggle('active', currentSettings.scrollable);

  // Drag toggle
  $('dragToggle').classList.toggle('active', currentSettings.draggable);

  // Position buttons
  document.querySelectorAll('.position-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.position === currentSettings.position);
  });

  // Site button
  const siteBtn = $('toggleSiteBtn');
  if (siteKey) {
    siteBtn.disabled = false;
    $('siteIcon').src = siteHidden ? 'icons/show.svg' : 'icons/hide.svg';
    $('siteBtnLabel').textContent = siteHidden ? `Show on ${siteKey}` : `Hide on ${siteKey}`;
  } else {
    siteBtn.disabled = true;
    $('siteIcon').src = 'icons/hide.svg';
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
