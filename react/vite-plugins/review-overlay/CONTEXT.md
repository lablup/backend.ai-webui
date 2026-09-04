# Dev review overlay

The dev-server-only tool a reviewer uses to point at an element on a served PR,
say something about it, and hand that to a PR comment, a Teams thread or a
Claude prompt — without the receiving side needing any lookup to find the
element again.

## Language

**Pin**:
One reviewer remark tied to one element: an anchor, an optional note, and an
id. A pin is self-contained — its link alone is enough to show it again.
_Avoid_: comment (the channel's word), marker (the drawn glyph only), pick

**Pin set**:
The ordered list of pins a reviewer makes in one sitting and hands over
together, as one comment and one link. A single pin is a pin set of one.
_Avoid_: batch, session, group, thread

**Draft set**:
The pin set a tab is building right now — what is drawn on screen. It is the
single source of truth for the screen; a link opened in the tab merges into it.
_Avoid_: session, buffer, clipboard set

**Focus pin**:
The one pin in a set that owns navigation, scroll-into-view and the arrival
pulse when a link is opened; the others are drawn quietly.
_Avoid_: primary pin, first pin (it is not always the first), target

**Set dock**:
The overlay's list of the draft set's pins with the set-wide actions (copy
all, clear all). Off-page pins live only here.
_Avoid_: panel, sidebar, tray

**Anchor**:
The self-describing payload that locates a pin's element: page (path and query),
selector, landmark, text, and the note. Travels compressed inside the link.
_Avoid_: payload, target, locator

**Link**:
The dev-server URL that carries a pin set in its fragment. A pin set has
exactly one link, whatever its size.
_Avoid_: deep link (the act of opening it), permalink, share URL

**Block**:
The markdown a pin is rendered as for pasting: the reviewer's note, a quoted
label, the ⚛️ component stack, the link, and the marker comment. One block per
pin; every block of a pin set carries the set's one link, so a block pasted on
its own still opens.
_Avoid_: snippet, template, card (the on-screen thing)

**Label**:
The human-readable path to a pin's element: route › landmark › element with its
on-screen text. Always English for the route part.
_Avoid_: path (ambiguous with the URL path), breadcrumb

**Landmark**:
The nearest `data-testid` ancestor of a pinned element; the stable frame the
anchor measures against.
_Avoid_: container, parent, testid (the attribute, not the concept)

**Codec**:
The one implementation, owned by this overlay, that encodes and decodes anchors
and parses links and blocks. Every reader of the format — the overlay itself and
the Claude-side skill — runs this codec rather than its own copy.
_Avoid_: parser (a reimplementation elsewhere), pin_parser
