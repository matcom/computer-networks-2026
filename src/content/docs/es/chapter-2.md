---
title: 'Capítulo 2 · Capa Física: Señales y Medios'
description: 'Conecte bits, símbolos, medios físicos, ruido, tasa y decisiones del receptor.'
pagination: false
---

<p class="cn-course-kicker">Parte I · Capítulo 2</p>
<p class="cn-guiding-question">¿Cómo convierte una computadora bits en señales físicas que otra máquina puede recuperar de forma confiable?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-5">
    <div class="cn-network-node"><span>Información</span><strong>Bits</strong><small>datos a comunicar</small></div>
    <div class="cn-network-node"><span>Transmisor</span><strong>PHY</strong><small>codificar · modular</small></div>
    <div class="cn-network-node"><span>Medio</span><strong>Señal</strong><small>cobre · fibra · radio</small></div>
    <div class="cn-network-node"><span>Receptor</span><strong>PHY</strong><small>muestrear · decidir</small></div>
    <div class="cn-network-node"><span>Información</span><strong>Bits recuperados</strong><small>errores si falla la decisión</small></div>
  </div>
  <figcaption><strong>Figura —</strong> Un modelo útil separa las fronteras donde la información cambia de representación o espera por un recurso.</figcaption>
</figure>

## Por qué importa este capítulo

Los diagramas de redes suelen comenzar con una flecha limpia etiquetada `1 Gb/s`, `Wi-Fi` o `fibra`. Esa flecha oculta el primer problema que toda red debe resolver: **la información dentro de una computadora debe convertirse en un fenómeno físico que otra computadora pueda distinguir del ruido**.

Desde Arquitectura de Computadoras ya conoce una idea esencial: los sistemas digitales están construidos con dispositivos físicos. Networking extiende esa idea a través de la distancia.

```text
bits en memoria
    ↓
NIC / PHY
    ↓
símbolos y forma de onda
    ↓
cobre / fibra / radio
    ↓
forma de onda en el receptor
    ↓
símbolos recuperados
    ↓
bits recuperados
```

Este capítulo no pretende convertirse en un curso de ingeniería eléctrica. El objetivo es adquirir suficiente razonamiento de capa física para entender por qué los enlaces tienen tasas finitas, por qué la distancia crea retardo, por qué los medios se comportan de forma diferente, por qué aparecen errores y qué transportan realmente los protocolos de enlace.

> **Deténgase y prediga.** Un enlace de fibra de 100 Gb/s sustituye a uno de 1 Gb/s entre las mismas dos ciudades. ¿El primer bit viaja 100 veces más rápido entre las ciudades? Si no, ¿qué fue lo que realmente mejoró?

## 1. Un bit es una abstracción; una señal es física

Un bit es un valor lógico, `0` o `1`. Un cable o un canal de radio no transporta enteros abstractos. Transporta magnitudes físicas variables como:

- voltaje o corriente en cobre,
- energía electromagnética en fibra óptica,
- ondas electromagnéticas de radio a través del espacio.

El transmisor selecciona estados físicos que el receptor pueda distinguir. El receptor observa una versión imperfecta de esos estados y la transforma nuevamente en información.

```text
software → bits y paquetes
PHY      → símbolos, tiempo, energía y condiciones del canal
```

Las capas superiores suelen ignorar la forma exacta de la onda porque la capa física presenta una abstracción de bits hacia arriba. Esa abstracción deja de ser suficiente cuando importan tasa, distancia, ruido, interferencia, sincronización o errores de hardware.

## 2. Los bits se mapean a símbolos y los símbolos a formas de onda

Un **símbolo** es una elección de señal durante un intervalo.

El modelo más simple utiliza dos niveles:

```text
bit 0 → nivel bajo
bit 1 → nivel alto
```

Por tanto:

```text
1 0 1 1 0
```

puede convertirse en una forma de onda que cambia entre dos niveles.

