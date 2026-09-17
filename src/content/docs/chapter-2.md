---
title: 'Chapter 2 · Physical Layer: Signals and Media'
description: 'Connect bits, symbols, physical media, noise, rate, and receiver decisions.'
pagination: false
---

<p class="cn-course-kicker">Part I · Chapter 2</p>
<p class="cn-guiding-question">How does a computer turn bits into physical signals that another machine can recover reliably?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-5">
    <div class="cn-network-node"><span>Information</span><strong>Bits</strong><small>data to communicate</small></div>
    <div class="cn-network-node"><span>Transmitter</span><strong>PHY</strong><small>encode · modulate</small></div>
    <div class="cn-network-node"><span>Medium</span><strong>Signal</strong><small>copper · fiber · radio</small></div>
    <div class="cn-network-node"><span>Receiver</span><strong>PHY</strong><small>sample · decide</small></div>
    <div class="cn-network-node"><span>Information</span><strong>Recovered bits</strong><small>errors if decisions fail</small></div>
  </div>
  <figcaption><strong>Figure —</strong> A useful model separates the boundaries where information changes representation or waits for a resource.</figcaption>
</figure>

## Why this chapter matters

Networking diagrams often begin with a clean arrow labeled `1 Gb/s`, `Wi-Fi`, or `fiber`. That arrow hides the first problem every network must solve: **information inside one computer must become a physical phenomenon that another computer can distinguish from noise**.

From Computer Architecture you already know that digital systems are built from physical devices. Networking extends that idea across distance.

```text
bits in memory
    ↓
NIC / PHY
    ↓
symbols and waveform
    ↓
copper / fiber / radio
    ↓
waveform at receiver
    ↓
recovered symbols
    ↓
recovered bits
```

This chapter is intentionally not an electrical-engineering course. The goal is to learn enough physical-layer reasoning to understand why links have finite rates, why distance creates delay, why media behave differently, why errors occur, and what later link-layer protocols are actually carrying.

> **Pause and predict.** A 100 Gb/s fiber link replaces a 1 Gb/s fiber link between the same two cities. Does the first bit propagate between the cities 100 times faster? If not, what actually improved?

## 1. A bit is an abstraction; a signal is physical

A bit is a logical value, `0` or `1`. A cable or radio channel does not transport abstract integers. It transports changing physical quantities such as:

- voltage or current on copper,
- electromagnetic energy in optical fiber,
- radio-frequency electromagnetic waves through space.

The transmitter chooses a set of physical states that the receiver can distinguish. The receiver observes an imperfect version of those states and maps them back to information.

That distinction explains an important boundary:

```text
software thinks in bits and packets
PHY hardware thinks in symbols, timing, energy, and channel conditions
```

Higher layers can often ignore the exact waveform because the physical layer provides a bit-oriented service upward. But the abstraction leaks whenever rate, distance, noise, interference, synchronization, or hardware errors matter.

## 2. Bits are mapped to symbols, and symbols are represented by waveforms

A **symbol** is one signaling choice made during a signaling interval.

The simplest teaching model uses two levels:

```text
bit 0 → low level
bit 1 → high level
```

A sequence:

```text
1 0 1 1 0
```

might therefore become a waveform that alternates between two levels.

Real links use richer encoding and modulation schemes because the physical channel has constraints. A symbol can encode more than one bit. For example, four distinguishable symbol states can represent two bits per symbol:

```text
00 → symbol A
01 → symbol B
10 → symbol C
11 → symbol D
```

This gives us a crucial vocabulary:

> **bit rate** counts information bits per second; **symbol rate** counts physical signaling decisions per second.

They are related, but they are not the same quantity.

## 3. Encoding and modulation make information compatible with the channel

**Line coding** describes how digital information is represented as a sequence of channel symbols. **Modulation** changes properties of a carrier or waveform—such as amplitude, phase, or frequency—to represent symbols.

You do not need to memorize a catalog of schemes in this course. Instead ask what problem a scheme is solving.

A useful encoding may need to support:

- reliable distinction between symbol states,
- enough transitions for clock recovery,
- limited low-frequency/DC content,
- efficient use of channel spectrum,
- error-detection or synchronization structure.

