---
title: 'Chapter 3 · Network Performance'
description: 'Separate propagation, serialization, queueing, throughput, RTT, and bandwidth-delay product.'
pagination: false
---

<p class="cn-course-kicker">Part I · Chapter 3</p>
<p class="cn-guiding-question">Why does bandwidth alone fail to predict application performance?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-4">
    <div class="cn-network-node"><span>Host</span><strong>Processing</strong><small>inspect · prepare</small></div>
    <div class="cn-network-node"><span>Shared resource</span><strong>Queueing</strong><small>wait behind traffic</small></div>
    <div class="cn-network-node"><span>Link</span><strong>Serialization</strong><small>L / R</small></div>
    <div class="cn-network-node"><span>Distance</span><strong>Propagation</strong><small>d / s</small></div>
  </div>
  <figcaption><strong>Figure —</strong> A useful model separates the boundaries where information changes representation or waits for a resource.</figcaption>
</figure>

## Why this chapter matters

Calling a network *fast* hides several different questions. Does it deliver the first byte quickly? Can it sustain a large transfer? Does it remain responsive while other traffic is active? Does it behave consistently, or only on average?

A high-capacity link can still have long latency. A low-latency path can still have poor throughput. An idle network can look excellent and then become unusable once queues fill.

This chapter gives us a small set of quantities that let us replace vague impressions with explicit predictions.

> **Pause and predict.** A 1 Gb/s link replaces a 100 Mb/s link between two cities. Which components of delay definitely improve? Which might remain almost unchanged?

## 1. Start with units, or the model is already wrong

Most performance mistakes begin before the networking begins: bits are mixed with bytes, milliseconds with seconds, or decimal network rates with binary storage units.

Keep the basic conversions visible:

```text
1 byte = 8 bits
1 ms = 0.001 s
1 μs = 0.000001 s
1 Mbit/s = 1,000,000 bit/s
1 Gbit/s = 1,000,000,000 bit/s
```

A useful habit is to normalize everything to **bits, seconds, and bits per second** before substituting into a formula.

## 2. Four mechanisms create most path delay

For one packet at one hop, a useful decomposition is:

```text
processing + queueing + serialization + propagation
```

These terms have different causes. Treating them separately lets us ask which engineering change can actually help.

### Processing delay

A host or router must inspect enough information to decide what to do next. That can include parsing headers, forwarding lookups, policy checks, software execution, copying/moving data, scheduling, and interacting with hardware.

On a simple hardware-forwarded path this may be small. In software-heavy, virtualized, encrypted, or overloaded systems it can matter substantially.

### Queueing delay

Packets may already be waiting for the same output resource.

If 12,500 bytes are ahead of us on a 1 Mb/s output:

```text
12,500 × 8 / 1,000,000 = 0.1 s = 100 ms
```

Queueing is different from the other terms because it depends strongly on **current traffic state**. Two consecutive packets can experience very different queueing delays.

### Serialization delay

A finite-rate transmitter needs time to place all bits of a packet onto a link:

```text
D_serialization = L_bits / R_bps
```

For a 1500-byte packet:

```text
at 1 Mb/s:   12,000 / 1,000,000     = 12 ms
at 1 Gb/s:   12,000 / 1,000,000,000 = 12 μs
```

Increasing the bit rate directly reduces this term.

### Propagation delay

After a bit enters the medium, it still must travel through it:

```text
D_prop = distance / propagation_speed
```

For 2,000 km at roughly 200,000 km/s:

```text
2,000 / 200,000 = 0.010 s = 10 ms one way
```

A faster interface does not make electromagnetic propagation exceed the physical speed of the medium.

> **Key distinction:** serialization answers *how long does it take to put the bits onto the link?* Propagation answers *how long does a bit already on the link take to travel?*

## 3. End-to-end delay is a path property

Across several hops, a simple first model is:

```text
D_total = Σ(D_processing + D_queue + D_serialization + D_prop)
```

The model is useful because every term has an interpretation, but it is not a universal stopwatch formula for arbitrary workloads. Multiple packets can be pipelined across different links, and application dependencies may add waits that are not represented by one packet's forwarding delay.

