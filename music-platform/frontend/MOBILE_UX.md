# Mobile-first UX

## Customer site

The primary design target is a smartphone, not a desktop page squeezed into a small viewport.

### Navigation

- Compact top bar.
- One primary action per screen.
- Bottom action area for critical progression on mobile.
- Avoid dense desktop navigation menus.

### Audio

- Large touch targets.
- Sticky mini-player when appropriate.
- Waveform scrolls horizontally without breaking the page layout.
- Recording controls show live input level and clear start/stop state.
- Upload supports mobile file pickers.

### `/crear`

Each step occupies the viewport naturally and saves only non-sensitive draft state locally with expiration. The customer can move backward without losing answers.

The progress indicator should be visual and compact: `1 de 6`, with the current step clearly identifiable.

### Checkout

- Summary remains accessible before payment.
- Total price is always visible.
- Payment provider is entered only after the order is ready.
- Never expose internal production details.

### `/pedido/:orderNumber`

- Order number at top.
- Large production-status visualization.
- Full-width player.
- Correction action immediately visible only when entitlement is available.
- Download vault clearly shows expiry and remaining availability.

## Internal production console

The producer console must also work well on a phone/tablet because production may happen away from a desktop.

Use responsive split views rather than fixed desktop tables:

- Order summary.
- Audio references.
- Production parameters.
- Brief generation.
- Version upload.
- QC checklist.

On mobile these become a sequence of collapsible panels with persistent context for order number and current version.

## Performance

- Lazy-load waveform/visualization code.
- Do not preload private audio assets before authorization.
- Use responsive media and streaming where appropriate.
- Avoid large decorative video backgrounds.
- Defer non-critical analytics.
- Keep initial JavaScript budget intentionally small.
- Cache public static assets aggressively while keeping private customer media out of public caches.

## Touch/accessibility

- Minimum practical touch target: 44px.
- Keyboard navigation remains complete on desktop.
- Screen-reader labels for audio and recording controls.
- Visible focus state.
- Respect reduced-motion preference.
- Never encode status using color alone.
