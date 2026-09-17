---
title: "Learning Paths · Part I"
description: "Four professional lenses applied only to the published chapters in Part I."
pagination: false
---

All four paths share the same book. This page does not expose later book parts; it shows only how the four published Part I chapters contribute to each professional direction.

## White Hat Security

Understand normal traffic deeply enough to investigate abnormal and adversarial behavior.

> **Guiding question:** What can an observer, attacker, or defender learn or manipulate at this boundary?

<div class="cn-context-grid cn-context-grid-two">
<article class="cn-context-card"><span>Chapter 1 · Core</span><strong>Internet Architecture</strong><p>A defender must know the normal end-to-end path before deciding whether a DNS, routing, transport, or application observation is suspicious.</p></article>
<article class="cn-context-card"><span>Chapter 2 · Explore</span><strong>Physical Layer: Signals and Media</strong><p>Physical media define exposure to interception, interference, jamming, and hardware-level trust assumptions.</p></article>
<article class="cn-context-card"><span>Chapter 3 · Important</span><strong>Network Performance</strong><p>Timing and performance evidence can reveal anomalies, but noisy measurements can also create false security conclusions.</p></article>
<article class="cn-context-card"><span>Chapter 4 · Core</span><strong>Ethernet and Local Networks</strong><p>ARP, MAC learning, broadcast domains, and switching are essential for understanding local-network spoofing and traffic visibility.</p></article>
</div>

## Sysadmin & Operations

Operate real hosts and services by locating state, isolating failures, and restoring service safely.

> **Guiding question:** What state exists, who owns it, how do I inspect it, and how do I restore service safely?

<div class="cn-context-grid cn-context-grid-two">
<article class="cn-context-card"><span>Chapter 1 · Core</span><strong>Internet Architecture</strong><p>Operations work becomes much easier when every symptom can be placed on the end-to-end dependency chain.</p></article>
<article class="cn-context-card"><span>Chapter 2 · Important</span><strong>Physical Layer: Signals and Media</strong><p>Link state, carrier, media limits, and physical errors are the first boundary beneath operating-system network state.</p></article>
<article class="cn-context-card"><span>Chapter 3 · Core</span><strong>Network Performance</strong><p>Operators need to distinguish latency, throughput, queueing, and bottlenecks before deciding that a service is simply 'slow'.</p></article>
<article class="cn-context-card"><span>Chapter 4 · Core</span><strong>Ethernet and Local Networks</strong><p>Neighbor discovery, switching, broadcast scope, and interface state explain many same-LAN failures.</p></article>
</div>

## Software Engineer

Build networked software that respects transport semantics, failure modes, performance, and distributed-system boundaries.

> **Guiding question:** What guarantees does the network give my program, and which guarantees must my program create itself?

<div class="cn-context-grid cn-context-grid-two">
<article class="cn-context-card"><span>Chapter 1 · Core</span><strong>Internet Architecture</strong><p>The end-to-end architecture shows how one application action depends on naming, routing, transport, and remote service state.</p></article>
<article class="cn-context-card"><span>Chapter 2 · Explore</span><strong>Physical Layer: Signals and Media</strong><p>Physical limits matter mainly through latency, loss, and rate constraints exposed upward to software.</p></article>
<article class="cn-context-card"><span>Chapter 3 · Core</span><strong>Network Performance</strong><p>Latency decomposition, BDP, queueing, and throughput are essential for designing and benchmarking responsive networked applications.</p></article>
<article class="cn-context-card"><span>Chapter 4 · Important</span><strong>Ethernet and Local Networks</strong><p>Developers rarely program Ethernet directly, but local-link state explains deployment failures that otherwise look like application bugs.</p></article>
</div>

## Networking Research

Turn mechanisms into questions, hypotheses, controlled experiments, measurements, and defensible claims.

> **Guiding question:** How do we know this claim is true, and how could the network be designed differently?

<div class="cn-context-grid cn-context-grid-two">
<article class="cn-context-card"><span>Chapter 1 · Core</span><strong>Internet Architecture</strong><p>Internet architecture provides the abstractions and design boundaries from which research questions about layering, state, and evolvability emerge.</p></article>
<article class="cn-context-card"><span>Chapter 2 · Core</span><strong>Physical Layer: Signals and Media</strong><p>Physical limits provide clean examples of model assumptions, capacity bounds, signal uncertainty, and the gap between ideal theory and measured channels.</p></article>
<article class="cn-context-card"><span>Chapter 3 · Core</span><strong>Network Performance</strong><p>Performance research depends on decomposing metrics, controlling confounders, repeating measurements, and separating latency sources.</p></article>
<article class="cn-context-card"><span>Chapter 4 · Core</span><strong>Ethernet and Local Networks</strong><p>Learning switches and neighbor discovery are compact distributed mechanisms suitable for studying state learning, flooding, convergence, and scaling trade-offs.</p></article>
</div>

<div class="cn-end-note"><span>Current boundary</span><strong>The path stops here for now. Later professional extensions will appear only when those book parts are published.</strong></div>