For example, a naïve constant level for a long run of identical bits can make timing recovery harder because the receiver sees no transitions. Manchester-style coding creates regular transitions, but uses more signal changes and therefore consumes channel resources differently.

The design principle is broader than any one code:

> **Physical representation is an engineering trade-off between recoverability, bandwidth use, energy, complexity, and robustness.**

## 4. The receiver must know when to sample

Even if two voltage levels are perfectly distinguishable, the receiver still needs to know **when one symbol ends and the next begins**.

Transmitter and receiver clocks are never mathematically identical. Real hardware therefore uses synchronization and clock-recovery mechanisms so sampling stays aligned with the incoming signal.

Conceptually:

```text
continuous waveform
      ↓ choose sampling instants
sampled symbol values
      ↓ decision thresholds / demodulation
symbol sequence
      ↓ decoding
bit sequence
```

Poor timing can turn a clean signal into wrong symbols because the receiver samples during a transition instead of near the stable center of a symbol.

This is one reason transitions and coding structure matter even when the data itself is digital.

## 5. Bit rate, symbol rate, and spectral bandwidth are different quantities

Networking casually uses the word **bandwidth** to mean a data rate such as `1 Gb/s`. At the physical layer, bandwidth also has a more literal frequency-domain meaning measured in hertz.

Keep these ideas separate:

```text
bit rate       → information bits per second
symbol rate    → signaling decisions per second
channel/spectral bandwidth → usable frequency range, in Hz
```

If each symbol carries `k` bits in a simplified ideal model:

```text
bit_rate = symbol_rate × k
```

or:

```text
symbol_rate = bit_rate / k
```

More bits per symbol can increase information rate without increasing symbol rate, but the receiver must distinguish more symbol states. Those states become harder to separate when noise and distortion are significant.

So there is no free capacity from simply declaring “use more levels.”

## 6. Real channels attenuate, distort, and accumulate noise

A transmitted waveform does not arrive unchanged.

### Attenuation

Signal energy decreases as it travels. Repeaters, amplifiers, optical equipment, antenna design, and link budgets exist partly because received energy must remain distinguishable.

### Noise

Unwanted physical energy is added by electronics, thermal effects, neighboring systems, and the environment.

### Interference

Other transmitters can occupy overlapping resources, especially on shared radio media.

### Distortion

Different frequency components can be affected differently, changing waveform shape and timing.

A useful high-level measure is signal-to-noise ratio:

```text
SNR = signal_power / noise_power
SNR_dB = 10 log10(SNR)
```

Higher SNR usually gives the receiver more room to distinguish symbol states. Lower SNR means decisions become less certain unless rate, coding, power, or modulation changes.

> **Pause and predict.** Why might a Wi-Fi link reduce its modulation/coding rate as a device moves farther from an access point even though the protocol is still “Wi-Fi”?

## 7. Channel capacity is finite

A physical channel cannot carry an arbitrary number of reliable bits per second.

Two ideas explain why.

For an idealized noiseless bandwidth-limited channel, Nyquist-style reasoning relates symbol rate, channel bandwidth, and the number of distinguishable signal levels.

For a noisy channel, Shannon showed that an upper bound on reliable information rate depends on both bandwidth and SNR:

```text
C = B log2(1 + SNR)
```

where:

- `C` is capacity in bits/s,
- `B` is channel bandwidth in Hz,
- `SNR` is a linear power ratio.

You are not expected to design a modem from this equation. The conceptual lesson is more important:

> **Capacity comes from physical resources and channel quality. Better coding can approach the limit; it cannot make the limit disappear.**

This is the physical foundation underneath later claims about nominal link rates.

## 8. Copper, fiber, and radio fail differently

### Copper

Twisted-pair copper carries electrical signaling. It is inexpensive and common for short wired links, but attenuation, crosstalk, electromagnetic interference, cable quality, and distance constrain performance.

### Optical fiber

Fiber carries light through a guided medium. It supports very high capacity and long distances with low attenuation compared with many electrical media. Optical equipment still has finite power, dispersion, connector loss, transceiver limits, and propagation delay.

### Radio

Radio supports mobility and communication without a physical cable, but the medium is shared and variable. Obstacles, reflections, fading, interference, transmitter power, antenna placement, regulatory spectrum allocation, and competing users all matter.

