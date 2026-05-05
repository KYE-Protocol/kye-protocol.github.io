# `public/site/` — KYE Protocol™ landing page

Source for **<https://kye-protocol.github.io/>**.

Single-page static site (no build step). Tailwind via CDN, Mermaid via CDN, vanilla JS.

## Files

| Path | Role |
|---|---|
| `index.html` | Page markup |
| `styles.css` | Custom styles on top of Tailwind |
| `main.js` | Hero canvas, URN parser, decision-flow walkthrough, profile tabs, lifecycle simulator, vocabulary search |
| `data/vocab.js` | Public vocabulary entries (entity types, actions, lifecycle states, decisions, signals, obligations, stop conditions, reason codes) |
| `data/profiles.js` | Profile inventory shown on the Profiles section |
| `data/flows.js` | Scenarios for the live decision walkthrough |
| `data/lifecycle.js` | Lifecycle transition table mirrored from `private/runtime/gateway/src/vocab.ts` |

## Patent safety

Patent-safe content only. The page is at the same disclosure level as the rest of `public/`: vocabulary, ID format, examples. Mechanism specifications are not published in this repository — see `private/mechanisms/` placeholders.

## Mirrored to `kye-protocol.github.io`

This directory is mirrored to the public Pages repository on every change. Do not edit the Pages repo directly.