Los enlaces reales utilizan esquemas más ricos. Un símbolo puede representar más de un bit. Cuatro estados distinguibles pueden codificar dos bits por símbolo:

```text
00 → símbolo A
01 → símbolo B
10 → símbolo C
11 → símbolo D
```

Esto introduce dos magnitudes que deben mantenerse separadas:

> **tasa de bits** = bits de información por segundo; **tasa de símbolos** = decisiones físicas de señalización por segundo.

## 3. Codificación y modulación adaptan la información al canal

La **codificación de línea** define cómo la información digital se representa mediante símbolos. La **modulación** modifica propiedades de una forma de onda o portadora —por ejemplo amplitud, fase o frecuencia— para representar símbolos.

No necesita memorizar un catálogo de esquemas. Pregunte qué problema resuelve cada uno.

Una representación útil puede necesitar:

- estados fáciles de distinguir,
- suficientes transiciones para recuperar reloj,
- poco contenido DC o de muy baja frecuencia,
- uso eficiente del espectro,
- estructura que facilite sincronización o detección de errores.

Por ejemplo, una secuencia larga a un nivel constante puede dificultar la recuperación temporal porque el receptor observa pocas transiciones. Un código estilo Manchester fuerza transiciones regulares, pero utiliza el recurso físico de otra manera.

La idea general es:

> **Representar información físicamente es un compromiso entre recuperabilidad, uso de ancho de banda, energía, complejidad y robustez.**

## 4. El receptor debe saber cuándo muestrear

Aunque dos niveles sean fáciles de distinguir, el receptor debe saber **cuándo termina un símbolo y comienza el siguiente**.

Los relojes del transmisor y receptor nunca son idénticos de forma perfecta. El hardware utiliza sincronización y recuperación de reloj para alinear el muestreo.

```text
forma de onda continua
      ↓ instantes de muestreo
muestras
      ↓ umbral / demodulación
símbolos
      ↓ decodificación
bits
```

Un muestreo mal alineado puede convertir una señal limpia en símbolos incorrectos si ocurre durante una transición en lugar de cerca del centro estable del símbolo.

## 5. Tasa de bits, tasa de símbolos y ancho de banda espectral son magnitudes diferentes

En networking se usa con frecuencia **bandwidth** como sinónimo de capacidad en `bit/s`. En la capa física también existe un significado espectral, medido en hertz.

Mantenga separados:

```text
tasa de bits       → bit/s
tasa de símbolos   → símbolos/s o baud
ancho de banda espectral → Hz
```

Si cada símbolo representa `k` bits en un modelo ideal:

```text
bit_rate = symbol_rate × k
symbol_rate = bit_rate / k
```

Aumentar los bits por símbolo puede incrementar la información transmitida sin aumentar la tasa de símbolos, pero obliga al receptor a distinguir más estados. Con ruido y distorsión, esa distinción se vuelve más difícil.

No existe capacidad gratuita simplemente por declarar “usemos más niveles”.

## 6. Los canales reales atenúan, distorsionan y acumulan ruido

Una forma de onda transmitida no llega intacta.

### Atenuación

La energía de la señal disminuye durante el camino. Repetidores, amplificadores, óptica, antenas y presupuestos de enlace existen porque la energía recibida debe seguir siendo distinguible.

### Ruido

Energía física no deseada se suma a la señal por efectos térmicos, electrónica, otros sistemas y el ambiente.

### Interferencia

Otros transmisores pueden competir por recursos superpuestos, especialmente en radio.

### Distorsión

Diferentes componentes de frecuencia pueden sufrir efectos distintos y alterar la forma temporal de la señal.

Una medida útil es la relación señal-ruido:

```text
SNR = signal_power / noise_power
SNR_dB = 10 log10(SNR)
```

Un SNR mayor suele facilitar la separación entre estados de símbolo. Un SNR menor puede obligar a reducir tasa, cambiar modulación/codificación, aumentar potencia o aceptar más errores.

