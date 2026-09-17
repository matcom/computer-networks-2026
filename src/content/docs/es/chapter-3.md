---
title: 'Capítulo 3 · Rendimiento de Redes'
description: 'Separe propagación, serialización, colas, throughput, RTT y producto ancho de banda-retardo.'
pagination: false
---

<p class="cn-course-kicker">Parte I · Capítulo 3</p>
<p class="cn-guiding-question">¿Por qué el ancho de banda por sí solo no predice el rendimiento de una aplicación?</p>
<figure class="cn-network-figure">
  <div class="cn-network-path cn-path-4">
    <div class="cn-network-node"><span>Host</span><strong>Procesamiento</strong><small>inspeccionar · preparar</small></div>
    <div class="cn-network-node"><span>Recurso compartido</span><strong>Cola</strong><small>esperar detrás del tráfico</small></div>
    <div class="cn-network-node"><span>Enlace</span><strong>Serialización</strong><small>L / R</small></div>
    <div class="cn-network-node"><span>Distancia</span><strong>Propagación</strong><small>d / s</small></div>
  </div>
  <figcaption><strong>Figura —</strong> Un modelo útil separa las fronteras donde la información cambia de representación o espera por un recurso.</figcaption>
</figure>

## Por qué importa este capítulo

Llamar *rápida* a una red oculta preguntas diferentes. ¿Entrega pronto el primer byte? ¿Puede mantener una transferencia grande? ¿Sigue respondiendo mientras existe otro tráfico? ¿Su comportamiento es estable o solamente bueno en promedio?

Un enlace de alta capacidad puede tener latencia elevada. Un camino de baja latencia puede ofrecer poco throughput. Una red ociosa puede parecer excelente y volverse casi inutilizable cuando se llenan las colas.

Este capítulo introduce un conjunto pequeño de magnitudes que permite sustituir impresiones vagas por predicciones explícitas.

> **Deténgase y prediga.** Un enlace de 1 Gb/s sustituye a uno de 100 Mb/s entre dos ciudades. ¿Qué componentes del retardo mejoran necesariamente? ¿Cuáles pueden permanecer casi iguales?

## 1. Empiece por las unidades o el modelo ya estará equivocado

Muchos errores de rendimiento ocurren antes de empezar a razonar sobre redes: se mezclan bits con bytes, milisegundos con segundos o unidades decimales de red con unidades binarias de almacenamiento.

Mantenga visibles las conversiones básicas:

```text
1 byte = 8 bits
1 ms = 0.001 s
1 μs = 0.000001 s
1 Mbit/s = 1,000,000 bit/s
1 Gbit/s = 1,000,000,000 bit/s
```

Un buen hábito es normalizar a **bits, segundos y bits por segundo** antes de sustituir valores en una fórmula.

## 2. Cuatro mecanismos explican gran parte del retardo de un camino

Para un paquete en un salto, una descomposición útil es:

```text
procesamiento + cola + serialización + propagación
```

Cada término tiene una causa diferente. Separarlos permite preguntar qué cambio de ingeniería puede realmente mejorar el comportamiento.

### Retardo de procesamiento

Un host o router debe inspeccionar suficiente información para decidir qué hacer. Esto puede incluir analizar cabeceras, realizar búsquedas de reenvío, comprobar políticas, ejecutar software, mover datos, planificar trabajo e interactuar con hardware.

En un camino simple reenviado por hardware puede ser pequeño. En sistemas virtualizados, cifrados, sobrecargados o con mucho procesamiento en software puede resultar importante.

### Retardo de cola

Puede haber paquetes esperando por el mismo recurso de salida.

Si existen 12,500 bytes delante de nosotros en una salida de 1 Mb/s:

```text
12,500 × 8 / 1,000,000 = 0.1 s = 100 ms
```

La cola se diferencia de los otros términos porque depende fuertemente del **estado actual del tráfico**. Dos paquetes consecutivos pueden experimentar retardos de cola muy distintos.

### Retardo de serialización

Un transmisor con tasa finita necesita tiempo para colocar todos los bits de un paquete en el enlace:

```text
D_serialización = L_bits / R_bps
```

Para un paquete de 1500 bytes:

```text
a 1 Mb/s:   12,000 / 1,000,000     = 12 ms
a 1 Gb/s:   12,000 / 1,000,000,000 = 12 μs
```

Aumentar la tasa de bits reduce directamente este término.

### Retardo de propagación

Después de entrar en el medio, un bit todavía necesita tiempo para recorrerlo:

```text
D_prop = distancia / velocidad_de_propagación
```

Para 2,000 km a aproximadamente 200,000 km/s:

```text
2,000 / 200,000 = 0.010 s = 10 ms en un sentido
```

Una interfaz más rápida no consigue que la propagación electromagnética supere la velocidad física del medio.

> **Distinción clave:** serialización responde *¿cuánto tarda colocar los bits en el enlace?* Propagación responde *¿cuánto tarda en viajar un bit que ya está dentro del enlace?*

## 3. El retardo extremo a extremo es una propiedad del camino

A través de varios saltos, un primer modelo es:

```text
D_total = Σ(D_procesamiento + D_cola + D_serialización + D_prop)
```

El modelo es útil porque cada término tiene interpretación, pero no es una fórmula universal para cronometrar cualquier carga de trabajo. Varios paquetes pueden avanzar en pipeline por enlaces diferentes y una aplicación puede introducir dependencias que no aparecen en el retardo de reenvío de un solo paquete.

Por eso conviene preguntar:

1. **¿Qué evento inicia y termina la medición?**
2. **¿Qué componentes pueden ocurrir en paralelo?**

## 4. RTT es tiempo de realimentación, no simplemente el doble de una distancia

El tiempo de ida y vuelta (RTT) mide cuánto tarda una acción en producir la realimentación relevante.

Puede incluir:

- propagación y colas del camino de ida,
- procesamiento en el receptor,
- propagación y colas del camino de vuelta,
- comportamiento de protocolo en ambos extremos.

El camino de vuelta no tiene que ser idéntico al de ida. Por tanto:

```text
RTT ≠ 2 × retardo unidireccional garantizado
```

La distancia física sigue imponiendo un límite inferior, pero el RTT observado contiene más que geografía.

> **Deténgase y prediga.** `ping` pasa de 15 ms a 180 ms mientras se realiza una subida grande y vuelve a 15 ms al detenerla. ¿Se alejaron físicamente los extremos?

La explicación probable es una cola persistente en algún recurso compartido del camino.

## 5. Throughput pregunta cuánto trabajo útil termina por unidad de tiempo

El throughput es una tasa medida durante un intervalo. Si un camino tiene capacidades:

```text
R1, R2, ..., Rn
```

una transferencia idealizada en régimen estable no puede superar:

```text
min(R1, R2, ..., Rn)
```

El recurso relevante más lento actúa como cuello de botella.

Pero el **goodput** de aplicación puede ser menor que el throughput bruto porque no todos los bits transmitidos son carga útil: existen cabeceras, retransmisiones, tráfico de control, sobrecarga de cifrado y otros datos.

La CPU, la ventana de recepción, el almacenamiento, el control de congestión, la contención Wi-Fi o el propio servidor también pueden impedir alcanzar la tasa nominal del enlace.

## 6. El producto ancho de banda-retardo indica cuántos datos puede mantener el camino en vuelo

Capacidad y tiempo de realimentación interactúan. El producto ancho de banda-retardo (BDP) es:

```text
BDP_bits = R_bps × RTT_segundos
```

Para 100 Mb/s y 40 ms de RTT:

```text
100,000,000 × 0.040 = 4,000,000 bits
                         = 500,000 bytes
```

Interpretación: aproximadamente 500 KB deben estar en vuelo para mantener ocupado un camino de 100 Mb/s con un bucle de realimentación de 40 ms.

Si el emisor solo puede mantener 64 KiB pendientes, no podrá sostener 100 Mb/s en este modelo simplificado aunque todos los enlaces físicos soporten esa tasa.

Por eso las ventanas de transporte y el control de congestión se convierten en mecanismos de rendimiento, no solamente en detalles de protocolo.

## 7. El costo inicial y el costo en régimen estable dominan a escalas diferentes

Considere un objeto de 1 MB sobre un cuello de botella de 100 Mb/s y RTT de 100 ms.

