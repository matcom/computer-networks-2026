---
title: 'Capítulo 4 · Ethernet y Redes Locales'
description: 'Razone sobre tramas Ethernet, aprendizaje MAC, flooding, reenvío y estado ARP.'
pagination: false
---

<p class="cn-course-kicker">Parte I · Capítulo 4</p>
<p class="cn-guiding-question">¿Cómo entrega un host un paquete a otra máquina en la misma red local?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-4">
    <div class="cn-network-node"><span>Puerto 1</span><strong>Host A envía</strong><small>origen A · destino B</small></div>
    <div class="cn-network-node"><span>Switch</span><strong>Aprende el origen</strong><small>A → puerto 1</small></div>
    <div class="cn-network-node"><span>B desconocido</span><strong>Flooding</strong><small>todos menos el puerto de entrada</small></div>
    <div class="cn-network-node"><span>Receptores</span><strong>B acepta · C ignora</strong><small>la tabla mejora para la próxima trama</small></div>
  </div>
  <figcaption><strong>Figura —</strong> Un modelo útil separa las fronteras donde la información cambia de representación o espera por un recurso.</figcaption>
</figure>

## Por qué importa este capítulo

IP puede decidir que un paquete debe salir por una interfaz y un siguiente salto determinados, pero esa decisión todavía debe convertirse en **entrega local sobre un enlace real**.

En una LAN tipo Ethernet cooperan dos clases de estado distintas:

- el **host** mantiene información de vecinos, por ejemplo asociaciones de IP a dirección de enlace,
- el **conmutador (switch)** mantiene información de reenvío, por ejemplo asociaciones de MAC a puerto.

Confundir ambas tablas es una forma muy rápida de perderse al diagnosticar una LAN.

> **Deténgase y prediga.** Su laptop quiere enviar un paquete IP a un servidor en otro continente. ¿Qué MAC utiliza normalmente la primera trama Ethernet como destino: la del servidor remoto, la puerta de enlace local o ambas?

## 1. La entrega Ethernet es local al dominio de enlace

Una trama Ethernet contiene MAC de origen, MAC de destino y una carga útil, como un paquete IPv4 o IPv6.

La trama tiene significado en el dominio Ethernet actual. Cuando un router reenvía el paquete IP encapsulado hacia otro enlace Ethernet, construye una **nueva trama** apropiada para ese siguiente salto.

Por tanto:

```text
trama Ethernet: entrega del salto local
paquete IP:      destino de capa de red a través de saltos
```

Esta diferencia es la base para comprender switches, ARP, cachés de vecinos y límites de enrutamiento.

## 2. Unicast, broadcast y unicast desconocido son casos diferentes

Una trama unicast identifica una MAC de destino concreta.

Ethernet broadcast utiliza:

```text
ff:ff:ff:ff:ff:ff
```

Un switch simple inunda las tramas broadcast dentro del dominio, sujeto a controles de la red real.

Un **unicast desconocido** es diferente: posee una MAC de destino concreta, pero el switch todavía no ha aprendido qué puerto llega hasta esa dirección. Un switch con aprendizaje también inunda este caso porque no dispone de mejor información.

Ambos pueden producir flooding, pero por razones distintas:

```text
broadcast          → dirigido intencionalmente a todos
unicast desconocido → un destino, ubicación aún no aprendida
```

## 3. Un switch con aprendizaje construye conocimiento de topología a partir de las direcciones de origen

Supongamos puertos `p1`, `p2` y `p3`.

Para cada trama recibida, un algoritmo simple es:

```text
1. aprender source_MAC → ingress_port
2. inspeccionar MAC de destino
3. ¿broadcast?              inundar otros puertos
4. ¿destino desconocido?    inundar otros puertos
5. ¿destino en ingress?     filtrar
6. en otro caso             reenviar al puerto aprendido
```

¿Por qué aprender desde el **origen**?

Porque recibir una trama por `p2` es evidencia directa de que la dirección de origen es alcanzable a través de `p2`. La dirección de destino solo indica dónde *quería* llegar el emisor, no dónde reside realmente ese destino.