The important comparison is not “which medium is best?” It is:

> **Which physical constraints dominate this environment and workload?**

A datacenter rack, a transoceanic link, a phone in a crowded classroom, and a satellite connection make very different trade-offs.

## 9. Duplex and sharing change how capacity is experienced

A link can be:

- simplex: information primarily moves one direction,
- half-duplex: both directions are possible but not simultaneously on the same resource,
- full-duplex: both directions can operate simultaneously using separate resources or signaling techniques.

Likewise, a physical resource may be dedicated or shared.

Modern switched Ethernet links are normally full-duplex point-to-point connections. Wi-Fi uses a shared radio medium where stations coordinate access and experience interference/competition.

This distinction becomes central in the next link-layer chapter because **the physical medium determines what kind of medium-access problem exists**.

## 10. Serialization and propagation come from different physical causes

Suppose a 1500-byte frame crosses a 1 Gb/s link.

Its serialization time is:

```text
1500 × 8 / 1,000,000,000 = 12 μs
```

That answers:

> How long does the transmitter need to place all frame bits onto the link?

Now suppose the link is 2,000 km of fiber and propagation is roughly `2 × 10^8 m/s`:

```text
2,000,000 / 200,000,000 = 0.010 s = 10 ms
```

That answers:

> How long does a bit already launched into the medium need to travel?

These mechanisms are independent enough that upgrading the link rate can reduce serialization from microseconds to smaller microseconds while the 10 ms physical travel time remains nearly unchanged.

Chapter 3 builds the complete performance model from this distinction.

## 11. PHY and MAC are different parts of a network interface

Real NIC designs often distinguish physical-layer and link-layer responsibilities.

Conceptually:

```text
OS / driver
   ↓
NIC queues + DMA
   ↓
MAC logic
   ↓
PHY / transceiver
   ↓
physical medium
```

The exact implementation varies, but the boundary is useful:

- the **PHY** handles physical signaling, symbol recovery, negotiation and medium-specific mechanisms;
- the **MAC/link layer** handles frames, link-layer addressing and medium-access behavior.

The OS normally does not expose individual analog symbol decisions. It exposes a network interface, link status, negotiated parameters, counters, and packets/frames after hardware has already performed substantial physical processing.

This is similar to Computer Architecture: software uses an abstraction while hardware implements timing-sensitive physical behavior below it.

## 12. Worked example — one advertised rate, several different limits

Imagine a laptop reports a nominal wireless PHY rate of `600 Mb/s`.

Should a file transfer deliver 600 Mb/s of application data?

Not necessarily.

The path can lose capacity to:

```text
PHY coding/modulation overhead
+ medium-access coordination
+ retransmissions after errors/interference
+ link/network/transport headers
+ competing stations
+ congestion control
+ CPU/storage/application limits
```

So three different numbers may all be correct:

```text
PHY signaling rate     600 Mb/s
measured network throughput  perhaps much lower
application goodput          lower again depending on workload
```

A good systems explanation states **which layer each number belongs to** before comparing them.

## 13. Observe the physical boundary without pretending software can see everything

Depending on hardware and permissions, Linux may expose useful interface information through tools such as:

```bash
ip link
ethtool <interface>
iw dev            # Wi-Fi systems, when available
```

Possible evidence includes:

- link up/down state,
- negotiated Ethernet speed/duplex,
- Wi-Fi association and signal information,
- hardware counters,
- interface errors.

But remember the authority boundary:

> A software-reported link rate or signal-strength estimate is useful evidence; it is not a complete oscilloscope view of the channel.

The course will continue using observable state while being explicit about what remains below the observation point.

## 14. Common physical-layer misconceptions

### “A faster link makes signals travel faster”

A higher bit rate reduces serialization time. Propagation speed is mainly determined by the physical medium and distance.

### “Bandwidth always means bits per second”

At higher layers it is common shorthand for capacity/rate. At the physical layer, spectral bandwidth in hertz is a distinct quantity.

### “One symbol always carries one bit”

Many modulation schemes encode several bits per symbol.

### “Digital communication means the medium is digital”