> **Deténgase y prediga.** ¿Por qué un enlace Wi-Fi puede reducir su modulación o tasa de codificación cuando un dispositivo se aleja del punto de acceso aunque siga utilizando el mismo estándar Wi-Fi?

## 7. La capacidad del canal es finita

Un canal físico no puede transportar una cantidad arbitraria de bits confiables por segundo.

Para un canal ideal sin ruido, el razonamiento de Nyquist relaciona ancho de banda, tasa de símbolos y número de niveles distinguibles.

Para un canal con ruido, Shannon mostró un límite superior de capacidad dependiente del ancho de banda y SNR:

```text
C = B log2(1 + SNR)
```

Aquí:

- `C` es capacidad en bit/s,
- `B` es ancho de banda del canal en Hz,
- `SNR` es una relación lineal de potencias.

No necesita diseñar un módem con esta ecuación. La lección conceptual es:

> **La capacidad proviene de recursos físicos y calidad del canal. Una codificación mejor puede acercarse al límite; no puede hacer que desaparezca.**

## 8. Cobre, fibra y radio fallan de formas diferentes

### Cobre

El par trenzado transporta señalización eléctrica. Es económico y común en enlaces cableados cortos, pero atenuación, crosstalk, interferencia electromagnética, calidad del cable y distancia limitan el rendimiento.

### Fibra óptica

La fibra transporta luz por un medio guiado. Permite gran capacidad y largas distancias con baja atenuación comparada con muchos medios eléctricos. Aun así existen pérdidas ópticas, dispersión, conectores, transceptores y retardo de propagación.

### Radio

La radio permite movilidad y elimina el cable físico, pero utiliza un medio compartido y variable. Obstáculos, reflexiones, fading, interferencia, potencia, antenas, regulación del espectro y usuarios competidores importan.

La pregunta correcta no es “¿qué medio es mejor?”, sino:

> **¿Qué restricciones físicas dominan en este entorno y esta carga?**

## 9. Duplex y uso compartido cambian cómo se experimenta la capacidad

Un enlace puede ser:

- simplex,
- half-duplex,
- full-duplex.

También puede utilizar un recurso dedicado o compartido.

Ethernet conmutado moderno suele utilizar enlaces punto a punto full-duplex. Wi-Fi usa un medio de radio compartido donde estaciones coordinan acceso y sufren interferencia y competencia.

Esta distinción será importante en la capa de enlace porque **el medio físico determina qué problema de acceso al medio existe**.

## 10. Serialización y propagación tienen causas físicas diferentes

Para una trama de 1500 bytes a 1 Gb/s:

```text
1500 × 8 / 1,000,000,000 = 12 μs
```

Eso responde:

> ¿Cuánto tarda el transmisor en colocar todos los bits de la trama en el enlace?

Para 2000 km de fibra con propagación aproximada `2 × 10^8 m/s`:

```text
2,000,000 / 200,000,000 = 0.010 s = 10 ms
```

Eso responde:

> ¿Cuánto tarda un bit ya emitido en recorrer el medio?

Aumentar la tasa del enlace reduce la serialización, pero apenas modifica esos 10 ms de viaje físico.

El Capítulo 3 construirá el modelo completo de rendimiento a partir de esta distinción.

## 11. PHY y MAC son partes diferentes de una interfaz de red

Un modelo conceptual de NIC es:

```text
OS / driver
   ↓
colas NIC + DMA
   ↓
lógica MAC
   ↓
PHY / transceptor
   ↓
medio físico
```

La implementación exacta varía, pero la frontera es útil:

- la **PHY** se ocupa de señalización física, recuperación de símbolos, negociación y mecanismos específicos del medio;
- la **MAC/capa de enlace** se ocupa de tramas, direccionamiento local y comportamiento de acceso al medio.

El OS normalmente no expone decisiones analógicas símbolo a símbolo. Expone interfaz, estado de enlace, parámetros negociados, contadores y paquetes después de que el hardware ya realizó mucho procesamiento físico.

