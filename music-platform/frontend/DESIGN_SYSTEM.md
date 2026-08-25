# Design System

## Direction

Bespoke digital music experience. Avoid generic SaaS/dashboard aesthetics and avoid template-like repeated cards.

## Components

- `AudioHero`: immersive hero with real audio controls and waveform.
- `GenreMixer`: horizontal/vertical tactile genre selector that changes demo audio metadata.
- `StoryComposer`: large writing surface with contextual prompts.
- `ReferenceRecorder`: optional rhythm/voice recorder with live level meter and waveform.
- `PriceDial`: interactive product/add-on selector with animated total.
- `OrderTimeline`: visual production state machine.
- `PrivatePlayer`: authenticated preview player.
- `CorrectionStudio`: focused correction request interface with remaining entitlement.
- `DownloadVault`: private delivery area with expiry countdown.

## Interaction rules

1. Every animation must communicate state, feedback or hierarchy.
2. Hover is never the only interaction; all core interactions work on touch.
3. Press feedback should be immediate.
4. Audio controls must remain usable with keyboard and screen readers.
5. Avoid modal-heavy flows on mobile.
6. Keep the primary CTA reachable without excessive scrolling.

## Motion

- Microinteractions: 120–220ms.
- Panel transitions: 220–420ms.
- Audio visualizations may animate continuously only while useful.
- Disable nonessential animation for reduced-motion users.

## Responsive composition

Use fluid typography and spacing. Prefer CSS container queries where appropriate. Components should adapt rather than simply stack desktop cards vertically.

## Anti-template checklist

- No generic three-card feature grid as the main product explanation.
- No dashboard-first home page.
- No excessive glassmorphism.
- No decorative gradient mesh as the sole visual identity.
- No stock-photo dependency for the core experience.
- No interaction that exists only to look impressive.
