---
title: 'Workbench · Laboratory Preparation'
description: 'Tools, evidence, and a local-first workflow for beginning the course.'
pagination: false
---

<p class="cn-course-kicker">Preparation before Chapter 1</p>
<p class="cn-guiding-question">How can you observe real network state and preserve reproducible evidence before troubleshooting it?</p>
## Why this chapter matters

A networking experiment can fail because the protocol is wrong, because the host is misconfigured, because a required tool is missing, because a route points somewhere unexpected, or because the student is observing the wrong interface.

Before building transport protocols, routers, BGP policy, overlays, or distributed services, we need a repeatable way to answer a simpler question:

> **What does this Linux host currently believe about networking, and what evidence supports that belief?**

M00 establishes the evidence vocabulary used throughout the book. The goal is not to memorize every command. It is to learn which system view answers which question.

> **Pause and predict.** `curl https://example.com/` fails. Does that tell you whether the failure is DNS, routing, TCP, TLS, HTTP, or the remote service? No. `curl` is useful precisely because it crosses many dependencies—but that also makes it a poor root-cause diagnosis by itself.

## 1. Your local host is already a complete networked system

Even before creating a laboratory topology, a Linux host contains networking state such as:

```text
processes
  ↓
sockets
  ↓
interfaces + addresses
  ↓
routes + neighbor state
  ↓
queues / firewall / policy
  ↓
NIC + driver + physical/virtual link
```

It also contains resolver configuration, local caches, namespaces, and virtual interfaces.

A Web request can interact with several of these structures before a frame leaves the machine.

This is the first systems habit of the course:

> **Do not treat “the network” as a black box when the host already exposes inspectable state.**

## 2. Interfaces define where the kernel can attach networking state

An interface is an OS-visible network attachment. It may represent:

- loopback,
- physical Ethernet or Wi-Fi,
- a virtual Ethernet endpoint,
- bridge,
- tunnel,
- VPN device,
- container/VM attachment.

Inspect with:

```bash
ip link
ip address
```

Ask four questions:

1. Is the interface present and operational?
2. Which addresses and prefixes belong to it?
3. Is it the interface the route actually selects?
4. Is it in the namespace you think it is?

Interface names such as `eth0` are conventions, not universal truths. Always inspect the actual machine.

## 3. Loopback is a real protocol path without a physical network

The loopback interface lets applications use the normal IP and transport stack without sending packets onto an external medium.

This makes localhost experiments valuable because they preserve:

- socket semantics,
- transport state,
- application framing,
- many kernel code paths,

while removing variables such as Wi-Fi, switches, routers, and Internet routing.

A successful localhost experiment proves less than a successful remote experiment—but often exactly the thing you need to isolate first.

## 4. Addresses and prefixes describe local identity and routing scope

An address such as:

```text
192.0.2.20/24
```

contains an address plus a prefix length.

In M00, you only need to recognize that the prefix length influences which destinations are considered directly connected and which require another route or gateway.

Inspect addresses with:

```bash
ip address
```

Later chapters formalize subnetting and longest-prefix matching. Here, the goal is to read the state the kernel already has.

## 5. Routing state answers “where would this destination go next?”

Before transmitting an IP packet, the kernel selects a route.

Useful commands:

```bash
ip route
ip route get 198.51.100.10
```

A route can identify:

- destination prefix,
- next hop,
- output interface,
- metric or policy information.

`ip route get` is especially useful because it asks the kernel for the route it would use for one concrete destination.

That is stronger evidence than visually scanning a route table and guessing.

## 6. A default route is a fallback, not the final destination

A line such as:

```text
default via 192.0.2.1 dev eth0
```

means roughly:

> “For destinations not matched by a more specific route, send toward this next hop using this interface.”

The gateway is usually the next router, not the final remote server.

M05 will explain why more-specific prefixes override the default route. For now, recognize the distinction between:

```text
final IP destination
≠
local next hop
```

## 7. Neighbor state answers “how do I reach that next hop on this local link?”

An IP route can select a next-hop IP and interface, but Ethernet-like delivery still needs a link-layer address.

Inspect local neighbor state with:

```bash
ip neigh
```

Entries may appear reachable, stale, incomplete, failed, or in other OS-specific states.