> **Deténgase y prediga.** Un switch vacío recibe `A → B` por `p1`. ¿Qué puede aprender inmediatamente? ¿Qué puede inferir acerca de B?

Puede aprender `A → p1`. Todavía no conoce el puerto de B, por lo que inunda la trama.

## 4. Ejemplo resuelto — la tabla se vuelve más informativa con cada trama

Comience con una tabla vacía.

### Trama 1: `A → B` entra por `p1`

Aprender:

```text
A → p1
```

B es desconocido, por tanto la trama sale por `p2` y `p3`.

### Trama 2: `B → A` entra por `p2`

Aprender:

```text
A → p1
B → p2
```

A ya es conocido, por tanto únicamente `p1` recibe la trama.

### Trama 3: `C → A` entra por `p3`

Aprender:

```text
A → p1
B → p2
C → p3
```

A es conocido y la trama sale solamente por `p1`.

El switch ha construido estado útil de reenvío **sin protocolo explícito de registro de hosts**. El tráfico ordinario le proporcionó suficiente evidencia para reducir el flooding.

## 5. El estado aprendido debe cambiar cuando cambia la red

Suponga que A se desconecta de `p1` y más tarde transmite desde `p3`.

El siguiente evento de aprendizaje debe actualizar:

```text
A → p3
```

Los switches reales también eliminan entradas antiguas porque los hosts se mueven, los enlaces cambian y una observación vieja deja de ser confiable.

El laboratorio omite envejecimiento dependiente del reloj para mantener un comportamiento determinista. La idea conceptual permanece: **el estado de reenvío en caché tiene una vida útil y puede quedar obsoleto**.

## 6. ARP resuelve un problema distinto del aprendizaje del switch

Un host ya ha elegido una dirección IPv4 de siguiente salto, pero necesita una MAC de destino para transmitir por Ethernet.

Si no existe la asociación en caché, ARP puede preguntar en el enlace local:

```text
Destino Ethernet: ff:ff:ff:ff:ff:ff
ARP: Who has 192.0.2.10? Tell 192.0.2.20
```

El propietario puede responder y el solicitante aprende:

```text
192.0.2.10 → 02:00:00:00:00:10
```

Observe las dos cachés independientes:

```text
caché de vecinos del host:  IP siguiente salto → MAC
reenvío del switch:         MAC → puerto
```

La primera ayuda al host a construir una trama. La segunda ayuda al switch a decidir por dónde reenviarla.

## 7. Los campos ARP y Ethernet no deben reducirse a “origen” y “destino”

Un mensaje ARP viaja **dentro** de una trama Ethernet. Durante el análisis distinga:

- MAC Ethernet de origen,
- MAC Ethernet de destino,
- dirección hardware del emisor ARP,
- dirección de protocolo del emisor ARP,
- dirección hardware del objetivo ARP,
- dirección de protocolo del objetivo ARP.

Esta precisión parece excesiva hasta que aparece tráfico malformado, obsoleto o falsificado. Nombrar los campos correctamente evita conclusiones incorrectas.

## 8. El siguiente salto no tiene por qué ser el destino IP final

Supongamos:

```text
host:    192.0.2.20/24
gateway: 192.0.2.1
server:  198.51.100.50
```

El servidor no pertenece al `/24` local, por lo que la decisión de ruta selecciona la puerta de enlace como siguiente salto.

El host resuelve:

```text
192.0.2.1 → MAC del gateway
```

no la MAC del servidor remoto.

La primera trama contiene conceptualmente:

```text
Destino Ethernet = MAC del gateway
Destino IP       = 198.51.100.50
```

La trama Ethernet termina en el router. El router extrae el paquete IP, realiza otra decisión de reenvío y lo encapsula en una nueva trama para el enlace siguiente.

> **Regla de razonamiento:** primero elija el siguiente salto IP; después pregunte cómo alcanzar ese siguiente salto en el enlace local.

## 9. Las cachés de vecinos mejoran eficiencia pero introducen estado obsoleto

Resolver cada siguiente salto para cada paquete sería costoso, por lo que los hosts mantienen información de vecinos en caché.

Ese estado introduce problemas habituales de sistemas:

- expiración,
- movilidad,
- observaciones en conflicto,
- asociaciones obsoletas,
- confianza.