The logical information is digital; its physical representation is a continuous physical waveform.

### “If the PHY says 1 Gb/s, applications get 1 Gb/s”

Protocol overhead, sharing, errors, congestion, and endpoint limits reduce useful application goodput.

### “Fiber has no delay because it is fast”

Fiber supports high bit rates, but light still takes time to propagate over geographic distance.

## Chapter summary

The physical layer turns information into a recoverable physical process:

1. **Bits are logical; signals are physical.**
2. **Symbols are signaling choices that can encode one or more bits.**
3. **Encoding and modulation adapt information to channel constraints.**
4. **Timing and clock recovery are necessary because receivers must know when to sample.**
5. **Bit rate, symbol rate, and spectral bandwidth are different quantities.**
6. **Attenuation, noise, interference, and distortion make symbol recovery imperfect.**
7. **Nyquist/Shannon reasoning explains why reliable channel capacity is finite.**
8. **Copper, fiber, and radio expose different physical trade-offs.**
9. **Serialization depends on packet size and bit rate; propagation depends on distance and propagation speed.**
10. **PHY behavior sits below the frame-oriented MAC/link layer and below most OS-visible packet interfaces.**

Before continuing, explain why upgrading a transoceanic link from 10 Gb/s to 100 Gb/s can dramatically improve bulk-transfer capacity while changing the speed-of-light component of RTT almost not at all.

## Systems connections

### [ARCH]

The PHY is where digital logic meets a physical channel. NIC transceivers, clocks, serializers/deserializers, DMA, PCIe, memory movement, and hardware queues determine how quickly packets can move between software-visible buffers and a real medium.

### [OS]

The OS usually exposes an interface and link state rather than raw analog waveforms. Drivers configure hardware, report negotiated rates, maintain queues, and surface counters while much symbol-level work happens below the socket API.

### [PERF]

Propagation speed, bit rate, coding overhead, errors, and medium sharing create lower bounds that later chapters turn into serialization delay, RTT, goodput, and queueing behavior.

### [SEC]

Physical access, radio reception, jamming, electromagnetic leakage, and rogue transceivers show that confidentiality and availability cannot be reasoned about only at the application layer.

### [DIST]

No distributed algorithm can make information travel faster than the underlying channel. Geographic distance and physical failures eventually become timeouts and partial failures at higher layers.

## Self-check

Without looking back:

1. Distinguish a bit, a symbol, and a physical signal.
2. Why can four symbol states carry two bits per symbol?
3. Why does the receiver need timing/clock recovery?
4. Distinguish bit rate, symbol rate, and spectral bandwidth.
5. What does SNR tell you qualitatively?
6. Why can increasing modulation order become harder at low SNR?
7. Compare one important limitation of copper, fiber, and radio.
8. A 1500-byte frame crosses a 100 Mb/s link. Compute its serialization time.
9. Why does a faster link rate not necessarily reduce long-distance propagation delay?
10. What evidence about the PHY can an OS usually expose, and what remains hidden below that interface?

Then complete the Physical Layer laboratory before moving to Network Performance.

<div class="cn-practice-label">Guided practice</div>

**Time:** 10–12 minutes  
**Materials:** paper, calculator, or a text editor; no Internet access required

## Prediction

Take the bit sequence:

```text
1 0 1 1 0 0 1 0
```

Use this simple teaching encoding: bit `1 → +1 V`, bit `0 → -1 V`, one sample per bit interval. Predict the ideal sample sequence. Then predict what a receiver using a `0 V` decision threshold will do if small noise changes the sample values but does not cross the threshold.

## Worked example

The ideal encoded samples are:

```text
+1  -1  +1  +1  -1  -1  +1  -1
```

Now suppose the channel produces:

```text
+0.7  -0.6  +1.2  +0.3  -1.1  -0.4  +0.8  -0.9
```

With a `0 V` threshold, positive samples decode as `1` and negative samples as `0`, so all eight bits are recovered correctly despite the noise.

If the fourth sample were pushed from `+0.3 V` to `-0.1 V`, the receiver would make a bit error. Noise matters because the receiver observes a physical signal, not abstract bits.

## Guided micro-experiment

First decode these samples with the same `0 V` threshold:

