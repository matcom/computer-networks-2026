---
title: 'Chapter 1 · Internet Architecture'
description: 'Follow one Internet exchange across system boundaries.'
pagination: false
---

<p class="cn-course-kicker">Chapter 1</p>
<p class="cn-guiding-question">What happens, at every relevant system boundary, when one program communicates with another program across a network?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path" role="img" aria-label="A client process crosses the local host, local network and gateway, routed Internet, remote host, and server process.">
    <div class="cn-network-node"><span>Application</span><strong>Client process</strong><small>URL · request</small></div>
    <div class="cn-network-node"><span>Endpoint</span><strong>Host kernel</strong><small>socket · route · neighbor</small></div>
    <div class="cn-network-node"><span>Local network</span><strong>Gateway</strong><small>frame in · packet out</small></div>
    <div class="cn-network-node cn-network-core"><span>Network</span><strong>Routed Internet</strong><small>forwarding · policy</small></div>
    <div class="cn-network-node"><span>Endpoint</span><strong>Remote host</strong><small>packet · socket delivery</small></div>
    <div class="cn-network-node"><span>Application</span><strong>Server process</strong><small>request · response</small></div>
  </div>
  <figcaption><strong>Figure —</strong> The application exchange crosses explicit system boundaries. State changes at each boundary: application data becomes socket state, packets cross routed networks, and the remote endpoint delivers data to the server process.</figcaption>
</figure>
## Why this chapter matters

A browser can load a page in a fraction of a second, but the apparent simplicity hides several cooperating systems: an application, the operating system, a local network, one or more routers, other independently operated networks, and a remote service. The important skill is not memorizing the names of protocols. It is learning to ask **which component acts, which state it uses, and what evidence can reveal that state**.

This chapter establishes the model used throughout the rest of the book.

> **Pause and predict.** You type `https://example.com/` into a browser. Before reading further, list at least four different systems or protocol mechanisms that may become involved before the first byte of the response appears.

## 1. One application action crosses many boundaries

A useful first approximation is:

```text
application
    ↓
operating-system networking API
    ↓
transport state
    ↓
IP forwarding
    ↓
local link
    ↓
routers and other links
    ↓
remote host
    ↓
remote application
```

No single component needs to understand the whole exchange. The application does not need to know how an Ethernet frame is encoded. A router normally does not need to know which HTML element a request will produce. The remote server does not need a copy of every intermediate router's forwarding table.

This separation is one reason the Internet can scale: components cooperate through **interfaces and protocol contracts** rather than by sharing one global implementation.

## 2. Packet switching trades reservation for sharing

Internet traffic is divided into packets that share links over time. Capacity is not normally reserved permanently for each application before it can send.

If a 1 Gb/s output link is idle, one active flow may use most of it. If many flows become active at once, their packets compete for the same finite service rate. That creates three recurring effects:

- **queueing delay** while packets wait to be transmitted,
- **loss** when buffers or other resources are exhausted,
- **variable performance** because competing traffic changes over time.

Packet switching therefore gives the Internet excellent statistical sharing, but not constant latency.

> **Pause and predict.** Two applications share the same output link. Must the network reserve exactly half of the link for each one before either application can transmit? What changes if both send at full rate simultaneously?

M02 will quantify propagation, serialization, queueing, throughput, and bandwidth-delay product. M09 will study how endpoints react when shared capacity becomes congested.

## 3. Layers are contracts, not independent boxes

Layering works when one layer offers a service through a simpler interface than the details needed to implement that service.

A program can use a socket without deciding how Wi-Fi or Ethernet represents bits. IP can carry packets over many link technologies. Transport protocols can provide process-to-process communication without requiring applications to implement routing.

A compact model is:

```text
application     meaning: names, requests, responses
transport       process-to-process communication
IP              forwarding across heterogeneous networks
link            one-hop delivery on the current medium
physical        signals and transmission
```

The layers are not separate machines. A host commonly processes all of them. A router also has interfaces, queues, link-layer behavior, an operating system or control plane, and sometimes application services.

Layering is an abstraction, not a rule that engineers should ignore lower layers. Performance failures, MTU problems, packet loss, offload behavior, and security boundaries often require looking across the stack.

## 4. Encapsulation carries the state each layer needs

Suppose an application produces payload `P`. Conceptually, lower layers wrap that payload with their own metadata:

```text
application:                    [ P ]
transport:      [ transport hdr | P ]
IP:        [ IP hdr | transport hdr | P ]
link: [ link hdr | IP hdr | transport hdr | P | trailer ]
```

The headers are not decorative labels. They carry information used by a particular layer: ports, sequence information, network addresses, hop limits, protocol identifiers, checksums, and other state.

