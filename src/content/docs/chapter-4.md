---
title: 'Chapter 4 · Ethernet and Local Networks'
description: 'Reason about Ethernet frames, MAC learning, flooding, forwarding, and ARP state.'
pagination: false
---

<p class="cn-book-part">Part I · Chapter 4</p>
<p class="cn-guiding-question">How does a host deliver a packet to another machine on the same local network?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-4">
    <div class="cn-network-node"><span>Port 1</span><strong>Host A sends</strong><small>src A · dst B</small></div>
    <div class="cn-network-node"><span>Switch</span><strong>Learn source</strong><small>A → port 1</small></div>
    <div class="cn-network-node"><span>Unknown B</span><strong>Flood</strong><small>all ports except ingress</small></div>
    <div class="cn-network-node"><span>Receivers</span><strong>B accepts · C ignores</strong><small>table improves for next frame</small></div>
  </div>
  <figcaption><strong>Figure —</strong> A useful model separates the boundaries where information changes representation or waits for a resource.</figcaption>
</figure>

## Why this chapter matters

IP can decide that a packet should leave through a particular interface and next hop, but that decision still has to become **local delivery on a real link**.

On an Ethernet-style LAN, two different kinds of state cooperate:

- the **host** maintains neighbor information such as IP-to-link-address mappings,
- the **switch** maintains forwarding information such as MAC-to-port mappings.

Confusing those tables is one of the fastest ways to become lost while debugging a LAN.

> **Pause and predict.** Your laptop wants to send an IP packet to a server on another continent. Which MAC address does the first Ethernet frame normally use as its destination: the remote server's, the local gateway's, or both?

## 1. Ethernet delivery is local to a link-layer domain

An Ethernet frame carries a source MAC address, a destination MAC address, and a payload such as an IPv4 or IPv6 packet.

The frame is meaningful on the current Ethernet domain. When a router forwards the enclosed IP packet onto another Ethernet link, it constructs a **new frame** appropriate to that next hop.

Therefore:

```text
Ethernet frame: local-hop delivery
IP packet:      network-layer destination across hops
```

This distinction is the foundation for understanding switches, ARP, neighbor caches, and routing boundaries.

## 2. Unicast, broadcast, and unknown unicast are different cases

A unicast frame names one destination MAC address.

Ethernet broadcast uses:

```text
ff:ff:ff:ff:ff:ff
```

A simple switch floods broadcast frames throughout the broadcast domain, subject to real network controls.

An **unknown unicast** is different: it has one specific destination MAC, but the switch has not yet learned which port reaches that address. A basic learning switch also floods this case because it lacks better forwarding information.

So both can produce flooding, but for different reasons:

```text
broadcast       → intentionally addressed to everyone
unknown unicast → one destination, location not yet learned
```

## 3. A learning switch builds topology knowledge from source addresses

Suppose a switch has ports `p1`, `p2`, and `p3`.

For each received frame, a simple learning algorithm is:

```text
1. learn source_MAC → ingress_port
2. inspect destination MAC
3. broadcast?              flood other ports
4. destination unknown?    flood other ports
5. destination on ingress? filter
6. otherwise               forward to learned port
```

Why learn from the **source**?

Because receiving a frame on `p2` is direct evidence that the source address is reachable through `p2`. The destination address says where the sender *wanted* the frame to go, not where that destination actually resides.

> **Pause and predict.** An empty switch receives `A → B` on `p1`. What does it learn immediately? What can it infer about B?

It can learn `A → p1`. It cannot yet infer B's port, so it floods the frame.

## 4. Worked example — the table gets smarter after each frame

Start with an empty table.

### Frame 1: `A → B` enters on `p1`

Learn:

```text
A → p1
```

B is unknown, so the frame is sent out `p2` and `p3`.

### Frame 2: `B → A` enters on `p2`

Learn:

```text
A → p1
B → p2
```

A is already known, so only `p1` receives the frame.

### Frame 3: `C → A` enters on `p3`

Learn:

```text
A → p1
B → p2
C → p3
```

