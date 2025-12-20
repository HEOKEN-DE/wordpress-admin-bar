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
  let bubbleMenu = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let bubblePosition = { x: 20, y: 20 };
  let resetBtn = null;
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

  function init() {
    adminBar = getAdminBar();
    if (!adminBar) return;

    // Save original WP classes for restore
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
    // Remove our custom classes from the bar
    adminBar.classList.remove(
      'wpab-hidden', 'wpab-left', 'wpab-right', 'wpab-bottom',
      'wpab-scrollable', 'wpab-draggable', 'wpab-bubble-active'
    );

    // Clean up inline styles we may have set
    adminBar.style.removeProperty('transform');
    adminBar.style.removeProperty('cursor');
    adminBar.style.removeProperty('position');
    adminBar.style.removeProperty('left');
    adminBar.style.removeProperty('top');
    adminBar.style.removeProperty('right');
    adminBar.style.removeProperty('bottom');

    // Remove our layout classes from html
    document.documentElement.classList.remove(
      'wpab-bar-left', 'wpab-bar-right', 'wpab-bar-bottom', 'wpab-bar-hidden'
    );

    // Restore original WP classes
    savedWpClasses.html.forEach(cls => document.documentElement.classList.add(cls));
    savedWpClasses.body.forEach(cls => document.body.classList.add(cls));

    removeBubble();
    removeDragListeners();
    removeResetBtn();
    barDragged = false;
  }

  function hideAdminBar() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');

    // Remove WP classes so themes don't reserve space for the bar
    document.documentElement.classList.remove('wp-toolbar', 'admin-bar');
    document.body.classList.remove('admin-bar');
  }

  function applyPosition() {
    const pos = settings.position;
    if (pos === 'left') {
      adminBar.classList.add('wpab-left');
      document.documentElement.classList.add('wpab-bar-left');
      // Remove WP top-margin classes since bar is not at top
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
    // 'top' keeps default WP behavior — classes already restored in resetAdminBar
  }

  function applyScrollable() {
    if (settings.scrollable) {
      adminBar.classList.add('wpab-scrollable');
    }
  }

  // --- Draggable ---
  let onMouseDown, onMouseMove, onMouseUp;

  function applyDraggable() {
    if (!settings.draggable) return;
    adminBar.classList.add('wpab-draggable');
    adminBar.style.cursor = 'grab';

    onMouseDown = (e) => {
      if (e.target.closest('a, button, input, select, textarea')) return;
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

  // --- Reset Position Button ---
  function showResetBtn() {
    if (resetBtn) return;
    resetBtn = document.createElement('button');
    resetBtn.id = 'wpab-reset-position';
    resetBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">' +
      '<path d="M228,128a100,100,0,0,1-98.07,100H128a99.39,99.39,0,0,1-68.57-27.21,4,4,0,0,1,5.5-5.82A92,92,0,1,0,36,128a91.25,91.25,0,0,0,5.87,32.46L68.63,137.7a4,4,0,0,1,5.67,5.64L41.7,176a4,4,0,0,1-2.83,1.17h-.35a4,4,0,0,1-2.82-1.52A100,100,0,0,1,228,128Z"/>' +
      '</svg>' +
      'Reset position';

    resetBtn.addEventListener('click', () => {
      barDragged = false;
      removeResetBtn();
      applySettings();
    });

    // Position near top-right of viewport
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

  // --- Bubble Mode ---
  function activateBubbleMode() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');
    // Remove WP classes so themes don't reserve space
    document.documentElement.classList.remove('wp-toolbar', 'admin-bar');
    document.body.classList.remove('admin-bar');
    createBubble();
  }

  function deactivateBubbleMode() {
    removeBubble();
    adminBar.classList.remove('wpab-hidden');
    document.documentElement.classList.remove('wpab-bar-hidden');
  }

  function createBubble() {
    if (bubble) return;

    bubble = document.createElement('div');
    bubble.id = 'wpab-bubble';

    // Use site favicon
    const faviconUrl = getFavicon();
    const img = document.createElement('img');
    img.src = faviconUrl;
    img.alt = '';
    img.onerror = function () {
      // Fallback to WP logo SVG if favicon fails
      bubble.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 122.5 122.5" fill="#ffffff">' +
        '<path d="M8.7,61.3c0,20.9,12.2,39,29.8,47.6L13.1,42.7C10.3,48.5,8.7,54.7,8.7,61.3z' +
        ' M96.7,58.7c0-6.5-2.3-11-4.3-14.5c-2.7-4.3-5.2-8-5.2-12.3c0-4.8,3.7-9.3,8.8-9.3c0.2,0,0.4,0,0.7,0' +
        'c-9.3-8.5-21.7-13.7-35.4-13.7c-18.3,0-34.5,9.4-43.9,23.7c1.2,0,2.4,0.1,3.4,0.1c5.5,0,14-0.7,14-0.7' +
        'c2.8-0.2,3.2,4,0.3,4.3c0,0-2.9,0.3-6,0.5l19.1,56.9l11.5-34.5l-8.2-22.4c-2.8-0.2-5.5-0.5-5.5-0.5' +
        'c-2.8-0.2-2.5-4.5,0.3-4.3c0,0,8.7,0.7,13.9,0.7c5.5,0,14-0.7,14-0.7c2.8-0.2,3.2,4,0.3,4.3c0,0-2.9,0.3-6,0.5' +
        'l19,56.5l5.2-17.5C98.3,70,96.7,63.8,96.7,58.7z' +
        ' M61.3,64.5L45.6,110c4.7,1.4,9.7,2.2,14.9,2.2c6.2,0,12.1-1.1,17.6-3c-0.1-0.2-0.3-0.5-0.4-0.7L61.3,64.5z' +
        ' M107.1,38.9c0.2,1.7,0.4,3.5,0.4,5.5c0,5.4-1,11.5-4.1,19.1l-16.4,47.4c16-9.3,26.7-26.7,26.7-46.6' +
        'C113.7,55.1,111.2,46.4,107.1,38.9z' +
        ' M61.3,0C27.4,0,0,27.4,0,61.3c0,33.8,27.4,61.3,61.3,61.3c33.8,0,61.3-27.4,61.3-61.3C122.5,27.4,95.1,0,61.3,0z' +
        ' M61.3,119.7c-32.2,0-58.4-26.2-58.4-58.4c0-32.2,26.2-58.4,58.4-58.4c32.2,0,58.4,26.2,58.4,58.4' +
        'C119.7,93.5,93.5,119.7,61.3,119.7z"/>' +
        '</svg>';
    };
    bubble.appendChild(img);

    bubble.style.left = bubblePosition.x + 'px';
    bubble.style.top = bubblePosition.y + 'px';

    bubble.addEventListener('click', (e) => {
      if (bubble._wasDragged) {
        bubble._wasDragged = false;
        return;
      }
      toggleBubbleMenu();
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
      if (bubbleMenu) {
        positionBubbleMenu();
      }
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
    if (bubbleMenu) {
      bubbleMenu.remove();
      bubbleMenu = null;
    }
    if (bubble) {
      if (bubble._cleanup) bubble._cleanup();
      bubble.remove();
      bubble = null;
    }
  }

  function toggleBubbleMenu() {
    if (bubbleMenu) {
      bubbleMenu.remove();
      bubbleMenu = null;
      bubble.classList.remove('wpab-bubble-open');
      return;
    }

    bubbleMenu = document.createElement('div');
    bubbleMenu.id = 'wpab-bubble-menu';
    bubble.classList.add('wpab-bubble-open');

    // Header with site favicon and name
    const header = document.createElement('div');
    header.className = 'wpab-bubble-header';
    const headerImg = document.createElement('img');
    headerImg.src = getFavicon();
    headerImg.alt = '';
    headerImg.onerror = function () { this.style.display = 'none'; };
    header.appendChild(headerImg);
    header.appendChild(document.createTextNode(location.hostname));
    bubbleMenu.appendChild(header);

    // Clone admin bar menu items
    const menuItems = adminBar.querySelectorAll(
      '#wp-admin-bar-root-default > li, #wp-admin-bar-top-secondary > li'
    );
    const menuList = document.createElement('ul');
    menuList.className = 'wpab-bubble-list';

    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'wpab-bubble-item';

      const link = item.querySelector(':scope > a, :scope > .ab-item');
      if (!link) return;

      const menuLink = document.createElement('a');
      menuLink.href = link.href || '#';
      menuLink.className = 'wpab-bubble-link';

      // Extract icon from the original item
      const iconEl = link.querySelector('.ab-icon');
      const avatarEl = link.querySelector('img');

      const iconSpan = document.createElement('span');
      iconSpan.className = 'wpab-menu-icon';

      if (avatarEl) {
        // User avatar or other image
        const clonedImg = avatarEl.cloneNode(true);
        iconSpan.appendChild(clonedImg);
      } else if (iconEl) {
        // Dashicon or font icon — clone the element to keep its class/styles
        const clonedIcon = iconEl.cloneNode(true);
        iconSpan.appendChild(clonedIcon);
      }

      menuLink.appendChild(iconSpan);

      // Text content (exclude icon text)
      const textSpan = document.createElement('span');
      textSpan.className = 'wpab-menu-text';
      // Get text, stripping out icon content
      let text = '';
      link.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        } else if (node.classList &&
          !node.classList.contains('ab-icon') &&
          !node.matches('img')) {
          text += node.textContent;
        }
      });
      textSpan.textContent = text.trim();
      menuLink.appendChild(textSpan);

      if (link.href && link.href !== '#') {
        menuLink.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      li.appendChild(menuLink);

      // Sub-menu items
      const submenu = item.querySelector('.ab-submenu, .ab-sub-wrapper');
      if (submenu) {
        const subLinks = submenu.querySelectorAll('a');
        const validSubs = Array.from(subLinks).filter(a => a.textContent.trim());
        if (validSubs.length > 0) {
          // Add arrow indicator
          const arrow = document.createElement('span');
          arrow.className = 'wpab-menu-arrow';
          menuLink.appendChild(arrow);

          const subList = document.createElement('ul');
          subList.className = 'wpab-bubble-sublist';

          validSubs.forEach(subLink => {
            const subLi = document.createElement('li');
            const subA = document.createElement('a');
            subA.href = subLink.href || '#';
            subA.className = 'wpab-bubble-sublink';
            subA.textContent = subLink.textContent.trim();
            subLi.appendChild(subA);
            subList.appendChild(subLi);
          });

          li.appendChild(subList);
          li.classList.add('wpab-has-sub');

          menuLink.addEventListener('click', (e) => {
            if (validSubs.length > 0) {
              if (subList.style.display === 'block') {
                subList.style.display = 'none';
                li.classList.remove('wpab-sub-open');
              } else {
                subList.style.display = 'block';
                li.classList.add('wpab-sub-open');
              }
              e.preventDefault();
              e.stopPropagation();
            }
          });
        }
      }

      if (li.children.length > 0 && textSpan.textContent) {
        menuList.appendChild(li);
      }
    });

    bubbleMenu.appendChild(menuList);
    document.body.appendChild(bubbleMenu);
    positionBubbleMenu();

    setTimeout(() => {
      document.addEventListener('click', closeBubbleOnOutside);
    }, 10);
  }

  function closeBubbleOnOutside(e) {
    if (bubbleMenu && !bubbleMenu.contains(e.target) && !bubble.contains(e.target)) {
      bubbleMenu.remove();
      bubbleMenu = null;
      bubble.classList.remove('wpab-bubble-open');
      document.removeEventListener('click', closeBubbleOnOutside);
    }
  }

  function positionBubbleMenu() {
    if (!bubbleMenu || !bubble) return;
    const bRect = bubble.getBoundingClientRect();
    const menuWidth = 240;
    const menuMaxHeight = 400;

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

    bubbleMenu.style.left = left + 'px';
    bubbleMenu.style.top = top + 'px';
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Retry for late-loaded admin bars
  const observer = new MutationObserver(() => {
    if (!adminBar && getAdminBar()) {
      observer.disconnect();
      init();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
})();