A crucial consequence is that **not every device needs to inspect every header**. Basic IP forwarding uses network-layer information. A normal router does not need to parse an HTTP method to choose the next hop.

As a packet moves between links, the local link frame can change even while the logical IP packet continues toward the same remote endpoint.

> **Worked example.** A packet crosses five routers between two Ethernet-connected hosts. The IP source and destination normally remain the same end to end, while each Ethernet hop can use a different source/destination pair. This is why the MAC address of a remote Internet server is usually irrelevant to your local host.

## 5. The Internet is a network of networks

The word *Internet* is literal: it is an **internetwork**. Thousands of independently operated networks cooperate through common protocols.

Useful entities to distinguish are:

- **Host:** a machine running endpoint applications and a network stack.
- **Link:** one communication domain or hop between interfaces.
- **Switch:** a device that commonly forwards frames inside a link-layer domain.
- **Router:** a device that forwards IP packets between networks.
- **Autonomous System (AS):** networks operated under one administrative routing policy.
- **Service:** application functionality that may be replicated across many hosts, regions, or providers.

A path may cross a home or campus network, an access provider, transit providers, Internet exchange points, and a content provider. Those organizations do not share one global router configuration. They interoperate because they agree on common protocol behavior.

### Administrative structure matters

The shortest physical path is not always the selected Internet path. Commercial relationships, policy, failures, capacity, and traffic engineering all influence routing. M07 develops this idea with BGP.

## 6. The narrow waist lets both ends evolve

The Internet architecture is often described as an hourglass:

```text
many applications
       ↓
transport choices
       ↓
       IP
       ↓
many link technologies
```

IP is the narrow common layer. Many applications can use it above; many link technologies can carry it below.

This design reduces coordination. A new application does not require every Ethernet switch, Wi-Fi network, fiber link, or radio system to understand that application's semantics. Likewise, a new link technology can carry existing IP applications without redesigning those applications.

The trade-off is intentional minimalism: the network layer does not try to provide every property an application could want.

## 7. State belongs where enough information exists

The **end-to-end argument** asks where a function can be implemented completely and correctly.

Imagine that a lower network layer promises reliable transfer. Can the sender conclude that a file is now correct on the receiver's disk? Not necessarily. Corruption could happen before transmission, after reception, in storage, or inside the application. Only the endpoints have enough context to verify the final application-level result.

That does not mean "the network should do nothing." Lower layers can still provide retransmission, checksums, congestion control, forwarding, filtering, and other useful mechanisms. The principle is about **where final correctness can be established**.

Examples that ultimately require endpoint knowledge include:

- application-level integrity,
- authentication and encryption semantics,
- whether a retry is safe,
- whether a transaction actually completed.

This idea will reappear in transport, TLS, distributed systems, retries, and replication.

## 8. Control state and forwarding state are different jobs

Another useful split is between the **control plane** and the **data plane**.

The control plane learns or computes information such as routes. The data plane uses installed forwarding state to process packets quickly.

Conceptually:

```text
routing information / policy
            ↓
      control plane
            ↓
    forwarding table
            ↓
       data plane
            ↓
       next hop
```

OSPF, BGP, static configuration, or a software-defined controller can influence forwarding state. Packet forwarding then uses the resulting table repeatedly for individual packets.

Separating these roles helps explain why a router can keep forwarding traffic using an existing table even while routing protocols are still exchanging control information.

## 9. Trace one real exchange from evidence

Assume the user requests `https://example.com/`. A useful troubleshooting timeline is not "the Internet did something" but a sequence of observable decisions.

### Step 1 — obtain a destination

The resolver needs an address for the name unless a usable answer is already cached.

```bash
dig example.com
```

This reveals DNS information. It does **not** reveal the future forwarding path through every router.

### Step 2 — choose a local route

The kernel selects how to reach the destination, commonly through a default gateway.

```bash
ip route
ip route get <destination-IP>
```

This is local routing evidence.

### Step 3 — reach the next hop on the local link

On an Ethernet-like LAN, the host usually needs a link-layer address for the **next hop**, not for the remote Internet server.

```bash
ip neigh
```

### Step 4 — create endpoint transport state

The application opens transport state and, for HTTPS, security/application protocols are negotiated on top of it.

```bash
ss -tn
curl -v https://example.com/
```

### Step 5 — forward across networks

Routers receive the packet on one interface, consult forwarding state, update hop-lifetime information, and emit it toward another link.

```bash
traceroute example.com
```

`traceroute` provides indirect endpoint-visible evidence about parts of the path. It is not a remote copy of every router's internal state.

### Step 6 — correlate with packet evidence

A packet capture can show the bytes visible at the capture point, timing, addresses, ports, flags, and protocol structure.

```bash
sudo tcpdump -ni any host <destination-IP>
```

