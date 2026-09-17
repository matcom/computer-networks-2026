---
title: "Curiosities · Part I"
description: "Memorable facts and consequences from the four published chapters in Part I."
pagination: false
---

These notes are optional context. Every item belongs to Chapters 1–4 only.

<div class="cn-context-grid cn-context-grid-two">
<article class="cn-context-card"><span>Chapter 1 · Internet Architecture</span><strong>The Internet is not one network</strong><p>A browser request can cross a home or campus LAN, an access provider, transit networks, Internet exchange points, and a content provider. What makes this look like one Internet is agreement on interoperable protocols, not ownership by one organization.</p></article>
<article class="cn-context-card"><span>Chapter 1 · Extra</span><strong>One Web request can cross networks whose operators never coordinate per request</strong><p>Campus access, an ISP, an exchange point, transit networks, and a content provider can all participate in one transaction. Interoperability comes from shared protocol contracts and independently maintained routing policy, not a central controller approving each packet.</p><p><b>Try it:</b> run traceroute to two unrelated services and classify which hops appear local, provider-owned, or farther away. Treat ownership as an inference, not a packet-capture fact.</p></article>

<article class="cn-context-card"><span>Chapter 2 · Physical Layer</span><strong>A faster link does not make a bit outrun physics</strong><p>Upgrading from 1 Gb/s to 100 Gb/s can reduce serialization delay by two orders of magnitude, yet propagation time across the same fiber route changes almost not at all. Capacity and propagation speed are different physical properties.</p></article>
<article class="cn-context-card"><span>Chapter 2 · Extra</span><strong>Four symbol states can carry two bits—but only if the receiver can still distinguish them</strong><p>More bits per symbol are not free capacity. More symbol states usually place decision regions closer together, so the receiver needs enough SNR, better coding, or a different error target to separate them reliably.</p><p><b>Try it:</b> draw two-level and four-level decision thresholds, perturb sample values, and compare how much noise each representation tolerates before the nearest decision changes.</p></article>

<article class="cn-context-card"><span>Chapter 3 · Network Performance</span><strong>Bandwidth cannot beat the speed of light</strong><p>A very high-capacity link can serialize data quickly, but it cannot remove propagation delay. Long-distance applications therefore care about both bandwidth and RTT; increasing one does not automatically fix the other.</p></article>
<article class="cn-context-card"><span>Chapter 3 · Extra</span><strong>A tiny packet can spend much longer traveling than being transmitted</strong><p>On a fast long-distance link, serialization for a small packet can be microseconds while propagation is milliseconds. For interactive protocols, removing one RTT dependency can matter far more than shaving a few bytes.</p><p><b>Try it:</b> compare serialization of a 64-byte packet at 10 Gb/s with propagation over 2,000 km of fiber at roughly 200,000 km/s.</p></article>

<article class="cn-context-card"><span>Chapter 4 · Ethernet and Local Networks</span><strong>Classic Ethernet collisions are mostly history</strong><p>CSMA/CD is famous because early Ethernet nodes shared one collision domain. Modern switched full-duplex Ethernet normally gives each endpoint its own link, so collision detection is no longer part of ordinary operation even though it remains important for understanding Ethernet's evolution.</p></article>
<article class="cn-context-card"><span>Chapter 4 · Extra</span><strong>A switch learns from the source, not from the destination</strong><p>Learning switches update their forwarding knowledge from the source MAC address of frames they receive. The destination tells the switch where the sender wants the frame to go; it does not prove where that destination currently lives.</p><p><b>Try it:</b> begin with an empty switch table, send `A→B` and then `B→A`, and write the table after each frame before deciding whether the next destination is flooded or forwarded.</p></article>
</div>

<div class="cn-end-note"><span>Part I boundary</span><strong>No curiosities from later book parts are published here yet.</strong></div>
