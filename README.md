# WP Admin Bar Controller

<p align="center">
  <img src="icons/wpbar-logo.svg" alt="WP Admin Bar Controller Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Take full control of your WordPress admin bar — hide, move, dock, or transform it into a floating bubble menu.</strong>
</p>

<p align="center">
  <a href="https://buymeacoffee.com/wasim.alhafez" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="40"></a>
</p>

## Features

- **Show / Hide** — Toggle the WordPress admin bar on any site with one click
- **Bubble Menu Mode** — Collapse the admin bar into a draggable floating bubble using the site favicon; click to expand the full admin bar as a vertical dropdown menu
- **Position Lock** — Dock the admin bar to the top, bottom, left, or right of the screen via pure CSS rotation
- **Flexible Mode** — Drag the bar anywhere on the page, resize it horizontally from visible handle bars on either edge, and items that overflow are clipped while submenus remain accessible
- **Per-Site Persistence** — Drag and resize positions are saved per site and restored on next visit; hide the admin bar on specific sites while keeping it visible elsewhere
- **Dark / Light Theme** — Match your preference with a built-in theme toggle; all icons adapt to the selected theme
- **WP Admin Excluded** — The extension only runs on the frontend and does not interfere with the WordPress dashboard
- **Reset to Defaults** — One-click restore of all settings and saved positions

## Installation

### From GitHub Releases

1. Go to the [Releases](https://github.com/HEOKEN-DE/wordpress-admin-bar/releases) page
2. Download the latest `.zip` file
3. Unzip the downloaded file
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable **Developer mode** (toggle in the top-right corner)
6. Click **Load unpacked** and select the unzipped folder

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/HEOKEN-DE/wordpress-admin-bar.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the cloned folder

## Usage

1. Install the extension and navigate to any WordPress site where you are logged in
2. Click the **WP Admin Bar Controller** icon in your browser toolbar to open settings
3. Use the **Visible** toggle to show or hide the admin bar
4. Switch to **Bubble Menu** mode to collapse the bar into a draggable floating button
5. Choose a **Position** (Top, Bottom, Left, Right) to dock the admin bar
6. Enable **Flexible** to drag the bar freely and resize it from the handle bars on each side
7. Use **Hide on this site** to disable the admin bar for the current domain only
8. Click **Reset position** to clear any saved drag or resize state for the current site

## How It Works

The extension detects the WordPress admin bar (`#wpadminbar`) on any frontend page and applies your chosen settings in real-time using CSS class manipulation and JavaScript event handling. In bubble mode, the admin bar is hidden and replaced with a floating circular button showing the site favicon that expands the actual admin bar as a vertical dropdown — no HTML is cloned. In flexible mode, the bar becomes a flex container with visible resize handles on each edge; dragging and resizing positions are persisted per site using Chrome Storage. The extension is excluded from `/wp-admin/` pages so it never interferes with the WordPress dashboard. All processing happens locally in your browser. No data is sent anywhere.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save your settings, per-site preferences, and drag positions locally |
| `activeTab` | Communicate settings to the active WordPress page |
| `tabs` | Detect the current site hostname for per-site settings |
| `<all_urls>` | Inject the controller script on any WordPress frontend |

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS custom properties for theming
- [Phosphor Icons](https://phosphoricons.com/) for UI icons
- Chrome Storage API for persistence
- MutationObserver for late-loading admin bar detection

## Support

<p align="center">
  <a href="https://buymeacoffee.com/wasim.alhafez" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="40"></a>
</p>

## License

MIT