## 12. Ejemplo resuelto — una tasa anunciada, varios límites diferentes

Suponga que una laptop informa una tasa PHY Wi-Fi nominal de `600 Mb/s`.

¿Debe una transferencia entregar 600 Mb/s de datos de aplicación?

No necesariamente.

La capacidad útil puede perderse en:

```text
overhead PHY
+ coordinación de acceso al medio
+ retransmisiones por error/interferencia
+ cabeceras de enlace/red/transporte
+ estaciones competidoras
+ control de congestión
+ límites de CPU/almacenamiento/aplicación
```

Por tanto pueden coexistir correctamente:

```text
tasa PHY                 600 Mb/s
throughput de red         bastante menor
goodput de aplicación     menor de nuevo
```

Una buena explicación de sistemas identifica primero **a qué capa pertenece cada número**.

## 13. Observe la frontera física sin fingir que software puede verlo todo

Según hardware y permisos, Linux puede exponer información útil mediante:

```bash
ip link
ethtool <interfaz>
iw dev
```

Puede observar:

- estado up/down,
- velocidad/duplex negociados en Ethernet,
- asociación y señal Wi-Fi,
- contadores de hardware,
- errores de interfaz.

Pero recuerde el límite de autoridad:

> Una tasa reportada o una estimación de señal es evidencia útil; no es una vista completa de osciloscopio del canal.

## 14. Errores frecuentes sobre la capa física

### “Un enlace más rápido hace que la señal viaje más rápido”

Una tasa mayor reduce serialización. La propagación depende principalmente del medio y la distancia.

### “Bandwidth siempre significa bits por segundo”

En capas superiores suele usarse así; en la capa física, ancho de banda espectral en hertz es otra magnitud.

### “Un símbolo siempre transporta un bit”

Muchos esquemas representan varios bits por símbolo.

### “Comunicación digital significa que el medio es digital”

La información lógica es digital; su representación física es una forma de onda continua.

### “Si PHY dice 1 Gb/s, la aplicación obtiene 1 Gb/s”

Overhead, uso compartido, errores, congestión y límites de extremos reducen el goodput.

### “La fibra no tiene retardo porque es rápida”

La fibra admite tasas muy altas, pero la luz sigue tardando en recorrer distancia geográfica.

## Resumen del capítulo

La capa física convierte información en un proceso físico recuperable:

1. **Los bits son lógicos; las señales son físicas.**
2. **Los símbolos son decisiones de señalización que pueden representar uno o más bits.**
3. **Codificación y modulación adaptan la información a restricciones del canal.**
4. **Sincronización y recuperación de reloj determinan cuándo debe muestrear el receptor.**
5. **Tasa de bits, tasa de símbolos y ancho de banda espectral son magnitudes distintas.**
6. **Atenuación, ruido, interferencia y distorsión dificultan recuperar símbolos.**
7. **Nyquist y Shannon explican por qué la capacidad confiable es finita.**
8. **Cobre, fibra y radio tienen compromisos físicos diferentes.**
9. **Serialización depende de tamaño y tasa; propagación depende de distancia y velocidad del medio.**
10. **PHY opera por debajo de MAC y de la mayoría de las interfaces de paquetes visibles por el OS.**

Antes de continuar, explique por qué pasar un enlace transoceánico de 10 Gb/s a 100 Gb/s puede mejorar muchísimo una transferencia masiva sin reducir de forma significativa el componente de RTT impuesto por la distancia.

## Conexiones de sistemas

### [ARCH]

La PHY conecta lógica digital y canal físico. Transceptores, SerDes, relojes, DMA, PCIe, memoria y colas de hardware influyen en el rendimiento.

### [OS]

El OS expone interfaces, estado y contadores en lugar de formas de onda analógicas. Mucho trabajo físico ocurre por debajo de sockets y drivers.

### [PERF]

Propagación, tasa, overhead, errores y uso compartido crean límites que reaparecen como serialización, RTT y goodput.

### [SEC]

