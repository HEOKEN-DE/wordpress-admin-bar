(function () {
  'use strict';

  const DEFAULTS = {
    theme: 'dark',
    visible: true,
    bubbleMode: false,
    scrollable: false,
    draggable: false,
    position: 'top'
  };

  let settings = { ...DEFAULTS };
  let siteHidden = false;
  let adminBar = null;
  let bubble = null;
  let bubbleOpen = false;
  let isDragging = false;
  let isResizing = false;
  let dragOffset = { x: 0, y: 0 };
  let bubblePosition = { x: 20, y: 20 };
  let resetBtn = null;
  let resizeHandle = null;
  let barDragged = false;
  let savedWpClasses = { html: [], body: [] };

  function getAdminBar() {
    return document.getElementById('wpadminbar');
  }

  function getFavicon() {
    const icons = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );
    for (const icon of icons) {
      if (icon.href) return icon.href;
    }
    return location.origin + '/favicon.ico';
  }

  function getIconURL(name) {
    return chrome.runtime.getURL('icons/' + name);
  }

  function init() {
    adminBar = getAdminBar();
    if (!adminBar) return;

    savedWpClasses.html = ['wp-toolbar', 'admin-bar'].filter(
      cls => document.documentElement.classList.contains(cls)
    );
    savedWpClasses.body = ['admin-bar'].filter(
      cls => document.body.classList.contains(cls)
    );

    chrome.storage.local.get(['wpabGlobal', `wpabSite_${location.hostname}`], (data) => {
      if (data.wpabGlobal) {
        settings = { ...DEFAULTS, ...data.wpabGlobal };
      }
      const siteData = data[`wpabSite_${location.hostname}`];
      if (siteData) {
        siteHidden = siteData.hidden || false;
      }
      applySettings();
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'WPAB_APPLY_SETTINGS') {
        settings = { ...DEFAULTS, ...msg.settings };
        siteHidden = msg.siteHidden || false;
        adminBar = getAdminBar();
        if (adminBar) applySettings();
      }
    });
  }

  function applySettings() {
    if (!adminBar) return;

    resetAdminBar();

    if (siteHidden || !settings.visible) {
      hideAdminBar();
      return;
    }

    if (settings.bubbleMode) {
      activateBubbleMode();
    } else {
      deactivateBubbleMode();
      applyPosition();
      applyScrollable();
      applyDraggable();
    }
  }

  function resetAdminBar() {
    adminBar.classList.remove(
      'wpab-hidden', 'wpab-left', 'wpab-right', 'wpab-bottom',
      'wpab-scrollable', 'wpab-draggable', 'wpab-bubble-active',
      'wpab-bubble-expanded'
    );

    adminBar.style.removeProperty('transform');
    adminBar.style.removeProperty('cursor');
    adminBar.style.removeProperty('position');
    adminBar.style.removeProperty('left');
    adminBar.style.removeProperty('top');
    adminBar.style.removeProperty('right');
    adminBar.style.removeProperty('bottom');
    adminBar.style.removeProperty('width');

    document.documentElement.classList.remove(
      'wpab-bar-left', 'wpab-bar-right', 'wpab-bar-bottom', 'wpab-bar-hidden'
    );

    savedWpClasses.html.forEach(cls => document.documentElement.classList.add(cls));
    savedWpClasses.body.forEach(cls => document.body.classList.add(cls));

    removeBubble();
    removeDragListeners();
    removeResizeHandle();
    removeResetBtn();
    barDragged = false;
  }

  function hideAdminBar() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');
    document.documentElement.classList.remove('wp-toolbar', 'admin-bar');
    document.body.classList.remove('admin-bar');
  }

  function applyPosition() {
    const pos = settings.position;
    if (pos === 'left') {
      adminBar.classList.add('wpab-left');
      document.documentElement.classList.add('wpab-bar-left');
      document.documentElement.classList.remove('wp-toolbar');
    } else if (pos === 'right') {
      adminBar.classList.add('wpab-right');
      document.documentElement.classList.add('wpab-bar-right');
      document.documentElement.classList.remove('wp-toolbar');
    } else if (pos === 'bottom') {
      adminBar.classList.add('wpab-bottom');
      document.documentElement.classList.add('wpab-bar-bottom');
      document.documentElement.classList.remove('wp-toolbar');
    }
  }

  function applyScrollable() {
    if (settings.scrollable) {
      adminBar.classList.add('wpab-scrollable');
    }
  }

  // --- Draggable + Resize ---
  let onMouseDown, onMouseMove, onMouseUp;

  function applyDraggable() {
    if (!settings.draggable) return;
    adminBar.classList.add('wpab-draggable');
    adminBar.style.cursor = 'grab';
    createResizeHandle();

    onMouseDown = (e) => {
      if (e.target.closest('a, button, input, select, textarea')) return;
      if (e.target === resizeHandle) return;
      isDragging = true;
      const rect = adminBar.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      adminBar.style.cursor = 'grabbing';
      e.preventDefault();
    };

    onMouseMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      adminBar.style.position = 'fixed';
      adminBar.style.left = x + 'px';
      adminBar.style.top = y + 'px';
      adminBar.style.right = 'auto';
      adminBar.style.bottom = 'auto';
      adminBar.style.transform = 'none';
      barDragged = true;
    };

    onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        adminBar.style.cursor = 'grab';
        if (barDragged) showResetBtn();
      }
    };

    adminBar.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function removeDragListeners() {
    if (onMouseDown) adminBar.removeEventListener('mousedown', onMouseDown);
    if (onMouseMove) document.removeEventListener('mousemove', onMouseMove);
    if (onMouseUp) document.removeEventListener('mouseup', onMouseUp);
    onMouseDown = null;
    onMouseMove = null;
    onMouseUp = null;
    isDragging = false;
  }

  // --- Resize Handle (horizontal minimize) ---
  let onResizeDown, onResizeMove, onResizeUp;

  function createResizeHandle() {
    if (resizeHandle) return;
    resizeHandle = document.createElement('div');
    resizeHandle.id = 'wpab-resize-handle';
    adminBar.appendChild(resizeHandle);

    let startX = 0;
    let startWidth = 0;

    onResizeDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = adminBar.getBoundingClientRect().width;
      e.preventDefault();
      e.stopPropagation();
    };

    onResizeMove = (e) => {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(200, startWidth + diff);
      adminBar.style.width = newWidth + 'px';
      barDragged = true;
    };

    onResizeUp = () => {
      if (isResizing) {
        isResizing = false;
        if (barDragged) showResetBtn();
      }
    };

    resizeHandle.addEventListener('mousedown', onResizeDown);
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
  }

  function removeResizeHandle() {
    if (onResizeDown && resizeHandle) resizeHandle.removeEventListener('mousedown', onResizeDown);
    if (onResizeMove) document.removeEventListener('mousemove', onResizeMove);
    if (onResizeUp) document.removeEventListener('mouseup', onResizeUp);
    onResizeDown = null;
    onResizeMove = null;
    onResizeUp = null;
    if (resizeHandle) {
      resizeHandle.remove();
      resizeHandle = null;
    }
    isResizing = false;
  }

  // --- Reset Position Button ---
  function showResetBtn() {
    if (resetBtn) return;
    resetBtn = document.createElement('button');
    resetBtn.id = 'wpab-reset-position';

    const icon = document.createElement('img');
    icon.src = getIconURL('reset.svg');
    icon.width = 14;
    icon.height = 14;
    icon.alt = '';
    resetBtn.appendChild(icon);
    resetBtn.appendChild(document.createTextNode(' Reset position'));

    resetBtn.addEventListener('click', () => {
      barDragged = false;
      removeResetBtn();
      applySettings();
    });

    resetBtn.style.top = '8px';
    resetBtn.style.right = '8px';

    document.body.appendChild(resetBtn);
  }

  function removeResetBtn() {
    if (resetBtn) {
      resetBtn.remove();
      resetBtn = null;
    }
  }

  // --- Bubble Mode (CSS-only transformation of the actual bar) ---
  function activateBubbleMode() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');
    document.documentElement.classList.remove('wp-toolbar', 'admin-bar');
    document.body.classList.remove('admin-bar');
    bubbleOpen = false;
    createBubble();
  }

  function deactivateBubbleMode() {
    removeBubble();
    adminBar.classList.remove('wpab-hidden', 'wpab-bubble-expanded');
    document.documentElement.classList.remove('wpab-bar-hidden');
  }

  function createBubble() {
    if (bubble) return;

    bubble = document.createElement('div');
    bubble.id = 'wpab-bubble';

    const faviconUrl = getFavicon();
    const img = document.createElement('img');
    img.src = faviconUrl;
    img.alt = '';
    img.onerror = function () {
      this.src = getIconURL('wp-logo.svg');
    };
    bubble.appendChild(img);

    bubble.style.left = bubblePosition.x + 'px';
    bubble.style.top = bubblePosition.y + 'px';

    bubble.addEventListener('click', (e) => {
      if (bubble._wasDragged) {
        bubble._wasDragged = false;
        return;
      }
      toggleBubbleExpanded();
    });

    // Bubble dragging
    let bubbleDragging = false;
    let bDragStart = { x: 0, y: 0 };

    bubble.addEventListener('mousedown', (e) => {
      bubbleDragging = true;
      bubble._wasDragged = false;
      bDragStart.x = e.clientX - bubble.offsetLeft;
      bDragStart.y = e.clientY - bubble.offsetTop;
      bubble.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', bubbleMouseMove);
    document.addEventListener('mouseup', bubbleMouseUp);

    function bubbleMouseMove(e) {
      if (!bubbleDragging) return;
      bubble._wasDragged = true;
      const x = Math.max(0, Math.min(window.innerWidth - 40, e.clientX - bDragStart.x));
      const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - bDragStart.y));
      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';
      bubblePosition.x = x;
      bubblePosition.y = y;
      if (bubbleOpen) positionExpandedBar();
    }

    function bubbleMouseUp() {
      if (bubbleDragging) {
        bubbleDragging = false;
        if (bubble) bubble.style.cursor = 'grab';
      }
    }

    bubble._cleanup = () => {
      document.removeEventListener('mousemove', bubbleMouseMove);
      document.removeEventListener('mouseup', bubbleMouseUp);
    };

    document.body.appendChild(bubble);
  }

  function removeBubble() {
    if (bubbleOpen) collapseBubble();
    if (bubble) {
      if (bubble._cleanup) bubble._cleanup();
      bubble.remove();
      bubble = null;
    }
    document.removeEventListener('click', closeBubbleOnOutside);
  }

  function toggleBubbleExpanded() {
    if (bubbleOpen) {
      collapseBubble();
    } else {
      expandBubble();
    }
  }

  function expandBubble() {
    bubbleOpen = true;
    bubble.classList.add('wpab-bubble-open');

    // Show the actual admin bar as a vertical dropdown via CSS
    adminBar.classList.remove('wpab-hidden');
    adminBar.classList.add('wpab-bubble-expanded');
    positionExpandedBar();

    setTimeout(() => {
      document.addEventListener('click', closeBubbleOnOutside);
    }, 10);
  }

  function collapseBubble() {
    bubbleOpen = false;
    if (bubble) bubble.classList.remove('wpab-bubble-open');

    adminBar.classList.remove('wpab-bubble-expanded');
    adminBar.classList.add('wpab-hidden');
    adminBar.style.removeProperty('left');
    adminBar.style.removeProperty('top');
    adminBar.style.removeProperty('right');
    adminBar.style.removeProperty('bottom');
    adminBar.style.removeProperty('width');

    document.removeEventListener('click', closeBubbleOnOutside);
  }

  function positionExpandedBar() {
    if (!bubble || !adminBar) return;
    const bRect = bubble.getBoundingClientRect();
    const menuWidth = 280;
    const menuMaxHeight = 420;

    let left = bRect.left;
    let top = bRect.bottom + 8;

    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (left < 12) left = 12;

    if (top + menuMaxHeight > window.innerHeight) {
      top = bRect.top - menuMaxHeight - 8;
      if (top < 12) top = 12;
    }

    adminBar.style.left = left + 'px';
    adminBar.style.top = top + 'px';
    adminBar.style.right = 'auto';
    adminBar.style.bottom = 'auto';
  }

  function closeBubbleOnOutside(e) {
    if (bubbleOpen && !adminBar.contains(e.target) && !bubble.contains(e.target)) {
      collapseBubble();
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const observer = new MutationObserver(() => {
    if (!adminBar && getAdminBar()) {
      observer.disconnect();
      init();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
})();