La serialización de la carga útil es:

```text
1,000,000 × 8 / 100,000,000 = 0.08 s
```

Supongamos que el establecimiento y las dependencias de la solicitud consumen tres RTT:

```text
3 × 0.1 = 0.3 s
```

Un total aproximado sería:

```text
0.38 s
```

Para esta transferencia corta domina el establecimiento. Duplicar el ancho de banda no reduciría a la mitad el tiempo final.

Ahora imagine una transferencia de 10 GB. El costo inicial fijo pierde importancia y pasa a dominar el throughput sostenido.

> **Lección de ingeniería:** optimice el término que domina la carga de trabajo real, no el número más grande impreso en la especificación de la interfaz.

## 8. La multiplexación estadística produce eficiencia y también colas

Reservar capacidad para el pico de cada usuario desperdiciaría recursos durante sus períodos de inactividad. Las redes de paquetes comparten capacidad estadísticamente.

Esto funciona bien cuando las ráfagas de usuarios diferentes no coinciden. Cuando coinciden, la salida compartida puede recibir paquetes temporalmente más rápido de lo que puede transmitirlos.

Si la tasa de llegada permanece por encima de la tasa de servicio:

```text
llegada > servicio
      ↓
crece la cola
      ↓
aumenta la latencia
      ↓
puede desbordarse el buffer
      ↓
pérdida / retransmisión / respuesta de congestión
```

Esta relación conecta directamente el rendimiento con los mecanismos de control de congestión que se estudiarán más adelante en el libro.

## 9. Ejemplo resuelto — identifique el término dominante antes de optimizar

Características del camino:

- cuello de botella: 10 Mb/s,
- RTT: 20 ms,
- objeto: 10 MB,
- dependencia inicial: 2 RTT.

Término de transmisión:

```text
10,000,000 × 8 / 10,000,000 = 8 s
```

Establecimiento:

```text
2 × 0.020 = 0.040 s
```

La predicción simple es aproximadamente 8.04 s. Domina la tasa de transmisión.

Cambie ahora el cuello de botella por 1 Gb/s:

```text
80,000,000 / 1,000,000,000 = 0.08 s
establecimiento = 0.04 s
```

El establecimiento representa ahora un tercio del total modelado. La misma aplicación ha cambiado de régimen de optimización.

El paso importante no fue la aritmética, sino decidir **qué mecanismo controla el tiempo observado**.

## 10. Medir es realizar un experimento, no generar números

Una medición útil comienza con una pregunta.

### RTT

```bash
ping -c 20 target
```

Pregunte:

- ¿ICMP representa bien el camino de la aplicación?
- ¿mínimo, mediana y máximo son muy diferentes?
- ¿la latencia cambia bajo carga?
- ¿existe pérdida?

### Throughput

Para experimentos controlados utilice un par servidor/cliente de `iperf3`.

Pregunte:

- ¿TCP o UDP?
- ¿un flujo o varios?
- ¿cuánto dura la prueba?
- ¿la CPU está saturada?
- ¿existe contención Wi-Fi?
- ¿hay otro cuello de botella compartido?

### Latencia bajo carga

Un experimento especialmente revelador es:

1. medir RTT en reposo,
2. iniciar una transferencia sostenida,
3. medir RTT de nuevo,
4. detener la transferencia,
5. comparar.

Un aumento grande de RTT bajo carga es evidencia de acumulación de cola en alguna parte del camino.

## 11. Errores frecuentes de razonamiento

### “Más ancho de banda siempre significa menos latencia”

Reduce la serialización en el recurso mejorado. No reduce automáticamente propagación, procesamiento remoto, establecimiento de protocolos o colas en otro punto.

### “Un speed test me dice la velocidad de la red”

Un speed test observa un camino, una carga, un servidor, un instante, un protocolo y unas condiciones de tráfico concretas.

### “La latencia media es suficiente”

Sistemas interactivos y distribuidos suelen depender de variabilidad y colas de distribución, porque una sola dependencia lenta puede retrasar toda una operación.

### “El enlace de acceso es el único cuello de botella”

La aplicación, CPU, medio radioeléctrico, servidor remoto, ventana de transporte u otro segmento pueden dominar.