Acceso físico, radio, jamming y emisiones muestran que seguridad y disponibilidad también tienen una capa física.

### [DIST]

Ningún algoritmo distribuido elimina distancia o fallos físicos; estos se transforman en latencia y fallos parciales.

## Autocomprobación

Sin volver a leer:

1. Distinga bit, símbolo y señal física.
2. ¿Por qué cuatro estados pueden representar dos bits por símbolo?
3. ¿Por qué necesita el receptor recuperar reloj?
4. Distinga tasa de bits, tasa de símbolos y ancho de banda espectral.
5. ¿Qué indica SNR cualitativamente?
6. ¿Por qué aumentar el orden de modulación puede ser difícil con SNR bajo?
7. Compare una limitación importante de cobre, fibra y radio.
8. Calcule la serialización de 1500 bytes a 100 Mb/s.
9. ¿Por qué aumentar la tasa no elimina propagación de larga distancia?
10. ¿Qué evidencia PHY puede exponer normalmente el OS y qué queda por debajo?

Después complete el laboratorio de Capa Física antes de continuar con Rendimiento de red.

<div class="cn-practice-label">Práctica guiada</div>

**Tiempo:** 10–12 minutos  
**Materiales:** papel, calculadora o un editor de texto; no requiere acceso a Internet

## Predicción

Tome la secuencia de bits:

```text
1 0 1 1 0 0 1 0
```

Use esta codificación docente simple: bit `1 → +1 V`, bit `0 → -1 V`, una muestra por intervalo de bit. Prediga la secuencia ideal de muestras. Después prediga qué hará un receptor con umbral de decisión `0 V` si un ruido pequeño altera las muestras sin cruzar ese umbral.

## Ejemplo resuelto

Las muestras ideales son:

```text
+1  -1  +1  +1  -1  -1  +1  -1
```

Suponga ahora que el canal produce:

```text
+0.7  -0.6  +1.2  +0.3  -1.1  -0.4  +0.8  -0.9
```

Con umbral `0 V`, las muestras positivas se decodifican como `1` y las negativas como `0`, por lo que se recuperan correctamente los ocho bits pese al ruido.

Si la cuarta muestra pasara de `+0.3 V` a `-0.1 V`, el receptor cometería un error de bit. El ruido importa porque el receptor observa una señal física, no bits abstractos.

## Microexperimento guiado

Decodifique primero estas muestras con el mismo umbral de `0 V`:

```text
+0.9  -0.2  +0.1  -0.1  -0.8  +0.6  +0.4  -0.7
```

Escriba la secuencia de ocho bits recuperada y marque qué muestras están más cerca del límite de decisión.

Compare después tasa de símbolos y tasa de bits. Suponga una modulación con cuatro símbolos distinguibles que asigna dos bits a cada símbolo:

```text
00 → S0
01 → S1
10 → S2
11 → S3
```

Codifique `10110010` como símbolos. ¿Cuántos símbolos se transmiten? Si la tasa de símbolos es `1 Mbaud`, ¿cuál es la tasa bruta de bits en este mapeo idealizado?

Finalmente compare dos retardos para una trama de 1500 bytes transmitida sobre un enlace de `10 Mb/s` de `200 km`, usando velocidad de propagación `2 × 10^8 m/s`:

```text
serialización = bits_de_trama / tasa_del_enlace
propagación = distancia / velocidad_de_propagación
```

Calcule ambos y diga cuál cambia si la tasa del enlace pasa a `100 Mb/s` mientras la distancia y el medio permanecen iguales.

## Evidencia que debe conservar

Conserve la decodificación de muestras ruidosas, el mapeo bits→símbolos y los dos cálculos de retardo. Debajo escriba una frase que explique la cadena `bits → símbolos → señal física → observación con ruido → bits decodificados`. Ese es el mecanismo físico que los capítulos posteriores de Ethernet e IP tratarán como un enlace.

<div class="cn-practice-label">Comprobación de conocimientos</div>