En Linux:

```bash
ip neigh
```

muestra estado de vecinos y, con frecuencia, su estado de alcanzabilidad.

Es otro patrón de sistemas distribuidos: la caché hace rápido el camino común, pero la corrección depende de frescura e invalidación.

## 10. IPv6 utiliza Neighbor Discovery en lugar de ARP

IPv6 no utiliza ARP. Neighbor Discovery se apoya en ICMPv6 e incluye resolución de vecinos, descubrimiento de routers y funciones relacionadas con alcanzabilidad.

El concepto transferible importa más que memorizar un formato concreto:

```text
decisión de reenvío IP
        ↓
siguiente salto seleccionado
        ↓
resolución / alcanzabilidad en enlace local
        ↓
transmisión de trama
```

IPv4/ARP e IPv6/NDP implementan este patrón de forma diferente.

## 11. Los bucles convierten el flooding de mecanismo útil en modo de fallo

El aprendizaje presupone que una trama inundada llegará al destino sin circular indefinidamente.

Con enlaces Ethernet redundantes, una topología ingenua de capa 2 puede crear bucles. Tramas broadcast y unicast desconocidas pueden duplicarse y circular repetidamente, consumiendo capacidad y desestabilizando la red.

Ethernet de producción necesita una estrategia como:

- protocolos de control/prevención de bucles,
- topologías deliberadamente libres de bucles,
- arquitecturas que desplazan el multipath a otra capa.

Por eso “añadir otro cable para tener redundancia” no es automáticamente seguro en capa 2.

## 12. Las VLAN crean dominios lógicos de enlace separados

Un switch físico puede soportar varios dominios Ethernet lógicos mediante VLAN.

Esto significa que el aprendizaje MAC no es una tabla global única para todas las tramas del dispositivo. El estado de reenvío suele estar asociado a la VLAN o contexto correspondiente.

Las VLAN ayudan a aislar dominios broadcast y grupos administrativos, pero no eliminan la necesidad de enrutamiento entre ellos.

## 13. Observe el mecanismo en un host real

### Estado de interfaces

```bash
ip link
```

### Estado de vecinos

```bash
ip neigh
```

### Evidencia de paquetes

Capture un intercambio ARP cuando esté permitido y pregunte:

1. ¿el destino Ethernet de la solicitud es broadcast?
2. ¿qué host afirma poseer la IP objetivo?
3. ¿la respuesta es broadcast o unicast?
4. ¿cambia `ip neigh` después del intercambio?

El objetivo es correlacionar **evidencia en el enlace** con **estado del host**, no solamente reconocer nombres de protocolos.

## 14. Los límites de fallo se vuelven claros al separar ambas tablas

### Asociación de vecino incorrecta u obsoleta

El host posee una ruta IP plausible, pero construye tramas para la MAC equivocada.

### Entrada del switch incorrecta u obsoleta

La trama está bien direccionada, pero el switch la envía hacia un puerto incorrecto hasta que reaprende o expira la entrada.

### Falla la resolución ARP/NDP

El host sabe qué IP de siguiente salto desea, pero no logra establecer entrega local utilizable.

### Bucle de capa 2 o tormenta de broadcast

El tráfico repetido/inundado consume capacidad compartida y puede saturar dispositivos.

Desde la aplicación estos síntomas pueden parecer similares, pero la evidencia y la corrección son diferentes.

## 15. El estado de control local posee un modelo de confianza

ARP clásico no autentica criptográficamente una afirmación de asociación. Una red no puede asumir que toda asociación recibida es legítima solo porque su formato sea válido.

Las redes operativas pueden utilizar segmentación, inspección, estado estático, controles en switches o cifrado en capas superiores según su modelo de amenazas.

La idea arquitectónica es:

> **Todo mecanismo de control que acepte estado remoto necesita un modelo de confianza explícito.**

## Resumen del capítulo

Mantenga separadas estas dos clases de estado:

