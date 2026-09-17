---
title: 'Taller · Preparación de laboratorio'
description: 'Herramientas, evidencia y flujo de trabajo local para comenzar el curso.'
pagination: false
---

<p class="cn-book-part">Preparación antes del Capítulo 1</p>
<p class="cn-guiding-question">¿Cómo observar el estado real de una red y conservar evidencia reproducible antes de diagnosticarla?</p>
## Por qué importa este capítulo

Un experimento de redes puede fallar porque el protocolo está mal, porque el host está mal configurado, porque falta una herramienta, porque una ruta apunta a un lugar inesperado o porque se está observando la interfaz equivocada.

Antes de construir protocolos de transporte, routers, política BGP, overlays o servicios distribuidos, necesitamos una forma repetible de responder una pregunta más sencilla:

> **¿Qué cree actualmente este host Linux acerca de la red y qué evidencia respalda esa creencia?**

M00 establece el vocabulario de evidencia que utilizaremos durante todo el libro. El objetivo no es memorizar cada comando, sino aprender qué vista del sistema responde qué pregunta.

> **Deténgase y prediga.** `curl https://example.com/` falla. ¿Eso permite saber si el fallo está en DNS, enrutamiento, TCP, TLS, HTTP o el servicio remoto? No. `curl` es útil precisamente porque atraviesa muchas dependencias, pero por la misma razón no identifica por sí solo la causa raíz.

## 1. El host local ya es un sistema de red completo

Incluso antes de crear una topología de laboratorio, un host Linux contiene estado como:

```text
procesos
  ↓
sockets
  ↓
interfaces + direcciones
  ↓
rutas + estado de vecinos
  ↓
colas / firewall / políticas
  ↓
NIC + driver + enlace físico/virtual
```

También contiene configuración del resolver, cachés locales, namespaces e interfaces virtuales.

Una solicitud Web puede atravesar varias de estas estructuras antes de que una trama salga de la máquina.

Este es el primer hábito de sistemas del curso:

> **No trate “la red” como una caja negra cuando el host ya expone estado que puede inspeccionarse.**

## 2. Las interfaces definen dónde puede asociar el kernel estado de red

Una interfaz es un punto de conexión de red visible para el sistema operativo. Puede representar:

- loopback,
- Ethernet o Wi-Fi físico,
- un extremo de Ethernet virtual,
- un bridge,
- un túnel,
- un dispositivo VPN,
- una conexión de contenedor o máquina virtual.

Inspeccione con:

```bash
ip link
ip address
```

Formule cuatro preguntas:

1. ¿La interfaz existe y está operativa?
2. ¿Qué direcciones y prefijos tiene?
3. ¿Es la interfaz que realmente selecciona la ruta?
4. ¿Está en el namespace que usted supone?

Nombres como `eth0` son convenciones, no verdades universales. Inspeccione siempre la máquina real.

## 3. Loopback es un camino real de protocolos sin red física

La interfaz de loopback permite utilizar IP y transporte normalmente sin enviar paquetes a un medio externo.

Los experimentos con localhost son útiles porque conservan:

- semántica de sockets,
- estado de transporte,
- framing de aplicación,
- gran parte de los caminos de código del kernel,

mientras eliminan variables como Wi-Fi, switches, routers y enrutamiento de Internet.

Un experimento localhost exitoso demuestra menos que uno remoto, pero muchas veces demuestra exactamente la capa que necesitamos aislar primero.

## 4. Direcciones y prefijos describen identidad local y ámbito de enrutamiento

Una dirección como:

```text
192.0.2.20/24
```

contiene una dirección y una longitud de prefijo.

En M00 basta reconocer que la longitud del prefijo influye en qué destinos se consideran directamente conectados y cuáles requieren otra ruta o gateway.

Inspeccione con:

```bash
ip address
```

Capítulos posteriores formalizan subnetting y longest-prefix matching. Aquí el objetivo es aprender a leer el estado que ya mantiene el kernel.

## 5. El estado de rutas responde “¿hacia dónde iría este destino?”

Antes de transmitir un paquete IP, el kernel selecciona una ruta.

Comandos útiles:

```bash
ip route
ip route get 198.51.100.10
```

Una ruta puede identificar:

- prefijo de destino,
- siguiente salto,
- interfaz de salida,
- métrica o información de política.

`ip route get` es especialmente útil porque pregunta al kernel qué ruta utilizaría para un destino concreto.

