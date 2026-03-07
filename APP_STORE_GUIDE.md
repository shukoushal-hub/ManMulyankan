# ManMulyankan — PWA App Store Publishing Guide

## What's Ready

Your site is now a full Progressive Web App with offline caching, app icons, install prompts, and store verification files.

---

## Fastest Path: PWABuilder.com

1. Deploy this updated code to your GitHub/Railway first
2. Go to **https://www.pwabuilder.com**
3. Enter **https://manmulyankan.com**
4. It scans your PWA and scores it
5. Click **"Package for stores"**
6. Choose **Android** and/or **iOS**
7. Download the generated packages
8. Upload to Google Play Console / App Store Connect

---

## Google Play Store (Android)

**Cost:** $25 one-time developer fee

1. Register at https://play.google.com/console
2. Use the AAB file from PWABuilder
3. After PWABuilder gives you an SHA-256 fingerprint, update `public/.well-known/assetlinks.json`
4. App details: Category = Medical, Rating = Everyone, Price = Free
5. Add screenshots, description, privacy policy URL
6. Submit — review takes 1-3 days

---

## Apple App Store (iOS)

**Cost:** $99/year developer fee  
**Requires:** Mac with Xcode

1. Register at https://developer.apple.com/programs/
2. Use the Xcode project from PWABuilder
3. Open in Xcode, sign with your certificate
4. Archive and upload to App Store Connect
5. Fill metadata, add screenshots
6. Submit — review takes 1-7 days

---

## Files Added

- `public/manifest.json` — App manifest
- `public/sw.js` — Service Worker (offline caching)
- `public/offline.html` — Offline fallback
- `public/icons/` — 8 icon sizes (72-512px)
- `public/.well-known/assetlinks.json` — Play Store verification
- `public/.well-known/apple-app-site-association` — App Store verification
- `views/index.html` — Updated with PWA meta, brain hologram, bold text
