# WP Admin Bar Controller

<p align="center">
  <img src="icons/logo.svg" alt="WP Admin Bar Controller Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Take full control of your WordPress admin bar — hide, move, dock, or transform it into a floating bubble menu.</strong>
</p>

<p align="center">
  <a href="https://buymeacoffee.com/wasim.alhafez">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee">
  </a>
</p>

## Features

- **Show / Hide** — Toggle the WordPress admin bar on any site with one click
- **Bubble Menu Mode** — Collapse the admin bar into a sleek floating bubble that expands on click
- **Position Lock** — Dock the admin bar to the top, bottom, left, or right of the screen
- **Draggable** — Freely drag the admin bar anywhere on the page
- **Scrollable** — Enable scrolling when the admin bar overflows its container
- **Per-Site Settings** — Hide the admin bar on specific sites while keeping it visible elsewhere
- **Dark / Light Theme** — Match your preference with a built-in theme toggle
- **Reset to Defaults** — One-click restore of all settings

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
6. Enable **Draggable** to freely move the admin bar by clicking and dragging
7. Enable **Scrollable** to scroll through menu items when space is limited
8. Use **Hide on this site** to disable the admin bar for the current domain only

## How It Works

The extension detects the WordPress admin bar (`#wpadminbar`) on any page and applies your chosen settings in real-time using CSS class manipulation and JavaScript event handling. In bubble mode, the admin bar is hidden and replaced with a floating circular button that expands into a clean dropdown menu containing all your WordPress admin links and submenus. All settings are stored locally using the Chrome Storage API. All processing happens locally in your browser. No data is sent anywhere.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save your settings and per-site preferences locally |
| `activeTab` | Communicate settings to the active WordPress page |
| `tabs` | Detect the current site hostname for per-site settings |
| `<all_urls>` | Inject the controller script on any WordPress site |

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- CSS custom properties for theming
- Chrome Storage API for persistence
- MutationObserver for late-loading admin bar detection

## Support

<p align="center">
  <a href="https://buymeacoffee.com/wasim.alhafez">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee">
  </a>
</p>

## License

MIT