### “Un camino de 1 Gb/s transfiere un objeto de 1 Gb exactamente en un segundo”

Eso ignora sobrecarga, establecimiento, congestión, límites de aplicación y la diferencia entre gigabits y gigabytes.

## Resumen del capítulo

Mantenga separadas estas magnitudes:

1. **Procesamiento:** trabajo realizado por hosts y dispositivos.
2. **Cola:** depende del tráfico competidor y del estado actual.
3. **Serialización:** depende del tamaño del paquete y de la tasa del enlace.
4. **Propagación:** depende principalmente de distancia y medio.
5. **RTT:** tiempo de realimentación en ambos sentidos más procesamiento y colas.
6. **Throughput:** tasa sostenida de entrega, limitada por cuellos de botella.
7. **BDP:** relaciona capacidad con tiempo de realimentación y determina cuántos datos deben estar en vuelo.
8. **Transferencias cortas y masivas requieren optimizaciones diferentes.**

Antes de continuar, tome una afirmación como “el Wi-Fi está lento” y conviértala en una hipótesis que pueda medirse.

## Conexiones de sistemas

### [OS]

Buffers de sockets, planificación, disciplinas de cola, temporizadores y activación de procesos afectan latencia y throughput observados.

### [ARCH]

Tasas de NIC, DMA, ancho de banda de memoria, CPU, offloads e interrupciones pueden convertirse en cuellos de botella.

### [DIST]

Latencia de RPC, fan-out, reintentos, quórums y colas de distribución dependen de estas mismas magnitudes del camino.

### [SEC]

El cifrado y los handshakes de seguridad añaden procesamiento y, en algunos casos, dependencias adicionales de RTT.

### [PERF]

Este capítulo proporciona el vocabulario cuantitativo que utilizaremos en el resto del curso.

## Autocomprobación

Sin volver a leer:

1. Distinga retardo de serialización y de propagación.
2. Explique por qué RTT puede aumentar bajo carga sin que el camino sea geográficamente más largo.
3. Calcule el BDP de un camino de 200 Mb/s con RTT de 50 ms.
4. Explique por qué una solicitud corta puede beneficiarse más de reducir RTT que de duplicar el ancho de banda.
5. Dé dos razones por las que el goodput de aplicación puede ser menor que la tasa del cuello de botella.
6. Diseñe un experimento sencillo para detectar retardo de cola bajo carga.

Después complete el laboratorio obligatorio de rendimiento que aparece más abajo y compare las predicciones con la evidencia medida o determinista.

<div class="cn-practice-label">Práctica guiada</div>

**Tiempo:** 10–12 minutos  
**Materiales:** calculadora, papel o un editor de texto; no requiere acceso a Internet

## Predicción

Un paquete de 1500 bytes cruza un enlace de 100 Mb/s y después recorre 1000 km por fibra. Antes de calcular, prediga qué será mayor: el retardo de serialización o el de propagación. Prediga también si duplicar la velocidad del enlace cambia el retardo de propagación.

## Ejemplo resuelto

Para un paquete de 1500 bytes:

```text
tamaño = 1500 × 8 = 12 000 bits
serialización = 12 000 / 100 000 000 = 0.00012 s = 0.12 ms
```

Usando como aproximación docente `2 × 10^8 m/s` para la propagación en fibra:

```text
distancia = 1000 km = 1 000 000 m
propagación = 1 000 000 / 200 000 000 = 0.005 s = 5 ms
```

Aquí domina la propagación. Aumentar la tasa del enlace reduce la serialización, pero no hace que la señal recorra el medio más rápido.

## Microexperimento guiado

Use el mismo paquete de 1500 bytes y calcule estos tres casos:

| Caso | Tasa del enlace | Distancia | Paquetes ya en cola |
| --- | ---: | ---: | ---: |
| A | 100 Mb/s | 1000 km | 0 |
| B | 1 Gb/s | 1000 km | 0 |
| C | 100 Mb/s | 1000 km | 3 |

Para el caso C, aproxime el retardo de cola como tres tiempos de serialización del paquete en el enlace de 100 Mb/s. Después ordene los casos por retardo de ida.

Calcule además el producto ancho de banda-retardo de una ruta con `100 Mb/s` de capacidad y `20 ms` de RTT:

```text
BDP = tasa × RTT
```

Exprese el resultado en bits y bytes. Pregúntese qué ocurre con el rendimiento alcanzable si el emisor solo puede mantener 32 KiB en vuelo.

## Evidencia que debe conservar

Conserve las cuatro cantidades calculadas: serialización, propagación, cola del caso C y BDP. Debajo escriba una frase para cada una indicando qué cambio físico o de sistema podría modificarla. Ese será el modelo que comparará con la evidencia medida en el laboratorio.

<div class="cn-practice-label">Comprobación de conocimientos</div>

Responda antes de ejecutar la práctica de laboratorio.

1. Calcule el retardo de serialización para un paquete de 1500 bytes a 10 Mbit/s.
2. Una ruta de fibra se hace el doble de larga mientras la velocidad de bits del enlace se mantiene constante. ¿Qué componente de retardo cambia directamente?
3. Un enlace tiene 25.000 bytes esperando por delante a 10 Mbit/s. Calcule el retardo de cola antes de que su paquete pueda comenzar a serializarse.
4. Calcule el producto ancho de banda-retardo en bytes para 1 Gbit/s y 80 ms RTT.
5. ¿Por qué `min(link rates)` es un límite superior para una ruta simple de estado estable pero no es una garantía de aplicación throughput?
6. Indique una carga de trabajo en la que predomina RTT y otra en la que domina la tasa masiva.
7. ¿Por qué dos pings consecutivos pueden tener RTT diferentes aunque la distancia geográfica no haya cambiado?
8. Explique por qué un enlace de 1 Gbit/s aún puede producir cientos de milisegundos de latencia cuando se forma una cola grande.
9. ¿Qué información experimental debe acompañar a un número `iperf3` throughput para que otro estudiante lo reproduzca/interprete?

Después de responder, ejecute las pruebas numéricas públicas y compare sus unidades con los resultados esperados.

<div class="cn-practice-label cn-lab-label">Laboratorio obligatorio</div>

## Laboratorio obligatorio — Predecir, medir y explicar rendimiento

Este laboratorio separa un modelo determinista de rendimiento de mediciones reales opcionales. Use cualquier entorno local reproducible; no se exige un lenguaje o framework de pruebas específico.

### Predecir

1. ¿Cuánto tarda en serializarse un paquete de 1500 bytes a 1 Mbit/s? ¿Y a 1 Gbit/s?
2. Un camino de 100 Mbit/s tiene 40 ms de RTT. ¿Cuántos bytes se necesitan para llenar un RTT?
3. Un camino contiene enlaces de 1 Gbit/s, 100 Mbit/s y 250 Mbit/s. ¿Cuál limita el throughput estable?
4. ¿Qué magnitudes puede revelar directamente `ping` y cuáles no?

### Construir el modelo

Cree cálculos reproducibles para:

- retardo de serialización;
- retardo de propagación;
- retardo de cola para una cola y tasa de servicio declaradas;
- producto ancho de banda-retardo;
- tasa del cuello de botella;
- una estimación deliberadamente simple del tiempo de transferencia, declarando sus supuestos.

Mantenga visibles las unidades e incluya ejemplos que permitan detectar errores bytes/bits y milisegundos/segundos.

### Medir cuando sea posible

Si dispone de un peer controlado y alcanzable, obtenga una pequeña muestra de latencia con `ping` y, cuando esté disponible, una muestra de throughput con `iperf3`. Prefiera un peer local o controlado; una ruta arbitraria por Internet es una observación, no un evaluador determinista.

### Comparar modelo y evidencia

Compare al menos dos predicciones con observaciones o con un segundo cálculo independiente. Explique diferencias mediante factores como overhead de protocolos, tráfico competidor, colas, comportamiento de arranque, scheduling del host y el hecho de que RTT no equivale al retardo de propagación en un solo sentido.

Termine con una tabla breve que contenga **predicción, observación, diferencia y la explicación más fuerte respaldada por la evidencia**.

<div class="cn-end-note"><span>Límite de publicación de la Parte I</span><strong>Continúe únicamente hasta el Capítulo 4. Las partes posteriores del libro todavía no se publican aquí.</strong></div>