A systems engineer should therefore ask two questions:

1. **What event begins and ends the measurement?**
2. **Which components can occur in parallel?**

## 4. RTT is feedback time, not simply twice a distance

Round-trip time measures how long it takes for an action to produce relevant feedback.

RTT can include:

- forward-path propagation and queues,
- receiver processing,
- reverse-path propagation and queues,
- protocol behavior at both ends.

The reverse path does not have to be identical to the forward path. Therefore:

```text
RTT ≠ guaranteed 2 × one-way delay
```

Physical distance still imposes a lower bound, but observed RTT contains more than geography.

> **Pause and predict.** `ping` rises from 15 ms to 180 ms while a large upload runs, then falls back to 15 ms when the upload stops. Did the endpoints suddenly move farther apart?

The likely explanation is persistent queueing somewhere on the shared path.

## 5. Throughput asks how much useful work completes per unit time

Throughput is a rate over an interval. If a path has link capacities:

```text
R1, R2, ..., Rn
```

then an idealized steady-state transfer cannot exceed:

```text
min(R1, R2, ..., Rn)
```

The slowest relevant resource is the bottleneck.

But application **goodput** can be lower than raw network throughput because some transmitted bits are headers, retransmissions, control traffic, encryption overhead, or data the application does not count as useful payload.

CPU limits, receive-window limits, storage speed, congestion control, Wi-Fi contention, and server behavior can also prevent an application from reaching the nominal link rate.

## 6. Bandwidth-delay product tells us how much data the path can keep in flight

Capacity and feedback delay interact. The bandwidth-delay product is:

```text
BDP_bits = R_bps × RTT_seconds
```

For 100 Mb/s and 40 ms RTT:

```text
100,000,000 × 0.040 = 4,000,000 bits
                         = 500,000 bytes
```

Interpretation: approximately 500 KB must be in flight to keep a 100 Mb/s path fully occupied over a 40 ms feedback loop.

If the sender is allowed to keep only 64 KiB outstanding, it cannot sustain 100 Mb/s in this simplified model, even though every physical link may support that rate.

This is why transport windows and congestion control become performance mechanisms rather than merely protocol details.

## 7. Startup cost and steady-state cost matter at different scales

Consider a 1 MB object over a 100 Mb/s bottleneck with 100 ms RTT.

Payload serialization is:

```text
1,000,000 × 8 / 100,000,000 = 0.08 s
```

Suppose setup and request dependencies consume three RTTs:

```text
3 × 0.1 = 0.3 s
```

A crude total is:

```text
0.38 s
```

For this short transfer, startup dominates. Doubling bandwidth would not cut completion time in half.

Now imagine transferring 10 GB. The fixed startup cost becomes relatively unimportant and sustained throughput dominates.

> **Engineering lesson:** optimize the term that dominates the workload you actually care about, not the largest number printed on the interface specification.

## 8. Statistical multiplexing creates both efficiency and queues

Dedicated capacity for every user's peak demand would waste resources whenever users are idle. Packet networks instead share capacity statistically.

This is efficient because bursts from different users often do not overlap. When they do overlap, the shared output can temporarily receive packets faster than it can transmit them.

If arrival rate remains above service rate long enough:

```text
arrival > service
      ↓
queue grows
      ↓
latency rises
      ↓
buffer can overflow
      ↓
loss / retransmission / congestion response
```

This connects performance directly to the congestion-control mechanisms studied later in the book.

## 9. Worked example — identify the dominant term before optimizing

Path characteristics:

- bottleneck rate: 10 Mb/s,
- RTT: 20 ms,
- object size: 10 MB,
- startup dependency: 2 RTTs.

Bulk transmission term:

```text
10,000,000 × 8 / 10,000,000 = 8 s
```

Startup term:

```text
2 × 0.020 = 0.040 s
```

The simple prediction is about 8.04 s. Transmission rate dominates.

Now replace the bottleneck with 1 Gb/s:

```text
80,000,000 / 1,000,000,000 = 0.08 s
startup = 0.04 s
```

Now startup is one third of the modeled total. The same application has moved into a different optimization regime.

The important step was not arithmetic. It was deciding **which mechanism controls the observed time**.

## 10. Measurement is an experiment, not a number generator

A useful measurement begins with a question.

### RTT

```bash
ping -c 20 target
```

Ask:

- Is ICMP representative of the application path?
- Are min, median, and maximum very different?
- Does latency change under load?
- Is loss present?

### Throughput

For controlled experiments, use an `iperf3` server/client pair.

Ask:

- TCP or UDP?
- single stream or several?
- test duration?
- CPU saturation?
- Wi-Fi contention?
- shared bottleneck elsewhere?

### Latency under load

One of the most revealing experiments is simple:

1. measure idle RTT,
2. start a sustained bulk transfer,
3. measure RTT again,
4. stop the transfer,
5. compare.

A large increase in RTT under load is evidence of queue buildup somewhere along the path.

## 11. Common reasoning failures

### “More bandwidth always means lower latency”

It reduces serialization on the upgraded resource. It does not automatically reduce propagation, remote processing, protocol startup, or queueing elsewhere.

### “One speed test tells me the network speed”

A speed test samples one path, workload, server, time, protocol behavior, and traffic condition.

### “Average latency is enough”

Interactive and distributed systems often care about variance and tails because one slow dependency can delay an entire operation.

### “The access link is the only bottleneck”

The application, CPU, radio medium, remote server, transport window, or another path segment may dominate.

### “A 1 Gb/s path transfers a 1 Gb object in exactly one second”

That ignores protocol overhead, startup, congestion behavior, application limits, and the distinction between gigabits and gigabytes.

## Chapter summary

Keep these performance distinctions separate:

1. **Processing** is work done by hosts/devices.
2. **Queueing** depends on competing traffic and current state.
3. **Serialization** depends on packet size and link bit rate.
4. **Propagation** depends mainly on distance and medium.
5. **RTT** is feedback time across both directions plus processing/queues.
6. **Throughput** is sustained delivery rate and is constrained by bottlenecks.
7. **BDP** links capacity to feedback delay and tells us how much data must be in flight.
8. **Short transfers and bulk transfers optimize differently.**

Before continuing, take any performance claim such as “the Wi-Fi is slow” and rewrite it as a measurable hypothesis.

## Systems connections

### [OS]

Socket buffers, scheduling, queue disciplines, timers, and process wakeups affect observed latency and throughput.

### [ARCH]

NIC rates, DMA, memory bandwidth, CPU processing, offloads, and interrupt behavior can become bottlenecks.

### [DIST]

RPC latency, fan-out, retries, quorum timing, and tail behavior depend on the same path quantities introduced here.

### [SEC]

Encryption and security handshakes add processing and sometimes extra dependency/RTT costs.

### [PERF]

This chapter supplies the quantitative vocabulary used throughout the rest of the course.

## Self-check

Without looking back:

1. Distinguish serialization delay from propagation delay.
2. Explain why RTT can increase under load without a path becoming geographically longer.
3. Calculate the BDP of a 200 Mb/s path with 50 ms RTT.
4. Explain why a short request may benefit more from reducing RTT than doubling bandwidth.
5. Give two reasons application goodput can be below the bottleneck link rate.
6. Design a simple experiment to detect queueing delay under load.

Then complete the required performance laboratory below and compare your predictions with measured or deterministic evidence.

<div class="cn-practice-label">Guided practice</div>

**Time:** 10–12 minutes  
**Materials:** calculator, paper, or a text editor; no Internet access required

## Prediction

A 1500-byte packet crosses a 100 Mb/s link and then travels 1000 km through fiber. Before calculating, predict which is larger: serialization delay or propagation delay. Also predict whether doubling the link rate changes propagation delay.

## Worked example

For a 1500-byte packet:

```text
packet size = 1500 × 8 = 12,000 bits
serialization = 12,000 / 100,000,000 = 0.00012 s = 0.12 ms
```

