---
title: "Learning Paths"
description: "Four professional directions through the same networking foundation."
pagination: false
---

<p class="cn-paths-intro">One foundation, four professional directions</p>

## White Hat Security

<p class="cn-path-question"><span>Guiding professional question</span>What can an observer, attacker, or defender learn or manipulate at this boundary?</p>

Understand normal traffic deeply enough to investigate abnormal and adversarial behavior.

<div class="cn-path-roadmap">
<a class="cn-path-roadmap-row" href="../chapter-1/"><span>Core</span><strong>Chapter 1 · Internet Architecture</strong><p>A defender must know the normal end-to-end path before deciding whether a DNS, routing, transport, or application observation is suspicious.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-2/"><span>Explore</span><strong>Chapter 2 · Physical Layer: Signals and Media</strong><p>Physical media define exposure to interception, interference, jamming, and hardware-level trust assumptions.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-3/"><span>Important</span><strong>Chapter 3 · Network Performance</strong><p>Timing and performance evidence can reveal anomalies, but noisy measurements can also create false security conclusions.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-4/"><span>Core</span><strong>Chapter 4 · Ethernet and Local Networks</strong><p>ARP, MAC learning, broadcast domains, and switching are essential for understanding local-network spoofing and traffic visibility.</p></a>
</div>

## Sysadmin & Operations

<p class="cn-path-question"><span>Guiding professional question</span>What state exists, who owns it, how do I inspect it, and how do I restore service safely?</p>

Operate real hosts and services by locating state, isolating failures, and restoring service safely.

<div class="cn-path-roadmap">
<a class="cn-path-roadmap-row" href="../chapter-1/"><span>Core</span><strong>Chapter 1 · Internet Architecture</strong><p>Operations work becomes much easier when every symptom can be placed on the end-to-end dependency chain.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-2/"><span>Important</span><strong>Chapter 2 · Physical Layer: Signals and Media</strong><p>Link state, carrier, media limits, and physical errors are the first boundary beneath operating-system network state.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-3/"><span>Core</span><strong>Chapter 3 · Network Performance</strong><p>Operators need to distinguish latency, throughput, queueing, and bottlenecks before deciding that a service is simply slow.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-4/"><span>Core</span><strong>Chapter 4 · Ethernet and Local Networks</strong><p>Neighbor discovery, switching, broadcast scope, and interface state explain many same-LAN failures.</p></a>
</div>

## Software Engineer

<p class="cn-path-question"><span>Guiding professional question</span>What guarantees does the network give my program, and which guarantees must my program create itself?</p>

Build networked software that respects transport semantics, failure modes, performance, and distributed-system boundaries.

<div class="cn-path-roadmap">
<a class="cn-path-roadmap-row" href="../chapter-1/"><span>Core</span><strong>Chapter 1 · Internet Architecture</strong><p>The end-to-end architecture shows how one application action depends on naming, routing, transport, and remote service state.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-2/"><span>Explore</span><strong>Chapter 2 · Physical Layer: Signals and Media</strong><p>Physical limits matter mainly through latency, loss, and rate constraints exposed upward to software.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-3/"><span>Core</span><strong>Chapter 3 · Network Performance</strong><p>Latency decomposition, BDP, queueing, and throughput are essential for designing and benchmarking responsive networked applications.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-4/"><span>Important</span><strong>Chapter 4 · Ethernet and Local Networks</strong><p>Developers rarely program Ethernet directly, but local-link state explains deployment failures that otherwise look like application bugs.</p></a>
</div>

## Networking Research

<p class="cn-path-question"><span>Guiding professional question</span>How do we know this claim is true, and how could the network be designed differently?</p>

Turn mechanisms into questions, hypotheses, controlled experiments, measurements, and defensible claims.

<div class="cn-path-roadmap">
<a class="cn-path-roadmap-row" href="../chapter-1/"><span>Core</span><strong>Chapter 1 · Internet Architecture</strong><p>Internet architecture provides the abstractions and design boundaries from which research questions about layering, state, and evolvability emerge.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-2/"><span>Core</span><strong>Chapter 2 · Physical Layer: Signals and Media</strong><p>Physical limits provide clean examples of model assumptions, capacity bounds, signal uncertainty, and the gap between ideal theory and measured channels.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-3/"><span>Core</span><strong>Chapter 3 · Network Performance</strong><p>Performance research depends on decomposing metrics, controlling confounders, repeating measurements, and separating latency sources.</p></a>
<a class="cn-path-roadmap-row" href="../chapter-4/"><span>Core</span><strong>Chapter 4 · Ethernet and Local Networks</strong><p>Learning switches and neighbor discovery are compact distributed mechanisms for studying state learning, flooding, convergence, and scaling trade-offs.</p></a>
</div>