A is known, so the frame goes only to `p1`.

The switch has built useful forwarding state **without a host-registration protocol**. Ordinary traffic taught it enough topology to reduce flooding.

## 5. Learned state must change when the network changes

Suppose A disconnects from `p1` and later sends from `p3`.

The next source-learning event should update:

```text
A → p3
```

Real switches also age stale entries because hosts move, links change, and old observations eventually become unreliable.

The course lab omits wall-clock aging so its forwarding behavior remains deterministic. The conceptual lesson still matters: **cached forwarding state has a lifetime and can become stale**.

## 6. ARP solves a different problem from switch learning

A host has chosen an IPv4 next-hop address, but Ethernet transmission needs a destination MAC address.

If the mapping is not cached, ARP can ask the local link:

```text
Ethernet destination: ff:ff:ff:ff:ff:ff
ARP: Who has 192.0.2.10? Tell 192.0.2.20
```

The owner can reply, allowing the requester to learn:

```text
192.0.2.10 → 02:00:00:00:00:10
```

Notice the two independent caches:

```text
host neighbor cache:   next-hop IP → MAC
switch forwarding:     MAC → port
```

The first helps a host construct a frame. The second helps a switch choose where to send that frame.

## 7. ARP fields and Ethernet fields must not be collapsed into “source” and “destination”

An ARP message is carried **inside** an Ethernet frame. During analysis, distinguish:

- Ethernet source MAC,
- Ethernet destination MAC,
- ARP sender hardware address,
- ARP sender protocol address,
- ARP target hardware address,
- ARP target protocol address.

This sounds pedantic until malformed, stale, or spoofed control traffic appears. Precise field names prevent incorrect conclusions.

## 8. The next hop is not necessarily the final IP destination

Suppose:

```text
host:    192.0.2.20/24
gateway: 192.0.2.1
server:  198.51.100.50
```

The server is outside the local `/24`, so the routing decision selects the gateway as next hop.

The host resolves:

```text
192.0.2.1 → gateway MAC
```

not the remote server's MAC.

The first frame therefore looks conceptually like:

```text
Ethernet destination = gateway MAC
IP destination       = 198.51.100.50
```

The Ethernet frame ends at the router. The router extracts the IP packet, makes a new forwarding decision, and places that packet into a new link-layer frame for the next link.

> **Worked reasoning rule:** first choose the IP next hop; only then ask how that next hop is reached on the local link.

## 9. Neighbor caches improve efficiency but create stale-state problems

Resolving every next hop for every packet would be wasteful, so hosts cache neighbor information.

Cached state introduces familiar systems concerns:

- expiration,
- mobility,
- conflicting observations,
- stale mappings,
- trust.

On Linux:

```bash
ip neigh
```

shows neighbor state and often its reachability status.

This is another example of a general distributed-systems pattern: caching makes the common path fast, but correctness becomes dependent on invalidation and freshness.

## 10. IPv6 uses Neighbor Discovery instead of ARP

IPv6 does not use ARP. Neighbor Discovery uses ICMPv6 and covers functions including neighbor resolution, router discovery, and reachability-related state.

The transferable concept is more important than memorizing one packet format:

```text
IP forwarding decision
        ↓
selected next hop
        ↓
local link-layer resolution / reachability
        ↓
frame transmission
```

IPv4/ARP and IPv6/NDP implement that pattern differently.

## 11. Loops turn flooding from useful fallback into a failure mode

Learning assumes that flooding eventually reaches the destination without circulating forever.

With redundant Ethernet links, a naive layer-2 topology can create loops. Broadcast and unknown-unicast frames may be duplicated and circulate repeatedly, consuming shared capacity and destabilizing the network.

Production Ethernet therefore needs a strategy such as:

- loop-avoidance/control protocols,
- deliberately loop-free topology,
- or architectures that move multipath behavior to another layer.

This is why “add another cable for redundancy” is not automatically safe at layer 2.

## 12. VLANs create separate logical link-layer domains