Using a teaching approximation of `2 × 10^8 m/s` for propagation in fiber:

```text
distance = 1000 km = 1,000,000 m
propagation = 1,000,000 / 200,000,000 = 0.005 s = 5 ms
```

Here propagation dominates serialization. Increasing the link rate reduces serialization but does not make the signal travel through the medium faster.

## Guided micro-experiment

Use the same 1500-byte packet and calculate these three cases:

| Case | Link rate | Distance | Packets already queued |
| --- | ---: | ---: | ---: |
| A | 100 Mb/s | 1000 km | 0 |
| B | 1 Gb/s | 1000 km | 0 |
| C | 100 Mb/s | 1000 km | 3 |

For case C, approximate queueing delay as three packet serialization times on the 100 Mb/s link. Then rank the cases by one-way delay.

Next calculate a bandwidth-delay product for a path with `100 Mb/s` capacity and `20 ms` RTT:

```text
BDP = rate × RTT
```

Express the answer in both bits and bytes. Ask yourself what happens to achievable throughput if the sender can keep only 32 KiB in flight on that path.

## Evidence to keep

Keep the four quantities you computed: serialization, propagation, queueing for case C, and BDP. Under them, write one sentence for each quantity stating which physical or system change could alter it. This is the model you will compare with measured evidence in the laboratory.

<div class="cn-practice-label">Knowledge check</div>

Answer before executing the lab.

1. Calculate serialization delay for a 1500-byte packet at 10 Mbit/s.
2. A fiber path is made twice as long while link bit rate stays constant. Which delay component changes directly?
3. A link has 25,000 bytes waiting ahead of you at 10 Mbit/s. Estimate the queueing delay before your packet can begin serialization.
4. Compute the bandwidth-delay product in bytes for 1 Gbit/s and 80 ms RTT.
5. Why is `min(link rates)` an upper bound for a simple steady-state path but not a guarantee of application throughput?
6. Give one workload where RTT dominates and another where bulk rate dominates.
7. Why can two consecutive pings have different RTTs even though geographic distance has not changed?
8. Explain why a 1 Gbit/s link can still produce hundreds of milliseconds of latency when a large queue forms.
9. What experimental information must accompany an `iperf3` throughput number for another student to reproduce/interpret it?

After answering, run the public numerical tests and compare your units with the expected results.

<div class="cn-practice-label cn-lab-label">Required laboratory</div>

## Required laboratory — Predict, measure, explain performance

This laboratory separates a deterministic performance model from optional real measurements. Use any reproducible local calculation environment; no specific language or test framework is required.

### Predict

1. How long does a 1500-byte packet take to serialize at 1 Mbit/s? At 1 Gbit/s?
2. A 100 Mbit/s path has 40 ms RTT. How many bytes are required to fill one RTT?
3. A path contains 1 Gbit/s, 100 Mbit/s, and 250 Mbit/s links. Which link limits steady-state throughput?
4. Which quantities can `ping` reveal directly, and which can it not?

### Build the model

Create reproducible calculations for:

- serialization delay;
- propagation delay;
- queueing delay for a stated queue and service rate;
- bandwidth-delay product;
- bottleneck rate;
- a deliberately simple transfer-time estimate whose assumptions you state explicitly.

Keep units visible. Include examples designed to expose byte/bit and millisecond/second mistakes.

### Measure when possible

If you have a controlled reachable peer, collect a small latency sample with `ping` and, when available, a throughput sample with `iperf3`. Prefer a local or controlled peer; arbitrary public Internet paths are observations, not deterministic graders.

### Compare model and evidence

Compare at least two predictions with observations or with a second independently calculated case. Explain discrepancies using possibilities such as protocol overhead, competing traffic, queueing, startup behavior, host scheduling, and the fact that RTT is not one-way propagation delay.

Finish with a short evidence table containing **prediction, observation, difference, and strongest explanation supported by the evidence**.

<div class="cn-end-note"><span>Part I publication boundary</span><strong>Continue only through Chapter 4. Later book parts are intentionally not published here yet.</strong></div>