Eso es evidencia más fuerte que mirar la tabla y adivinar.

## 6. La ruta por defecto es un fallback, no el destino final

Una línea como:

```text
default via 192.0.2.1 dev eth0
```

significa aproximadamente:

> “Para destinos que no coincidan con una ruta más específica, envíe hacia este siguiente salto mediante esta interfaz.”

El gateway suele ser el siguiente router, no el servidor remoto final.

M05 explicará por qué los prefijos más específicos ganan a la ruta por defecto. Por ahora distinga:

```text
destino IP final
≠
siguiente salto local
```

## 7. El estado de vecinos responde “¿cómo alcanzo ese siguiente salto en este enlace?”

Una ruta IP puede elegir un siguiente salto y una interfaz, pero la entrega tipo Ethernet todavía necesita una dirección de enlace.

Inspeccione:

```bash
ip neigh
```

Las entradas pueden aparecer como reachable, stale, incomplete, failed u otros estados del sistema.

La dependencia es:

```text
ruta IP utilizable
      +
resolución utilizable del siguiente salto
      ↓
se puede construir la trama de entrega local
```

M04 estudia ARP y Neighbor Discovery de IPv6 en detalle.

## 8. Los sockets conectan procesos de aplicación con estado de transporte

Los sockets son extremos de comunicación expuestos por el sistema operativo.

Vistas útiles:

```bash
ss -lntup
ss -tn
ss -un
```

Un socket TCP en escucha demuestra que el host local tiene un extremo esperando en una dirección/puerto dentro de su namespace y contexto de privilegios actuales.

No demuestra que:

- un cliente remoto tenga una ruta hasta él,
- un firewall permita el tráfico,
- TLS funcione,
- la aplicación responda correctamente.

Los puertos son extremos de transporte, no puertos físicos de switches.

## 9. Procesos, namespaces y privilegios cambian lo que puede verse y modificarse

Algunos detalles de sockets, operaciones de rutas, configuración de colas y capturas requieren privilegios elevados.

El curso no debe normalizar “ejecutar todo como root”.

Prefiera:

- privilegio mínimo,
- namespaces/contenedores desechables para cambios destructivos,
- teardown explícito,
- separación clara entre observar y modificar.

M12 utilizará namespaces como objetos de red de primera clase. En M00 basta recordar que dos procesos en el mismo host físico pueden ver redes diferentes.

## 10. Las herramientas DNS responden preguntas de nombres

`dig` expone evidencia orientada a DNS:

```bash
dig example.com
```

Inspeccione:

- nombre y tipo de consulta,
- registros de respuesta,
- TTL,
- código de respuesta,
- resolver/servidor utilizado.

Una respuesta DNS correcta demuestra algo sobre la resolución de nombres en ese punto de observación.

No demuestra que el servicio resultante sea alcanzable o esté sano.

Además, una aplicación puede utilizar bibliotecas de resolución, cachés locales, proxies o caminos de resolución distintos de una llamada directa a `dig`.

## 11. Las herramientas de aplicación son probes amplios extremo a extremo

`curl` es útil porque puede exponer varias etapas de una interacción HTTP(S):

```bash
curl -v https://example.com/
```

Según la solicitud y la compilación puede mostrar evidencia de:

- resolución de nombres,
- dirección elegida,
- conexión de transporte,
- negociación TLS,
- solicitud/respuesta HTTP.

Esa amplitud es fortaleza y limitación.

Cuando `curl` falla, pregunte qué dependencia anterior debe aislarse en lugar de tratar el mensaje final como causa raíz.

## 12. Una captura muestra tráfico en un punto de observación concreto

Herramientas comunes:

- `tcpdump`,
- TShark,
- Wireshark.

Por ejemplo:

```bash
tcpdump -ni any
```

Una captura es un registro temporal del tráfico visible **en ese punto de captura**.

No es un volcado de todo el sistema distribuido.

Un paquete puede existir en otro lugar sin aparecer allí, y offloads o encapsulación pueden hacer que el mismo intercambio lógico se vea distinto en interfaces diferentes.

## 13. Capture únicamente tráfico que esté autorizado a inspeccionar

Los experimentos del curso deben preferir:

- su propio host,
- loopback,
- namespaces/contenedores,
- PCAP suministrados,
- servicios controlados de laboratorio.

No capture tráfico de otros usuarios en redes compartidas.

Es una regla ética y también buen diseño experimental: el tráfico controlado es más fácil de interpretar.