A physical switch can support multiple logical Ethernet domains using VLANs.

That means MAC learning is not simply one global mapping for every frame on the device. Forwarding state is normally scoped by VLAN or an equivalent context.

VLANs help isolate broadcast domains and administrative groups, but they do not remove the need to reason about routing between those domains.

## 13. Observe the mechanism on a real host

### Interface state

```bash
ip link
```

### Neighbor state

```bash
ip neigh
```

### Packet evidence

Capture an ARP exchange when permitted and ask:

1. Is the request's Ethernet destination broadcast?
2. Which host claims the target IP?
3. Is the reply broadcast or unicast?
4. Does the neighbor table change after the exchange?

The goal is to correlate **wire evidence** with **host state**, not merely identify packet names.

## 14. Failure boundaries become clearer once the two tables are separated

### Wrong or stale neighbor mapping

The host has a plausible IP route but constructs frames for the wrong MAC.

### Wrong or stale switch entry

The frame is correctly addressed, but the switch forwards it toward the wrong port until relearning or aging repairs the state.

### ARP/NDP resolution failure

The host knows which next-hop IP it wants but cannot establish usable local-link delivery.

### Layer-2 loop or broadcast storm

Repeated/flooded traffic consumes shared capacity and can overwhelm devices.

These symptoms can look similar from an application, but the evidence and corrective action differ.

## 15. Local control state has a trust model

Classic ARP does not provide cryptographic authentication of a mapping claim. A network therefore cannot assume that every received mapping is trustworthy merely because it is syntactically valid.

Operational networks may add segmentation, inspection, static configuration, switch controls, or higher-layer encryption depending on the threat model.

The course lesson is architectural:

> **Any control mechanism that accepts remote state must have an explicit trust model.**

## Chapter summary

Keep these two state machines separate in your head:

1. **Host neighbor state maps next-hop network addresses to local link addresses.**
2. **Switch forwarding state maps observed link addresses to switch ports.**
3. **Switches learn from source addresses because ingress gives evidence about source reachability.**
4. **Broadcast and unknown unicast can both flood, but for different reasons.**
5. **A remote IP destination usually does not imply a remote MAC destination on the first hop.**
6. **Routers replace link-layer framing as packets cross links.**
7. **Cached state can become stale; redundant layer-2 paths can create loops.**
8. **Local control protocols depend on trust assumptions.**

Before continuing, explain exactly what changes and what remains logically stable when one IP packet crosses a router between two Ethernet LANs.

## Systems connections

### [OS]

The host kernel owns interface and neighbor state and decides when local resolution is required.

### [ARCH]

NICs and switches can perform filtering and forwarding in hardware, while drivers and DMA connect frames to host memory.

### [DIST]

Neighbor and forwarding caches are distributed cached state that may become stale after movement or topology change.

### [SEC]

ARP/NDP and other local control mechanisms require explicit trust assumptions and defensive network design.

### [PERF]

Learning reduces unnecessary flooding; loops and oversized broadcast domains consume shared capacity.

## Self-check

Without looking back:

1. Why does a learning switch update its table from the source MAC?
2. What does a fresh switch do with unknown unicast, and why?
3. Distinguish a host neighbor cache from a switch forwarding table.
4. Why does a host usually resolve its gateway rather than a remote Internet server's MAC?
5. Which headers/addresses are replaced when a router forwards an IP packet onto another Ethernet link?
6. Explain one way cached link-layer state can become stale.

Then complete the required switch/ARP laboratory below and correlate the deterministic model with local `ip neigh` or packet-capture evidence.

<div class="cn-practice-label">Guided practice</div>

**Time:** 10–12 minutes  
**Materials:** paper or a text editor; no Internet access required

## Prediction

A learning switch has three ports. Host A is on port 1, B on port 2, and C on port 3. The switch table starts empty.

Predict what the switch does with the first frame `A → C`: does it drop, flood, or send to one known port? Also write which address the switch learns from that frame.

## Worked example

A learning switch learns from the **source** MAC address of each received frame. It uses the **destination** MAC address to decide where to send the frame.