1. **El host asocia direcciones del siguiente salto con direcciones de enlace.**
2. **El switch asocia direcciones de enlace observadas con puertos.**
3. **El switch aprende del origen porque el puerto de entrada aporta evidencia de alcanzabilidad.**
4. **Broadcast y unicast desconocido pueden inundarse, pero por motivos diferentes.**
5. **Un destino IP remoto normalmente no implica una MAC remota en el primer salto.**
6. **Los routers sustituyen la encapsulación de enlace al cruzar de un enlace a otro.**
7. **El estado en caché puede quedar obsoleto y los caminos redundantes de capa 2 pueden crear bucles.**
8. **Los protocolos de control local dependen de supuestos de confianza.**

Antes de continuar, explique exactamente qué cambia y qué permanece lógicamente estable cuando un paquete IP atraviesa un router entre dos LAN Ethernet.

## Conexiones de sistemas

### [OS]

El kernel del host mantiene interfaces y vecinos y decide cuándo necesita resolución local.

### [ARCH]

NICs y switches pueden filtrar y reenviar en hardware, mientras drivers y DMA conectan las tramas con la memoria del host.

### [DIST]

Las cachés de vecinos y reenvío son estado distribuido que puede quedar obsoleto cuando cambia la movilidad o la topología.

### [SEC]

ARP/NDP y otros mecanismos de control local necesitan supuestos explícitos de confianza y diseño defensivo.

### [PERF]

El aprendizaje reduce flooding innecesario; los bucles y dominios broadcast excesivos consumen capacidad compartida.

## Autocomprobación

Sin volver a leer:

1. ¿Por qué un switch con aprendizaje actualiza su tabla desde la MAC de origen?
2. ¿Qué hace un switch nuevo con unicast desconocido y por qué?
3. Distinga caché de vecinos del host y tabla de reenvío del switch.
4. ¿Por qué un host normalmente resuelve la MAC de su gateway y no la de un servidor remoto?
5. ¿Qué cabeceras/direcciones se sustituyen cuando un router reenvía un paquete IP hacia otro enlace Ethernet?
6. Explique una forma en que el estado de enlace en caché puede quedar obsoleto.

Después complete el laboratorio obligatorio de switch/ARP que aparece más abajo y correlacione el modelo determinista con `ip neigh` o una captura local.

<div class="cn-practice-label">Práctica guiada</div>

**Tiempo:** 10–12 minutos  
**Materiales:** papel o un editor de texto; no requiere acceso a Internet

## Predicción

Un switch de aprendizaje tiene tres puertos. El host A está en el puerto 1, B en el puerto 2 y C en el puerto 3. La tabla del switch comienza vacía.

Prediga qué hace el switch con la primera trama `A → C`: ¿la descarta, la inunda o la envía por un único puerto conocido? Escriba también qué dirección aprende a partir de esa trama.

## Ejemplo resuelto

Un switch de aprendizaje aprende a partir de la dirección MAC **origen** de cada trama recibida. Usa la dirección MAC **destino** para decidir por dónde enviarla.

Para la primera trama `A → C`:

```text
recibe por puerto 1
aprende A → puerto 1
el destino C es desconocido
inunda por puertos 2 y 3
```

Si C responde `C → A`, el switch aprende `C → puerto 3` y puede enviar esa respuesta únicamente por el puerto 1.

## Microexperimento guiado

Comenzando con una tabla vacía, procese manualmente esta secuencia:

```text
1. A → C llega por puerto 1
2. C → A llega por puerto 3
3. B → C llega por puerto 2
4. A → B llega por puerto 1
```

Después de cada trama, anote:

- la tabla aprendida;
- si la trama se inunda o se reenvía por un único puerto;
- el puerto o los puertos de salida.

Mantenga ahora la misma topología y considere esta solicitud ARP de A:

```text
destino Ethernet: ff:ff:ff:ff:ff:ff
pregunta ARP: ¿Quién tiene 10.0.0.1? Responda a 10.0.0.10.
```

Responda:

1. ¿Por qué el switch inunda esta trama aunque su tabla de aprendizaje ya contenga la MAC de la puerta de enlace?
2. ¿Qué aprende A de una respuesta ARP que el propio switch **no** aprende?
3. ¿Qué tabla relaciona direcciones MAC con puertos del switch y qué caché relaciona próximos saltos IP con direcciones de enlace?