A capture still cannot automatically reveal application memory that was never transmitted, every router's table, or encrypted plaintext for which the observer lacks keys.

> **Practical reasoning rule:** first ask *what question am I trying to answer?* Then choose evidence with authority over that question.

## 10. Failures become easier when you locate the boundary

A single message such as "the website does not work" can describe very different failures.

| Boundary | Example symptom | Useful first evidence |
|---|---|---|
| Naming | hostname does not resolve | `dig` |
| Local routing | no route to destination | `ip route get` |
| Local link / neighbor | gateway cannot be reached | `ip neigh`, packet capture |
| Transport | port closed, filtered, handshake fails | `ss`, `nc`, capture |
| Security | certificate or TLS negotiation fails | `curl -v`, TLS diagnostics |
| Application | server returns an error | HTTP/application response |

The table is deliberately ordered from dependencies near the host toward application semantics. M13 will turn this into a systematic troubleshooting method.

## Worked synthesis — one request, three different address scopes

Suppose a client `10.0.0.10:53000` sends an HTTP request to server `198.51.100.20:80` through its default router. On the first Ethernet link, a simplified packet/frame view is:

```text
application:  HTTP request bytes
transport:    10.0.0.10:53000 → 198.51.100.20:80
IP:           10.0.0.10 → 198.51.100.20, TTL 64
Ethernet:     client-MAC → router-left-MAC
```

After the router forwards it onto a different Ethernet link, the application bytes, transport endpoints, and IP endpoints still describe the same end-to-end exchange, while the local framing and hop lifetime change:

```text
IP:           10.0.0.10 → 198.51.100.20, TTL 63
Ethernet:     router-right-MAC → next-hop-MAC
```

This single transition explains why “destination” is not one universal field. The transport destination identifies an endpoint service, the IP destination identifies the remote host/interface scope used for internetwork forwarding, and the Ethernet destination identifies only the next recipient on the current local link. A router participates in delivery without becoming the application endpoint.

## Chapter summary

The Internet works because independently implemented components cooperate through narrow contracts.

Keep these ideas in your mental model:

1. **Packet switching shares capacity**, which produces queues, variable delay, and possible loss.
2. **Layering separates responsibilities**, while encapsulation carries the state each layer needs.
3. **Link-layer delivery is local; IP forwarding spans networks.** Link identifiers can change from hop to hop.
4. **The Internet is administratively distributed.** Routers and autonomous systems do not belong to one global operator.
5. **IP is the narrow waist** connecting many applications to many link technologies.
6. **Final correctness often belongs at endpoints**, where application context exists.
7. **Evidence has scope.** A route table, neighbor cache, packet capture, DNS lookup, and application response answer different questions.

Before continuing, explain the path of one web request without using the phrase "the network handles it." Name the machines, the important state, and the evidence you would inspect at each stage.

## Systems connections

### [OS]

Sockets, route tables, neighbor caches, interfaces, transport state, queues, and firewall rules are operating-system state even when libraries hide them.

### [ARCH]

NICs, DMA, interrupts, offloads, CPU scheduling, and memory movement implement the host/network boundary.

### [DIST]

Naming, RPC, replication, retries, and service discovery depend on what the network actually guarantees—and what it does not.

### [SEC]

Layer boundaries are also trust boundaries. Encryption intentionally prevents some intermediaries from interpreting application semantics.

### [PERF]

Packet sharing, path length, serialization, queueing, loss, and RTT determine how architectural abstractions behave in time.

## Self-check

Without looking back, answer these questions:

1. Why can a router forward a web request without knowing its HTTP method?
2. Why is the Ethernet destination on the first hop often the gateway instead of the remote server?
3. Why can packet switching achieve high utilization while still producing variable delay?
4. What does the IP narrow waist enable?
5. Give one function that ultimately needs endpoint verification and explain why.
6. Which local tools would you use to inspect DNS, route, neighbor, transport, and packet state?

Then continue to the M01 annotated-exchange laboratory.

<div class="cn-practice-label">Guided practice</div>

## Guided practice

**Time:** 8–10 minutes  
**Materials:** paper or a text editor; no Internet access required

### Prediction

A browser sends an HTTP request to a server on another IP network. Before reading the example, decide which fields you expect to remain end-to-end and which can change at a router:

- application bytes;
- transport ports;
- source and destination IP addresses;
- source and destination Ethernet MAC addresses;
- IP TTL/Hop Limit.

Write `same`, `may change`, or `must change` beside each item.

### Worked example

Consider this simplified path:

```text
client H1 ── Ethernet ── router R1 ── Ethernet ── server H2
```

H1 creates application bytes, gives them to the transport layer, places the transport unit inside an IP packet, and places that packet inside a local-link frame. R1 removes the incoming link-layer framing, makes an IP forwarding decision, decreases TTL/Hop Limit, and creates new link-layer framing for the next link.

