# QuickCard — Offline Card & Notice Maker

An offline-first Android app and web studio that turns a few typed lines into clean, beautiful cards for church notices, wedding invitations, funeral announcements, and savings clubs (Mukando).

---

## Method 1: Instant Offline Use on Any Phone (No Coding Needed)

1. Open the app link in **Google Chrome** on your phone:
   `https://ais-dev-4zpz436gcxfwy2pcwvhzt7-700114705165.europe-west2.run.app`
2. Tap the Chrome menu (**three dots ⋮** in the top right corner).
3. Tap **"Add to Home screen"** or **"Install app"**.
4. QuickCard will install an icon on your phone’s home screen.
5. **Test Airplane Mode:** Turn off Wi-Fi and mobile data. Tap the QuickCard icon on your phone screen — it will open and let you make, preview, and export cards with **zero internet**.

---

## Method 2: Running Offline on Your Computer (Beginner Friendly)

### Requirements
- Download and install [Node.js](https://nodejs.org/) (recommended LTS version).

### Steps
1. **Download the project**: In AI Studio, click the **Export / Download** button in the top menu to download the project `.zip` file, and extract it on your computer.
2. **Open your computer's terminal / command prompt**:
   - On Windows: Open the folder, type `cmd` in the address bar at the top, and press Enter.
   - On Mac: Right-click the extracted folder and select **"New Terminal at Folder"**.
3. **Install the dependencies** (only once, while connected to internet):
   ```bash
   npm install
   ```
4. **Run offline**:
   ```bash
   npm run preview
   ```
   *Note: You can now disconnect your Wi-Fi!*
5. Open your browser and go to:
   ```
   http://localhost:4173
   ```
   The app will run completely offline from your computer’s hard drive.

---

## Method 3: Building a Standalone Android APK (.apk file)

QuickCard is built using web standards (React + Vite + Tailwind CSS) designed for Capacitor:

1. In the project folder, run:
   ```bash
   npm run build
   npx cap add android
   npx cap copy
   npx cap open android
   ```
2. Android Studio will open automatically.
3. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
4. Transfer the generated `.apk` file to any Android phone and install it!

---

## Offline Features
- **12 Starter Templates**: Church Midweek, Holy Week, Event Poster, Wedding, Kitchen Party, Funeral Notice, Birthday, School Notice, Mukando Meeting, Contributions Record (auto-total), Grocery List, and Plain Memo.
- **1080×1080 JPG Export**: High-resolution image export for WhatsApp status, groups, and direct chats.
- **WhatsApp Personalised Queue**: Paste lines like `Rudo, 0771234567` — automatically cleans Zimbabwe numbers and prepares step-by-step `{name}` personal greetings.
- **Ed25519 Cryptographic Unlock**: Device ID verification works 100% offline without contacting any server.