## 14. Los timestamps son mediciones con supuestos

Los timestamps de paquetes son útiles para analizar latencia, pero dependen de:

- lugar de captura,
- fuente de reloj,
- resolución temporal,
- buffering de kernel/NIC,
- offloads,
- si el evento ocurrió antes o después del punto observado.

Que un número tenga seis decimales no significa que sea exacto a seis decimales.

M02 y M13 retomarán calidad y reproducibilidad de mediciones.

## 15. Los offloads pueden hacer que los paquetes visibles en el host difieran de los del medio físico

NICs y kernels modernos pueden realizar:

- checksum offload,
- segmentation offload,
- agregación de recepción,
- batching,
- otras aceleraciones.

Una captura dentro del host puede mostrar tamaños o estados de checksum diferentes de la representación final en el medio físico.

Eso no implica necesariamente un bug de Wireshark o de la NIC.

Es evidencia de que la captura ocurrió en una frontera concreta de la arquitectura.

## 16. Use una herramienta para responder una pregunta concreta

Un flujo útil es:

| Pregunta | Evidencia |
|---|---|
| ¿Qué interfaces/direcciones existen? | `ip address` |
| ¿Qué ruta elegiría el kernel? | `ip route get` |
| ¿Está resuelto el siguiente salto? | `ip neigh` |
| ¿Qué sockets escuchan o están conectados? | `ss` |
| ¿Qué devuelve DNS? | `dig` |
| ¿Qué hace la interacción de aplicación? | `curl -v` |
| ¿Qué paquetes son visibles aquí? | captura de paquetes |

El diagnóstico mejora cuando cada comando tiene un propósito definido **antes** de ejecutarse.


## 17. Investigación resuelta — explique una solicitud Web exitosa usando varias capas de evidencia

Suponga que:

```bash
curl https://example.com/
```

funciona.

Recoja evidencia como:

```bash
ip address
ip route
ip route get <resolved-IP>
ip neigh
ss -tn
dig example.com
curl -v https://example.com/
```

y, cuando esté autorizado, una captura estrecha.

Construya una secuencia:

```text
consulta de nombre / resolución cacheada
      ↓
dirección de destino seleccionada
      ↓
ruta local + siguiente salto
      ↓
conexión de transporte
      ↓
establecimiento TLS/seguridad
      ↓
solicitud/respuesta HTTP
```

Después etiquete cada observación por su fuente:

```text
evidencia de aplicación
estado del kernel
evidencia de paquetes
```

El ejercicio está completo cuando puede explicar no solo **qué ocurrió**, sino **qué observación respalda cada afirmación**.

## 18. Fallos frecuentes de entorno y razonamiento

### Falta un comando

Es un problema de entorno/herramientas hasta que la evidencia indique otra cosa. Use la alternativa documentada o el fixture determinista suministrado.

### No hay privilegio para capturar

La aplicación puede seguir funcionando. Use PCAP/datasets proporcionados o un namespace/contenedor controlado donde la captura esté permitida.

### No hay conectividad con GitHub

Git local y las pruebas transparentes locales siguen disponibles por diseño.

### Se asume un nombre fijo de interfaz

La máquina puede utilizar `enp...`, `wlp...`, interfaces virtuales o nombres propios del namespace. Inspeccione estado real.

### Se trata un host virtualizado como “red incorrecta”

VMs, contenedores, VPN y cloud añaden legítimamente interfaces, rutas, NAT y túneles. Forman parte del sistema.

### Se utiliza un solo comando como prueba de todo el camino

Un resultado correcto de `dig`, `ping` o `ss` posee un ámbito de autoridad específico. No permita que el éxito de una capa represente todas las demás.

## Resumen del capítulo

M00 establece la disciplina de evidencia del libro:

1. **El host ya expone estado de red inspeccionable.**
2. **Interfaces, direcciones, rutas, vecinos, sockets, DNS, herramientas de aplicación y capturas responden preguntas diferentes.**
3. **Una ruta por defecto es un fallback de siguiente salto, no el destino remoto final.**
4. **Las capturas son observaciones locales cuya interpretación depende del punto de captura y de los offloads.**
5. **Use privilegio mínimo y entornos controlados.**
6. **Git, pruebas y tareas siguen un modelo local-first.**
7. **Las pruebas transparentes son especificación ejecutable y las pruebas del estudiante conservan edge cases descubiertos.**
8. **Una investigación sólida declara qué pretende demostrar cada comando antes de ejecutarlo.**

