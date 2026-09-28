# TEST Tenant Service LIFF

Static LIFF proof of concept for TEST tenant services.

## Demo

- Main page: `https://piyanutapp.github.io/poctestlineliffhuman/`
- วิธีการใช้งาน: `https://piyanutapp.github.io/poctestlineliffhuman/?panel=howto`
- ติดต่อเรา: `https://piyanutapp.github.io/poctestlineliffhuman/?panel=contact`

The app currently uses mock invoice, document, payment, and service-request data.

## LINE Rich Menu setup

For Rich Menu buttons, use the **LIFF URL** (`https://liff.line.me/...`) in the Link action.

Do not paste the GitHub Pages URL directly into the Rich Menu if you want the page to open in LIFF mode.

### Option 1: Use one LIFF app with query parameters

Use the same LIFF ID and append `panel` to each Rich Menu link:

- วิธีการใช้งาน: `https://liff.line.me/1657128669-1VthmXe7?panel=howto`
- ติดต่อเรา: `https://liff.line.me/1657128669-1VthmXe7?panel=contact`

This works with the existing code in this repository.

> Note: the app also accepts `?page=howto` and `?page=contact` as a backward-compatible alias, but `panel` is the recommended parameter name.

### Option 2: Use two separate LIFF apps

If you want two different LIFF links in LINE Developers, configure each LIFF app with a different **Endpoint URL**:

- LIFF A Endpoint URL: `https://piyanutapp.github.io/poctestlineliffhuman/?panel=howto`
- LIFF B Endpoint URL: `https://piyanutapp.github.io/poctestlineliffhuman/?panel=contact`

Then place each LIFF URL in the corresponding Rich Menu button:

- LIFF A example: `https://liff.line.me/1657128669-1VthmXe7`
- LIFF B example: `https://liff.line.me/1657128669-zJ253WOJ`

> Important: if two LIFF apps use the same Endpoint URL, both buttons will open the same page.

## Recommended setup for this repo

For this project, the simplest setup is:

1. Keep using the same repository
2. Keep using the same GitHub Pages site
3. Use either:
   - one LIFF ID with `?panel=howto` and `?panel=contact`, or
   - two LIFF IDs with different Endpoint URLs

Both approaches use the same theme and the same single-page app.