The dependency is:

```text
usable IP route
      +
usable next-hop resolution
      ↓
frame can be constructed for local delivery
```

M04 explains ARP and IPv6 Neighbor Discovery in detail.

## 8. Sockets connect application processes to transport state

Sockets are communication endpoints exposed by the operating system.

Useful views include:

```bash
ss -lntup
ss -tn
ss -un
```

A listening TCP socket proves that the local host has an endpoint waiting on an address/port under its current namespace and privilege context.

It does **not** prove that:

- a remote client can route to it,
- a firewall allows the traffic,
- TLS will succeed,
- the application will answer correctly.

Ports identify transport endpoints, not physical switch ports.

## 9. Processes, namespaces, and privileges change what you can see and modify

Some socket details, route operations, queue configuration, and packet captures require elevated privileges.

The course should not normalize “run everything as root.”

Prefer:

- least privilege,
- disposable namespaces/containers for destructive experiments,
- explicit teardown,
- clear separation between observation and modification.

Later, M12 uses namespaces as first-class network objects. In M00, simply remember that two processes on one physical host can have different network views.

## 10. DNS tools answer naming questions

`dig` exposes DNS-oriented evidence:

```bash
dig example.com
```

Inspect:

- query name/type,
- answer records,
- TTL,
- response code,
- resolver/server used.

A correct DNS answer proves something about name resolution at that observation point.

It does not prove the resulting server is reachable or healthy.

Also remember that applications can use resolver libraries, local caches, proxies, or service-specific resolution paths that differ from a direct `dig` command.

## 11. Application tools are broad end-to-end probes

`curl` is extremely useful because it can expose several stages of an HTTP(S) interaction:

```bash
curl -v https://example.com/
```

Depending on the request and build, the output can include evidence about:

- name resolution,
- selected address,
- transport connection,
- TLS negotiation,
- HTTP request/response.

That breadth is both strength and limitation.

When `curl` fails, ask which earlier dependency must be isolated next rather than treating the final error message as the root cause.

## 12. Packet capture shows traffic at one chosen observation point

Common tools include:

- `tcpdump`,
- TShark,
- Wireshark.

For example:

```bash
tcpdump -ni any
```

A capture is a time-ordered record of traffic visible **at that capture point**.

It is not a dump of the complete distributed system.

A packet can exist elsewhere without appearing at your capture point, and host offloads or encapsulation can make the same logical exchange look different on different interfaces.

## 13. Capture only traffic you are authorized to inspect

Course experiments should prefer:

- your own host,
- loopback,
- namespaces/containers,
- provided PCAPs,
- controlled lab services.

Do not capture unrelated users' traffic on shared networks.

This is both an ethical rule and good experimental design: controlled traffic is easier to interpret.

## 14. Timestamps are measurements with assumptions

Packet timestamps are useful for latency analysis, but they depend on:

- capture location,
- clock source,
- timestamp resolution,
- kernel/NIC buffering,
- offloads,
- whether the event happened before or after the observation point.

A number printed with six decimal places is not automatically accurate to six decimal places.

M02 and M13 will return to measurement quality and reproducibility.

## 15. Offloads can make host-visible packets differ from wire-visible packets

Modern NICs and kernels may perform:

- checksum offload,
- segmentation offload,
- receive aggregation,
- batching,
- other acceleration.

A capture inside the host can therefore show packet sizes or checksum states that differ from the eventual physical-wire representation.

This is not necessarily a bug in Wireshark or the NIC.

It is evidence that the capture occurred at a particular architecture boundary.

## 16. Use one tool to answer one concrete question

A useful workflow is:

| Question | Evidence |
|---|---|
| Which interfaces/addresses exist? | `ip address` |
| Which route would the kernel select? | `ip route get` |
| Is the next-hop neighbor resolved? | `ip neigh` |
| Which sockets are listening/connected? | `ss` |
| What does DNS return? | `dig` |
| What does the application interaction do? | `curl -v` |
| Which packets are visible here? | packet capture |

Troubleshooting gets easier when every command has a purpose stated **before** it is run.


## 17. Worked investigation — explain one successful Web request from several evidence layers

Suppose:

```bash
curl https://example.com/
```

succeeds.

Collect evidence such as:

```bash
ip address
ip route
ip route get <resolved-IP>
ip neigh
ss -tn
dig example.com
curl -v https://example.com/
```

and, where authorized, a narrow packet capture.

Build a timeline:

```text
name query / cached resolution
      ↓
selected destination address
      ↓
local route + next hop
      ↓
transport connection
      ↓
TLS/security setup
      ↓
HTTP request/response
```

Then label each observation by source:

```text
application evidence
kernel state
packet evidence
```

The exercise is successful when you can explain not only **what happened**, but **which observation supports each claim**.

## 18. Common environment and reasoning failures

### Missing command

This is an environment/tooling problem until evidence shows otherwise. Use the documented alternative or deterministic fixture when provided.

### No packet-capture privilege

The application may still work. Use supplied PCAPs/datasets or a controlled namespace/container where capture is allowed.

### No GitHub connectivity

Local Git and local transparent tests remain usable by design.

### Hard-coded interface assumptions

The machine may use `enp...`, `wlp...`, virtual interfaces, or namespace-specific names. Inspect actual state.

### Virtualized host treated as “wrong networking”

VMs, containers, VPNs, and cloud hosts legitimately add interfaces, routes, NAT, and tunnels. Those are part of the system, not noise to ignore.

### One command treated as proof of the whole path

A correct `dig`, `ping`, or `ss` result has a specific authority boundary. Do not let one successful layer stand in for all others.

## Chapter summary

M00 establishes the evidence discipline used throughout the book:

1. **The host already exposes inspectable networking state.**
2. **Interfaces, addresses, routes, neighbors, sockets, DNS, application tools, and packet captures answer different questions.**
3. **A default route is a next-hop fallback, not the final remote destination.**
4. **Packet captures are local observations whose interpretation depends on capture point and offloads.**
5. **Use least privilege and controlled environments for experiments.**
6. **Git, tests, and assignment work remain local-first.**
7. **Transparent tests are executable specification, and student tests capture discovered edge cases.**
8. **A good investigation states what each command is intended to prove before running it.**

Before continuing, choose one successful network interaction on your machine and explain it using at least one piece of application evidence, one piece of kernel state, and one packet-level observation or provided fixture.

## Systems connections

### [OS]

Interfaces, routes, neighbors, sockets, processes, namespaces, permissions, and capture hooks are operating-system state.

### [ARCH]

NICs, drivers, DMA, interrupts, queues, segmentation, checksums, and offloads explain why host-visible evidence can differ from an abstract packet model.

### [DIST]

Even a simple Web request already crosses independently failing naming, transport, security, and service components.

### [SEC]

Least privilege, capture authorization, encrypted traffic, and endpoint-controlled evidence establish important observation boundaries.

### [PERF]

Later performance claims depend on correct timestamps, workload descriptions, capture placement, counters, and system context.

## Self-check

Without looking back:

1. Which command asks the kernel for route selection to one destination?
2. Distinguish `ip route` state from `ip neigh` state.
3. What does a listening socket prove, and what does it not prove?
4. Why is `curl` useful but too broad to diagnose root cause by itself?
5. Why should every packet capture record its interface/capture point?
6. What core course work remains possible with no GitHub access?
7. Where should students place their own transparent tests?
8. Give one reason a host capture may differ from physical-wire packets.
9. Why is a missing optional command an environment fact rather than automatically a protocol failure?

Then complete the M00 workbench lab and keep the resulting baseline notes for the troubleshooting work in M13.

<div class="cn-practice-label">Guided practice</div>

## Guided practice

**Time:** 8–10 minutes  
**Materials:** a local Linux shell; no Internet access required

### Prediction

Before running anything, write down what you expect to find on a normal host:

1. At least one interface that does not require a physical network.
2. One or more IP addresses attached to interfaces.
3. A routing decision for loopback traffic.
4. Zero or more listening TCP sockets.

For each item, name the operating-system object you think will provide the evidence: interface state, address state, routing state, or socket state.

### Worked example

Suppose a host reports an interface named `lo` with `127.0.0.1/8`, a route for `127.0.0.0/8` through `lo`, and a process listening on `127.0.0.1:8000`.

A useful explanation is not “the network is working.” It is more precise:

- the kernel has a loopback interface;
- the address belongs to that interface;
- the route keeps matching traffic inside the host;
- a process has asked the kernel to accept TCP connections on port 8000.

Each statement is supported by a different kind of state.

### Guided micro-experiment

Run these local commands and record only the lines you need:

```bash
ip -br link
ip -br addr
ip route get 127.0.0.1
ss -ltn
```

Now answer:

1. Which interface carries `127.0.0.1` on your host?
2. Does the route lookup for `127.0.0.1` require a gateway?
3. Pick one listening socket, if any exist. Is it bound to loopback, to a specific non-loopback address, or to a wildcard address?
4. Which command above can tell you that a process is listening? Which commands cannot prove that fact?

Do not worry if your interface names or socket list differ from another machine. The mechanism, not the exact output, is the target.

### Evidence to keep

Keep four short facts: one interface fact, one address fact, one route fact, and one socket fact. For each, write the command that supports it and one claim that the command **cannot** establish. You should be able to explain those boundaries before moving to the knowledge check.

<div class="cn-practice-label">Knowledge check</div>

## Knowledge check

Answer before running the lab.

1. Which command would you use to inspect interface addresses? Local route selection for one destination? Neighbor state? Listening sockets?
2. Explain the difference between an IP route and an ARP/NDP neighbor entry.
3. Why can a packet capture not tell you every piece of state inside the local process or a remote router?
4. What additional information does `ss` provide that a packet capture may not provide directly?
5. If `curl` fails, why is “the network is down” an insufficient diagnosis?
6. Which useful networking observations can you still perform when public Internet access is unavailable?
7. Why are commands, text outputs, and packet captures usually better reproducible evidence than screenshots?
8. Why should each diagnostic command be chosen to answer a specific evidence question rather than run without a hypothesis?
9. Give one reason NIC/kernel offloads can make a host-side capture differ from the final wire representation.

After answering, record the current workbench with the local tools available on your system, then follow one local HTTP interaction end to end. If Internet access is available, compare it with one DNS + HTTPS interaction.

<div class="cn-practice-label cn-lab-label">Required laboratory</div>

## Required laboratory

This bootcamp is deliberately observational. It introduces the local-first workflow and establishes a baseline snapshot students can return to during later troubleshooting modules.

### 1. Check the environment

Record which optional networking tools are present on your system. Do not install additional tools unless you need them for a concrete observation.

### 2. Predict before inspecting

Before running each command, write down what you expect it to reveal:

```bash
ip address
ip route
ss -lntup
```

For each, identify whether the information belongs primarily to the application, socket/OS, network, or link view. Then predict what will change in `ss` after you start a local HTTP service in the next step.

### 3. Follow one application exchange

The required path works without Internet access. In one terminal, start a loopback-only HTTP service:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

In another terminal, inspect the listening socket and make one request:

```bash
ss -lntp
curl -I http://127.0.0.1:8000/
```

Capture the loopback exchange with Wireshark/TShark or `tcpdump` when permissions allow. If packet capture is unavailable, preserve the `ss` output and the HTTP response headers as the required evidence.

When Internet connectivity and a configured resolver are available, add this optional comparison:

```bash
dig example.com
curl -I https://example.com/
```

Compare the live DNS/HTTPS evidence with the local exchange, but do not treat connectivity to `example.com` as a correctness requirement.

Your required evidence should identify at least:

- one local interface and its IP address,
- the loopback interface,
- the default route if one is configured,
- one listening TCP socket,
- one local HTTP/TCP exchange,
- local and peer transport ports.

If you performed the optional connected comparison, also identify one DNS query/response and the remote transport endpoint.


### 4. Explain

Create a short technical note containing commands and text evidence rather than screenshots. Answer:

1. Which information came from the kernel rather than the packet capture?
2. Which values changed between DNS and web traffic?
3. What could you still learn if GitHub were unavailable for the entire semester?
4. Which tool would you reach for first if a hostname resolved but a TCP connection failed?

There is no pass/fail programming suite for this lab: the learning objective is correct observation and interpretation. This publication focuses on reproducible observation and interpretation.

<div class="cn-end-note"><span>Next available material</span><strong><a href="../chapter-1/">Chapter 1 · Internet Architecture →</a></strong></div>