For the first `A → C` frame:

```text
receive on port 1
learn A → port 1
destination C is unknown
flood to ports 2 and 3
```

If C replies `C → A`, the switch learns `C → port 3` and can send that reply only to port 1.

## Guided micro-experiment

Starting with an empty table, process this sequence manually:

```text
1. A → C arrives on port 1
2. C → A arrives on port 3
3. B → C arrives on port 2
4. A → B arrives on port 1
```

After each frame, record:

- the learned table;
- whether the frame is flooded or forwarded to one port;
- the output port or ports.

Then keep the same topology and consider this ARP request from A:

```text
Ethernet destination: ff:ff:ff:ff:ff:ff
ARP question: Who has 10.0.0.1? Tell 10.0.0.10.
```

Answer:

1. Why does the switch flood this frame even if its learning table already contains the gateway's MAC address?
2. What does A learn from an ARP reply that the switch itself does **not** learn?
3. Which table maps MAC addresses to switch ports, and which cache maps IP next hops to link-layer addresses?

## Evidence to keep

Keep your four-step switch-table trace plus a two-column comparison labeled `switch learning` and `ARP/neighbor resolution`. You should be able to explain why these mechanisms cooperate without solving the same problem.

<div class="cn-practice-label">Knowledge check</div>

Answer before executing the switch/ARP lab.

1. A fresh three-port switch receives `A → B` on p1. What does it learn, and where does it transmit the frame?
2. Later it receives `B → A` on p2. Predict the forwarding decision and the complete learned table.
3. What happens if the switch has learned destination A on the same ingress port where a frame for A arrives?
4. Explain the difference between an Ethernet broadcast and an unknown unicast.
5. Why does an ARP request usually use Ethernet broadcast?
6. Your destination IP is remote and your route uses gateway `192.0.2.1`. Which IP address does your host resolve to a MAC before sending the first frame?
7. Who owns the ARP cache and who owns the MAC→port learning table?
8. A host moves from switch port p1 to p3. Which observed frame property lets the switch relearn its location?
9. Why can a valid IP route still fail to deliver traffic when neighbor resolution fails?

After answering, compare each prediction with the deterministic frame sequence in the laboratory below.

<div class="cn-practice-label cn-lab-label">Required laboratory</div>

## Required laboratory — Learn, flood, resolve

A switched LAN contains two different kinds of learned state: switches learn **MAC → port** mappings, while hosts learn **IP → MAC** mappings through ARP or analogous neighbor-discovery mechanisms.

### Predict

1. What does a fresh switch do with an unknown unicast destination?
2. Does the switch learn from the source address, destination address, or both?
3. What should happen when the known destination is on the same port where the frame arrived?
4. Why is an ARP request normally sent to the Ethernet broadcast destination?
5. Which machine owns an ARP cache: switch or host?

### Use this deterministic topology

```text
port 1 ─ Host A ─ MAC 02:00:00:00:00:0a ─ IP 10.0.0.10
port 2 ─ Host B ─ MAC 02:00:00:00:00:0b ─ IP 10.0.0.11
port 3 ─ Host C ─ MAC 02:00:00:00:00:0c ─ IP 10.0.0.12
```

Starting with an empty switch table, trace these frames in order: `A→B`, `B→A`, `C→A`, then `A→C`. After every frame, record the learned MAC table and which output ports receive the frame.

### Build or simulate the rules

Using code, a table, cards on paper, or another reproducible method, demonstrate:

- source-MAC learning;
- known-unicast forwarding;
- unknown-unicast and broadcast flooding;
- same-port filtering;
- a minimal host ARP cache kept separate from switch forwarding state.

### Observe local evidence

On a real/local interface, inspect `ip link` and `ip neigh`. If authorized packet capture is available, observe one ARP request/reply and identify Ethernet source/destination addresses separately from sender/target protocol addresses inside ARP.

Finish with two explanations: one sequence where the switch table changes but the host ARP cache does not, and one where ARP state changes without changing the physical switch topology.