Antes de continuar, elija una interacción de red exitosa de su máquina y explíquela usando al menos una evidencia de aplicación, una pieza de estado del kernel y una observación de paquetes o fixture suministrado.

## Conexiones de sistemas

### [OS]

Interfaces, rutas, vecinos, sockets, procesos, namespaces, permisos y hooks de captura son estado del sistema operativo.

### [ARCH]

NICs, drivers, DMA, interrupciones, colas, segmentación, checksums y offloads explican por qué la evidencia visible en host puede diferir de un modelo abstracto de paquetes.

### [DIST]

Incluso una solicitud Web sencilla atraviesa componentes de nombres, transporte, seguridad y servicio que pueden fallar de forma independiente.

### [SEC]

Privilegio mínimo, autorización de captura, tráfico cifrado y evidencia controlada por el endpoint establecen límites importantes de observación.

### [PERF]

Las afirmaciones posteriores de rendimiento dependen de timestamps correctos, descripción de carga, ubicación de captura, contadores y contexto del sistema.

## Autocomprobación

Sin volver a leer:

1. ¿Qué comando pregunta al kernel por la selección de ruta hacia un destino concreto?
2. Distinga estado de `ip route` y de `ip neigh`.
3. ¿Qué demuestra un socket en escucha y qué no demuestra?
4. ¿Por qué `curl` es útil pero demasiado amplio para diagnosticar una causa raíz por sí solo?
5. ¿Por qué toda captura debe registrar interfaz/punto de captura?
6. ¿Qué trabajo principal del curso sigue siendo posible sin acceso a GitHub?
7. ¿Dónde deben añadirse las pruebas transparentes propias del estudiante?
8. Dé una razón por la que una captura del host puede diferir de los paquetes del medio físico.
9. ¿Por qué una herramienta opcional ausente es un hecho del entorno y no automáticamente un fallo del protocolo?

Después complete el laboratorio workbench de M00 y conserve sus notas de línea base para el trabajo de diagnóstico en M13.

<div class="cn-practice-label">Práctica guiada</div>

## Práctica guiada

**Tiempo:** 8–10 minutos  
**Materiales:** una terminal Linux local; no requiere acceso a Internet

### Predicción

Antes de ejecutar comandos, escriba qué espera encontrar en un host normal:

1. Al menos una interfaz que no requiera una red física.
2. Una o más direcciones IP asociadas a interfaces.
3. Una decisión de encaminamiento para tráfico de loopback.
4. Cero o más sockets TCP en escucha.

Para cada elemento, indique qué objeto del sistema operativo debería aportar la evidencia: estado de interfaz, estado de direcciones, estado de rutas o estado de sockets.

### Ejemplo resuelto

Suponga que un host muestra una interfaz `lo` con `127.0.0.1/8`, una ruta para `127.0.0.0/8` mediante `lo` y un proceso escuchando en `127.0.0.1:8000`.

Una explicación útil no es “la red funciona”. Es más precisa:

- el kernel tiene una interfaz de loopback;
- la dirección pertenece a esa interfaz;
- la ruta mantiene el tráfico coincidente dentro del host;
- un proceso pidió al kernel aceptar conexiones TCP en el puerto 8000.

Cada afirmación depende de un tipo distinto de estado.

### Microexperimento guiado

Ejecute estos comandos locales y conserve solo las líneas necesarias:

```bash
ip -br link
ip -br addr
ip route get 127.0.0.1
ss -ltn
```

Responda:

1. ¿Qué interfaz transporta `127.0.0.1` en su host?
2. ¿La búsqueda de ruta hacia `127.0.0.1` necesita una puerta de enlace?
3. Elija un socket en escucha, si existe alguno. ¿Está asociado a loopback, a una dirección no-loopback concreta o a una dirección comodín?
4. ¿Qué comando puede demostrar que un proceso está escuchando? ¿Qué comandos no pueden demostrarlo?

No importa si los nombres de interfaces o la lista de sockets difieren entre máquinas. El objetivo es comprender el mecanismo, no memorizar una salida exacta.

### Evidencia que debe conservar

Conserve cuatro hechos breves: uno sobre interfaz, uno sobre dirección, uno sobre ruta y uno sobre socket. Para cada hecho anote el comando que lo sustenta y una afirmación que ese comando **no** puede demostrar. Debe poder explicar esos límites antes de pasar a la comprobación de conocimientos.

<div class="cn-practice-label">Comprobación de conocimientos</div>

