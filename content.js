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

  function getAdminBar() {
    return document.getElementById('wpadminbar');
  }

  function init() {
    adminBar = getAdminBar();
    if (!adminBar) return;

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

    // Site-level hidden
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
      'wpab-scrollable', 'wpab-draggable', 'wpab-bubble-active'
    );
    adminBar.style.removeProperty('transform');
    adminBar.style.removeProperty('cursor');

    document.documentElement.classList.remove(
      'wpab-bar-left', 'wpab-bar-right', 'wpab-bar-bottom', 'wpab-bar-hidden'
    );

    removeBubble();
    removeDragListeners();
  }

  function hideAdminBar() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');
  }

  function applyPosition() {
    const pos = settings.position;
    if (pos === 'left') {
      adminBar.classList.add('wpab-left');
      document.documentElement.classList.add('wpab-bar-left');
    } else if (pos === 'right') {
      adminBar.classList.add('wpab-right');
      document.documentElement.classList.add('wpab-bar-right');
    } else if (pos === 'bottom') {
      adminBar.classList.add('wpab-bottom');
      document.documentElement.classList.add('wpab-bar-bottom');
    }
    // 'top' is default WP position, no extra class needed
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
      // Don't drag when clicking links or buttons
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
    };

    onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        adminBar.style.cursor = 'grab';
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

  // --- Bubble Mode ---
  function activateBubbleMode() {
    adminBar.classList.add('wpab-hidden');
    document.documentElement.classList.add('wpab-bar-hidden');
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
    bubble.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor">
        <path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H48a8,8,0,0,1,0-16H72.54a96.59,96.59,0,0,1-27-40.09A40,40,0,0,1,8,128v-8a8,8,0,0,1,8-8H40V96A24,24,0,0,1,64,72H192a24,24,0,0,1,24,24v16h24A8,8,0,0,1,248,120ZM40,128V120H24v8a24,24,0,0,0,16,22.62Zm-7.47,0v-.37A40.12,40.12,0,0,1,40,128ZM200,96a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v56a80,80,0,0,0,160,0V96h0Zm32,24H216v8a40.12,40.12,0,0,1,7.47-.37V120Zm0,8v.37-.37ZM216,150.62A24,24,0,0,0,232,128v-8Z"/>
      </svg>
    `;
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
      const x = Math.max(0, Math.min(window.innerWidth - 48, e.clientX - bDragStart.x));
      const y = Math.max(0, Math.min(window.innerHeight - 48, e.clientY - bDragStart.y));
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

    // Clone admin bar menu items
    const menuItems = adminBar.querySelectorAll('#wp-admin-bar-root-default > li, #wp-admin-bar-top-secondary > li');
    const menuList = document.createElement('ul');
    menuList.className = 'wpab-bubble-list';

    menuItems.forEach(item => {
      const clone = item.cloneNode(true);
      const li = document.createElement('li');
      li.className = 'wpab-bubble-item';

      const link = clone.querySelector(':scope > a, :scope > .ab-item');
      if (link) {
        const menuLink = document.createElement('a');
        menuLink.href = link.href || '#';
        menuLink.className = 'wpab-bubble-link';
        menuLink.textContent = link.textContent.trim();

        if (link.href) {
          menuLink.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }

        li.appendChild(menuLink);

        // Sub-menu items
        const submenu = clone.querySelector('.ab-submenu, .ab-sub-wrapper');
        if (submenu) {
          const subItems = submenu.querySelectorAll(':scope > ul > li > a, :scope > li > a');
          if (subItems.length > 0) {
            const subList = document.createElement('ul');
            subList.className = 'wpab-bubble-sublist';
            subItems.forEach(subLink => {
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
              if (subList.style.display === 'block') {
                subList.style.display = 'none';
                li.classList.remove('wpab-sub-open');
              } else {
                subList.style.display = 'block';
                li.classList.add('wpab-sub-open');
              }
              e.preventDefault();
              e.stopPropagation();
            });
          }
        }
      }

      if (li.children.length > 0) {
        menuList.appendChild(li);
      }
    });

    bubbleMenu.appendChild(menuList);
    document.body.appendChild(bubbleMenu);
    positionBubbleMenu();

    // Close on outside click
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

    // Keep within viewport
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

  // Wait for DOM and admin bar
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

  // Stop observing after 10 seconds
  setTimeout(() => observer.disconnect(), 10000);
})();