## Evidencia que debe conservar

Conserve la traza de cuatro pasos de la tabla del switch y una comparación de dos columnas tituladas `aprendizaje del switch` y `resolución ARP/vecinos`. Debe poder explicar por qué ambos mecanismos cooperan sin resolver el mismo problema.

<div class="cn-practice-label">Comprobación de conocimientos</div>

Responda antes de ejecutar la práctica de cambio/ARP.

1. Un conmutador nuevo de tres puertos recibe `A → B` en p1. ¿Qué aprende y dónde transmite la trama?
2. Posteriormente recibe `B → A` en p2. Prediga la decisión reenvío y la tabla aprendida completa.
3. ¿Qué sucede si el switch ha aprendido el destino A en el mismo puerto de entrada al que llega una trama para A?
4. Explique la diferencia entre transmisión una Ethernet y una unidifusión desconocida.
5. ¿Por qué una solicitud ARP suele utilizar la transmisión Ethernet?
6. Su destino IP es remoto y su ruta utiliza la puerta de enlace `192.0.2.1`. ¿Qué dirección IP resuelve su host en MAC antes de enviar la primera trama?
7. ¿Quién es el propietario de la caché ARP y quién es el propietario de la tabla de aprendizaje de puertos MAC→?
8. Un host se mueve del puerto del conmutador p1 al p3. ¿Qué propiedad de la trama observada permite que el conmutador vuelva a aprender su ubicación?
9. ¿Por qué una ruta IP válida aún no puede entregar tráfico cuando falla la resolución del vecino?

Después de responder, compare cada predicción con la secuencia determinista de tramas del laboratorio que aparece más abajo.

<div class="cn-practice-label cn-lab-label">Laboratorio obligatorio</div>

## Laboratorio obligatorio — Aprender, inundar y resolver

Una LAN conmutada contiene dos tipos distintos de estado aprendido: los switches aprenden asociaciones **MAC → puerto**, mientras los hosts aprenden asociaciones **IP → MAC** mediante ARP o mecanismos análogos de descubrimiento de vecinos.

### Predecir

1. ¿Qué hace un switch nuevo ante un destino unicast desconocido?
2. ¿Aprende el switch de la dirección de origen, de la de destino o de ambas?
3. ¿Qué debe ocurrir cuando el destino conocido está en el mismo puerto por el que llegó la trama?
4. ¿Por qué una solicitud ARP normalmente usa el destino broadcast de Ethernet?
5. ¿Quién mantiene una caché ARP: el switch o el host?

### Use esta topología determinista

```text
puerto 1 ─ Host A ─ MAC 02:00:00:00:00:0a ─ IP 10.0.0.10
puerto 2 ─ Host B ─ MAC 02:00:00:00:00:0b ─ IP 10.0.0.11
puerto 3 ─ Host C ─ MAC 02:00:00:00:00:0c ─ IP 10.0.0.12
```

Comenzando con una tabla vacía, siga estas tramas en orden: `A→B`, `B→A`, `C→A` y `A→C`. Después de cada trama registre la tabla MAC aprendida y qué puertos de salida reciben la trama.

### Construir o simular las reglas

Use código, una tabla, tarjetas sobre papel u otro método reproducible para demostrar:

- aprendizaje de la MAC de origen;
- reenvío unicast conocido;
- flooding de unicast desconocido y broadcast;
- filtrado cuando el destino está en el mismo puerto;
- una caché ARP mínima del host, separada del estado de reenvío del switch.

### Observar evidencia local

En una interfaz real/local inspeccione `ip link` e `ip neigh`. Si dispone de captura de paquetes autorizada, observe una solicitud/respuesta ARP e identifique por separado las direcciones Ethernet de origen/destino y las direcciones de protocolo sender/target dentro de ARP.

Termine con dos explicaciones: una secuencia donde cambia la tabla del switch pero no la caché ARP del host y otra donde cambia el estado ARP sin cambiar la topología física del switch.

<div class="cn-end-note"><span>Límite de publicación de la Parte I</span><strong>Continúe únicamente hasta el Capítulo 4. Las partes posteriores del libro todavía no se publican aquí.</strong></div>