```text
+0.9  -0.2  +0.1  -0.1  -0.8  +0.6  +0.4  -0.7
```

Write the recovered eight-bit sequence and mark which samples are closest to the decision boundary.

Next compare symbol rate and bit rate. Suppose a modulation scheme has four distinguishable symbols and maps two bits to each symbol:

```text
00 → S0
01 → S1
10 → S2
11 → S3
```

Encode `10110010` into symbols. How many symbols are transmitted? If the symbol rate is `1 Mbaud`, what is the raw bit rate in this idealized mapping?

Finally compare two delay terms for a 1500-byte frame sent over a `10 Mb/s` link spanning `200 km`, using propagation speed `2 × 10^8 m/s`:

```text
serialization = frame_bits / link_rate
propagation = distance / propagation_speed
```

Calculate both and state which one changes if the link rate becomes `100 Mb/s` while distance and medium remain the same.

## Evidence to keep

Keep the noisy-sample decoding, the bit-to-symbol mapping, and the two delay calculations. Under them, write one sentence explaining the chain `bits → symbols → physical signal → noisy observation → decoded bits`. This is the physical mechanism the later Ethernet and IP chapters will treat as a link.

<div class="cn-practice-label">Knowledge check</div>

1. A 10 Gb/s link replaces a 1 Gb/s link over the same fiber path. Which term changes directly: serialization delay, propagation delay, both equally, or neither?
2. A signaling scheme has four reliably distinguishable symbol states. How many bits can one ideal symbol encode?
3. Explain why a long run with no signal transitions can make clock recovery difficult in a simple line code.
4. Distinguish **bit rate**, **symbol rate**, and **spectral bandwidth**. Include units for each.
5. A 1500-byte frame is transmitted at 100 Mb/s. Compute its serialization delay.
6. A 1000 km path has propagation speed `2 × 10^8 m/s`. Compute one-way propagation delay.
7. Why can a higher-order modulation scheme become unreliable when SNR decreases?
8. Give one important physical limitation of copper, fiber, and radio.
9. Why can a Wi-Fi PHY rate be much higher than measured application goodput?
10. Which evidence can `ethtool` or Wi-Fi interface tools expose, and what physical behavior remains below ordinary OS visibility?

<div class="cn-practice-label cn-lab-label">Required laboratory</div>

## Required laboratory — From bits to signals

This laboratory turns the physical-layer distinctions into a small deterministic model without requiring a particular programming language or framework.

### Predict

Before calculating or implementing anything, answer:

1. Does changing a link from 100 Mb/s to 1 Gb/s change propagation speed in the same cable?
2. If one symbol represents two bits, what happens to the symbol rate required for the same bit rate?
3. What happens when noise moves a received sample across the receiver decision threshold?
4. Why can a reported PHY rate exceed useful application goodput?

### Build a small model

Using code, a spreadsheet, or another reproducible local tool, model these operations with explicit units:

- serialization delay from packet size and bit rate;
- propagation delay from distance and propagation speed;
- symbol rate from bit rate and bits per symbol;
- SNR expressed in decibels;
- a two-level NRZ encoder and threshold decoder;
- a simple Manchester-style teaching encoding.

Record enough input/output examples that another student can reproduce your calculations.

### Compare serialization and propagation

Calculate both terms for a 1500-byte frame on a 1 Gb/s link over a 2000 km path using `2 × 10^8 m/s` as propagation speed. Then recompute only serialization at 100 Gb/s. Explain why capacity changes dramatically while the geographic lower bound barely changes.

### Observe one interface

When supported on your system, inspect one real interface with tools such as `ip link`, `ethtool <interface>`, or `iw dev`. Separate what the operating system reports from physical waveform details that normal host tools cannot directly reveal.

### Decode a noisy teaching signal

Encode `1 0 1 1 0 0 1` with your two-level model. Perturb one received level until it crosses the decision threshold, decode again, and identify exactly which bit changes.

Finish by explaining the path from **bit → symbol → waveform → medium → receiver decision → recovered bit**, including why noise and synchronization matter.

<div class="cn-end-note"><span>Part I publication boundary</span><strong>Continue only through Chapter 4. Later book parts are intentionally not published here yet.</strong></div>