1. Un enlace de 10 Gb/s sustituye a uno de 1 Gb/s sobre la misma fibra. ¿Qué término cambia directamente: serialización, propagación, ambos por igual o ninguno?
2. Un esquema tiene cuatro estados de símbolo distinguibles. ¿Cuántos bits puede representar idealmente cada símbolo?
3. Explique por qué una larga secuencia sin transiciones puede dificultar la recuperación de reloj en una codificación sencilla.
4. Distinga **tasa de bits**, **tasa de símbolos** y **ancho de banda espectral**, incluyendo las unidades.
5. Una trama de 1500 bytes se transmite a 100 Mb/s. Calcule su retardo de serialización.
6. Un camino de 1000 km tiene velocidad de propagación `2 × 10^8 m/s`. Calcule el retardo de propagación de ida.
7. ¿Por qué una modulación de orden superior puede dejar de ser confiable cuando disminuye SNR?
8. Indique una limitación física importante del cobre, la fibra y la radio.
9. ¿Por qué una tasa PHY de Wi-Fi puede ser mucho mayor que el goodput de aplicación?
10. ¿Qué evidencia pueden mostrar `ethtool` o las herramientas Wi-Fi y qué detalles físicos quedan fuera de la visibilidad normal del OS?

<div class="cn-practice-label cn-lab-label">Laboratorio obligatorio</div>

## Laboratorio obligatorio — De bits a señales

Este laboratorio convierte las distinciones de la capa física en un pequeño modelo determinista sin exigir un lenguaje o framework particular.

### Predecir

Antes de calcular o implementar, responda:

1. ¿Cambiar un enlace de 100 Mb/s a 1 Gb/s modifica la velocidad de propagación en el mismo cable?
2. Si un símbolo representa dos bits, ¿qué ocurre con la tasa de símbolos necesaria para la misma tasa de bits?
3. ¿Qué ocurre cuando el ruido desplaza una muestra recibida al otro lado del umbral de decisión?
4. ¿Por qué una tasa PHY anunciada puede superar el goodput útil de una aplicación?

### Construir un modelo pequeño

Use código, una hoja de cálculo u otra herramienta local reproducible para modelar, con unidades explícitas:

- retardo de serialización a partir del tamaño del paquete y la tasa de bits;
- retardo de propagación a partir de distancia y velocidad de propagación;
- tasa de símbolos a partir de tasa de bits y bits por símbolo;
- SNR expresada en decibelios;
- un codificador NRZ de dos niveles y un decodificador por umbral;
- una codificación didáctica simple de estilo Manchester.

Registre suficientes ejemplos de entrada y salida para que otro estudiante pueda reproducir los cálculos.

### Comparar serialización y propagación

Calcule ambos términos para una trama de 1500 bytes, un enlace de 1 Gb/s y un trayecto de 2000 km usando `2 × 10^8 m/s` como velocidad de propagación. Después recalcule solo la serialización a 100 Gb/s. Explique por qué la capacidad cambia drásticamente mientras el límite geográfico apenas cambia.

### Observar una interfaz

Cuando su sistema lo permita, inspeccione una interfaz real con herramientas como `ip link`, `ethtool <interfaz>` o `iw dev`. Separe lo que informa el sistema operativo de los detalles de la forma de onda física que las herramientas normales del host no pueden observar directamente.

### Decodificar una señal didáctica con ruido

Codifique `1 0 1 1 0 0 1` con su modelo de dos niveles. Perturbe un nivel recibido hasta cruzar el umbral, decodifique de nuevo e identifique exactamente qué bit cambia.

Termine explicando el recorrido **bit → símbolo → forma de onda → medio → decisión del receptor → bit recuperado**, incluyendo por qué importan el ruido y la sincronización.

<div class="cn-end-note"><span>Límite de publicación de la Parte I</span><strong>Continúe únicamente hasta el Capítulo 4. Las partes posteriores del libro todavía no se publican aquí.</strong></div>
