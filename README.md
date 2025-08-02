# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Setup notes (TODO improve)

1. Setup [pi-tray-server](https://github.com/obfuscatedgenerated/pi-tray-server) on the PC you want to control.
2. Copy `.env.template` to `.env` and fill in the WebSocket URL of the server.
3. Run `npm install` to install dependencies.
4. Run `npm run build` to build the project.
5. Put the built files on the Pi (or serve over the network if easier)
6. Optionally create a new user for Pi-Tray: `sudo adduser pi-tray` `sudo usermod -G video pi-tray`
7. Login as the user and create a new autostart file: `nano ~/.config/autostart/pi-tray.desktop`
8. Add the following content to the file, replacing `path/to/your/index.html` with the actual path to your built HTML file (or server URL):
```ini
[Desktop Entry]
Type=Application
Name=Pi-Tray
Exec=chromium-browser --kiosk --allow-file-access-from-files path/to/your/index.html
Icon=chromium-browser
Terminal=false
```
You can omit the `--allow-file-access-from-files` flag if you are serving the files instead of loading them from the local filesystem.

Save the file and exit the editor. When you next log in as the user, Pi-Tray should automatically start in kiosk mode.
 
9. Optionally make the pi-tray user auto-login by editing the `/etc/lightdm/lightdm.conf` file (need sudo permission). Scroll down to the `[Seat:*]` section and change the `autologin-user` line to:
```ini
autologin-user=pi-tray
```
Save the file and exit the editor. Now, when you boot the Pi, it should automatically log in as the `pi-tray` user and start Pi-Tray in kiosk mode.