The important separation is that the IP packet provides the internetworking abstraction while Ethernet addresses are meaningful only on each local link. The router forwards the packet; it does not become the endpoint of the application conversation.

### Guided micro-experiment

Make a four-row table with the stages `H1 sends`, `R1 receives`, `R1 sends`, and `H2 receives`. Add columns for:

- application payload;
- source/destination transport ports;
- source/destination IP;
- source/destination MAC;
- TTL/Hop Limit.

Use this starting state:

```text
H1 IP = 10.0.0.10        H2 IP = 10.0.1.20
H1 port = 53000          H2 port = 80
H1 MAC = AA              R1-left MAC = R1L
R1-right MAC = R1R       H2 MAC = BB
initial TTL = 64
```

Fill the table. At the router, keep the transport endpoints and IP endpoints unchanged, decrement TTL to 63, and replace the link-layer source/destination addresses for the outgoing link.

Then answer two questions:

1. Why is IP often called the Internet's “narrow waist” in this path?
2. Which state belongs at the endpoints even though routers participate in delivery?

### Evidence to keep

Keep the completed table and one sentence distinguishing **encapsulation** from **forwarding**. Your sentence should make clear that a router can replace local-link framing without terminating the end-to-end application exchange.

<div class="cn-practice-label">Knowledge check</div>

## Knowledge check

Answer before the lab and justify each answer.

1. A host sends an IP packet to a remote network through a default gateway. Which link-layer destination should normally appear on the first Ethernet frame: the remote server or the gateway? Why?
2. A router forwards a packet onto a new Ethernet link. Which information is expected to change: link-layer addresses, IP addresses, both, or neither under ordinary forwarding?
3. Explain one benefit and one cost of packet switching compared with permanently reserving capacity for every flow.
4. Why can the Internet support both new applications and new link technologies without requiring every component to understand every other component?
5. Classify each item as primarily application, transport, network, or link state: hostname, TCP port, IP prefix, MAC address.
6. Which command would you choose first to inspect local route state? Neighbor state? DNS? Established TCP sockets?
7. Give an example of a function for which endpoint verification remains necessary even if lower layers provide assistance.
8. A packet capture shows encrypted TCP/QUIC traffic. Why can it still be useful even when application plaintext is unavailable?

After answering, complete the annotated M01 exchange timeline and revise any incorrect predictions.

<div class="cn-practice-label cn-lab-label">Required laboratory</div>

## Required laboratory

This module establishes the course's main habit: follow state and evidence across boundaries instead of memorizing a stack diagram.

There is no artificial programming grader for this lab. The required work is a reproducible investigation.

### Canonical model

[Download the canonical web-exchange model](../data/m01-web-exchange.json). It provides an eight-step logical timeline from name resolution to the remote application.

For every step classify:

- which machine/device acts,
- which protocol layer is primarily involved,
- what state is read or changed,
- what evidence could make that state visible.

### Predict

Before capturing anything, answer:

1. Which addresses remain end-to-end and which change hop-by-hop?
2. Does a router normally process the remote HTTP request body?
3. Where does the destination hostname become an IP address?
4. Why may a host need a link-layer address for its default gateway even when the final server is on another continent?

### Observe your system

The required observation is local and does not depend on public-Internet access. Inspect the host state that would participate in an exchange:

```bash
ip address
ip route
ip neigh
ss -tn
```

Record what each command can establish and what it cannot establish about the canonical exchange.

#### Optional connected enrichment

If Internet connectivity and the corresponding tools are available, compare the deterministic model with a live public exchange:

```bash
dig example.com
curl -I https://example.com/
traceroute example.com
```

Use Wireshark/TShark or `tcpdump` if capture permissions allow. Public-Internet behavior is observational enrichment, not a correctness requirement: paths, addresses, timing, filtering, and tool availability may vary. Do not rely on a screenshot; record commands and textual/PCAP evidence when you perform the comparison.

### Build an annotated timeline

Construct a table with at least these columns:

| Step | Actor | Application state | Transport state | IP state | Link state | Evidence |
|---|---|---|---|---|---|---|

Not every cell must contain state. An important part of the exercise is identifying which layers/devices **do not** need to understand a given piece of information.

### Explain

Answer the guiding question: what happens, at every relevant system boundary, when one program communicates with another program across a network?

Explicitly identify one example of the end-to-end principle and one example of functionality that necessarily belongs inside the network.

This observational lab is complete when another student can reproduce the timeline and reasoning from the evidence you preserved.

<div class="cn-end-note"><span>Part I publication boundary</span><strong>Continue through Chapters 2–4. Parts II–V remain intentionally unpublished.</strong></div>