## Comprobación de conocimientos

Responda antes de ejecutar el laboratorio.

1. ¿Qué comando usarías para inspeccionar las direcciones de la interfaz? ¿Selección de ruta local para un destino? ¿Estado vecino? ¿Estás escuchando sockets?
2. Explique la diferencia entre una ruta IP y una entrada vecina ARP/NDP.
3. ¿Por qué una captura de paquetes no puede indicarle cada estado dentro del proceso local o de un enrutador remoto?
4. ¿Qué información adicional proporciona `ss` que una captura de paquetes no puede proporcionarse directamente?
5. Si `curl` falla, ¿por qué "la red está cayendo" es un diagnóstico insuficiente?
6. ¿Qué observaciones útiles de red puede realizar aun cuando no exista acceso a Internet público?
7. ¿Por qué los comandos, sus salidas de texto y las capturas de paquetes suelen ser evidencia más reproducible que las capturas de pantalla?
8. ¿Por qué cada comando de diagnóstico debe elegirse para responder una pregunta concreta de evidencia en lugar de ejecutarse sin una hipótesis?
9. Indique una razón por la que las descargas de NIC/kernel pueden hacer que una captura del lado del host difiera de la representación final del cable.

Después de responder, registre el banco de trabajo actual con las herramientas locales disponibles en su sistema y siga un intercambio HTTP local de principio a fin. Si dispone de acceso a Internet, compárelo con una interacción DNS + HTTPS.

<div class="cn-practice-label cn-lab-label">Laboratorio obligatorio</div>

## Laboratorio obligatorio

Este módulo inicial es deliberadamente observacional. Presenta el flujo de trabajo local primero y establece una instantánea de referencia a la que los estudiantes pueden regresar durante módulos posteriores de solución de problemas.

### 1. Verifique el medio ambiente

Registre qué herramientas de red opcionales están presentes en su sistema. No instale herramientas adicionales salvo que las necesite para una observación concreta.

### 2. Predecir antes de inspeccionar

Antes de ejecutar cada comando, escriba lo que espera que revele:

```bash
ip address
ip route
ss -lntup
```

Para cada uno, identifique si la información pertenece principalmente a la aplicación, socket/OS, red o vista de enlace. Después prediga qué cambiará en `ss` cuando inicie un servicio HTTP local en el paso siguiente.

### 3. Siga un intercambio de aplicaciones

El recorrido obligatorio funciona sin acceso a Internet. En una terminal, inicie un servicio HTTP limitado a loopback:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

En otra terminal, inspeccione el socket en escucha y realice una solicitud:

```bash
ss -lntp
curl -I http://127.0.0.1:8000/
```

Capture el intercambio de loopback con Wireshark/TShark o `tcpdump` cuando los permisos lo permitan. Si no puede capturar paquetes, conserve como evidencia obligatoria la salida de `ss` y las cabeceras de la respuesta HTTP.

Cuando exista conectividad a Internet y un resolver configurado, añada esta comparación opcional:

```bash
dig example.com
curl -I https://example.com/
```

Compare la evidencia DNS/HTTPS con el intercambio local, pero no trate la conectividad con `example.com` como requisito de corrección.

Su evidencia obligatoria debe identificar al menos:

- una interfaz local y su dirección IP,
- la interfaz de loopback,
- la ruta por defecto si existe,
- un socket TCP en escucha,
- un intercambio HTTP/TCP local,
- puertos de transporte local y del peer.

Si realizó la comparación conectada opcional, identifique además una consulta/respuesta DNS y el extremo de transporte remoto.


### 4. Explicar

Cree una breve nota técnica que contenga comandos y evidencia de texto en lugar de capturas de pantalla. Responda:

1. ¿Qué información proporciona el kernel que no proporciona una captura de paquetes?
2. ¿Qué valores cambiaron entre el tráfico local y la comparación DNS/HTTPS, si realizó la extensión opcional?
3. ¿Qué podría aprender aun si GitHub no estuviera disponible durante todo el semestre?
4. ¿A qué herramienta recurriría primero si un nombre de host se resolviera pero fallara la conexión TCP?

No existe una suite automatizada de aprobado/reprobado para esta práctica de laboratorio: el objetivo es la observación correcta, la evidencia reproducible y su interpretación.

<div class="cn-end-note"><span>Siguiente material disponible</span><strong><a href="../chapter-1/">Capítulo 1 · Arquitectura de Internet →</a></strong></div>
