# Photo share pages — design

Date: 2026-11-23 · Size: small change · Approved by James ("go with 1")

## Intent

A shared photo link today is `/school#school-founding`. Messaging apps drop the
`#…` part when building a link preview, so every shared photo shows the same
generic site card. Her community mostly receives links in LINE, WhatsApp,
iMessage and Facebook, where the preview picture is most of what they see.

## Design

- One tiny page per published item (photo or document with an `asset`), per
  locale: `/photo/<id>` and `/zh-hant/photo/<id>`.
- Each page carries preview tags for that item:
  - `og:title`: her name plus the item's label.
  - `og:description`: its caption.
  - `og:image`: the full photo, with its width and height.
- It forwards the visitor at once to the photo on its home page, `/<page>#<id>`. It does this with an instant
  meta refresh and `location.replace`. A visible link covers browsers that do neither.
- Its home page is the page of its category (`categoryPages`), else the archive. A photo also
  shown on a second page (`alsoShownOn`) forwards to its home page.
- `noindex`, with the canonical pointing at the home page; kept out of the sitemap. These
  are doors, not pages: 280 thin pages in search would compete with the real ones.
- Every "Share this photo" button (page items and the archive viewer) sends the
  `/photo/<id>` link instead of `#<id>`.

## My calls

- Full photo as the preview image, not the 480px thumbnail: quality matters
  more in a chat bubble. 7 of 144 photos are over 500 KB, and WhatsApp may skip
  very large previews; accepted.
- WeChat largely ignores these tags, and nothing on a static site changes that.

## Approaches considered

- **Chosen:** forwarding pages, built from the existing archive data at build time.
- **Rejected:** a full standalone page per photo. That would duplicate the page layout,
  and readers would land outside the page context they were sent to.
- **Rejected:** query strings (`/school?p=id`). The site is on GitHub Pages, which serves the
  same HTML for every query string, so the preview can't differ.
