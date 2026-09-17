---
title: "Historia de las redes"
description: "Por qué los mecanismos de red adquirieron su forma actual."
pagination: false
---

La historia de las redes resulta más útil cuando explica por qué existe un diseño. Estas notas conectan los mecanismos de los capítulos iniciales con los problemas de ingeniería que les dieron forma.

## Capítulo 1 · De los circuitos a una Internet

<div class="cn-book-note cn-history"><span class="cn-book-note-label">Décadas de 1960–1983</span><strong>Por qué la conmutación de paquetes reemplazó el modelo mental de la red telefónica</strong><p>Las computadoras de tiempo compartido generaban tráfico en ráfagas: largos períodos de silencio seguidos por pequeños grupos de comandos o datos. Reservar un circuito extremo a extremo para toda la conversación desperdiciaba capacidad. La conmutación de paquetes permitió que flujos distintos compartieran estadísticamente los enlaces.</p></div>

Investigadores del MIT, RAND y el National Physical Laboratory británico exploraron de forma independiente ideas de comunicación por paquetes durante la década de 1960. ARPANET convirtió esas ideas en una red operativa. La conmutación de paquetes no eliminó la contención; cambió su manifestación. Los paquetes podían formar colas, sufrir retardos variables o descartarse cuando los buffers se llenaban.

El siguiente problema arquitectónico era mayor: ¿cómo interconectar varias redes de paquetes con tecnologías internas diferentes sin obligarlas a convertirse en una única red uniforme? La interconexión abierta respondió a esa pregunta. Cada red podía conservar su diseño interno mientras gateways reenviaban paquetes entre redes. El servicio común se mantuvo deliberadamente modesto: entrega de paquetes best-effort, dejando garantías más fuertes para los extremos cuando fueran necesarias.

### El primer mensaje de ARPANET fue solo `LO`

El 29 de octubre de 1969, UCLA intentó enviar `LOGIN` al Stanford Research Institute. El sistema remoto falló después de recibir las dos primeras letras, por lo que el primer mensaje de ARPANET fue `LO`. Poco después se pudo enviar la orden completa. La anécdota es útil porque recuerda que el fallo y el progreso parcial estuvieron presentes desde el inicio de las redes de computadoras.

### Por qué TCP/IP separó reenvío y confiabilidad

Los primeros trabajos de interconexión combinaban de forma más estrecha el reenvío entre redes y el comportamiento de transporte. La experiencia mostró que no todas las aplicaciones querían la misma semántica de confiabilidad. La transferencia de archivos se beneficia de una entrega completa y ordenada; una aplicación en tiempo real puede preferir una pequeña pérdida antes que esperar por información que ya llega tarde.

La arquitectura evolucionó hacia IP para direccionamiento y reenvío, TCP para transporte confiable y ordenado, y UDP como alternativa más delgada. La transición de ARPANET de NCP a TCP/IP el 1 de enero de 1983 se recuerda a menudo como un gran cambio de protocolo, pero su importancia duradera es arquitectónica: una capa común estrecha permitió interconectar redes distintas sin imponer una única tecnología interna.

## Capítulo 2 · La información se encuentra con la física

<div class="cn-book-note cn-history"><span class="cn-book-note-label">1948–actualidad</span><strong>Shannon convirtió los límites del canal en una pregunta matemática</strong><p>Claude Shannon separó la información de una representación física concreta y mostró que el ancho de banda y el ruido imponen límites fundamentales a la comunicación confiable.</p></div>

Antes de las redes de computadoras modernas, los ingenieros de comunicaciones ya sabían que los canales reales eran finitos y ruidosos. El trabajo de Shannon de 1948 reformuló el problema en términos de información. La misma información puede representarse mediante niveles de voltaje, pulsos de luz, símbolos de radio u otras codificaciones físicas.

Para un canal limitado en ancho de banda y afectado por ruido, Shannon derivó una cota de capacidad basada en ancho de banda y relación señal-ruido. Los enlaces reales también enfrentan complejidad de implementación, overhead de codificación, interferencia, regulación, consumo energético y condiciones variables. La lección importante es más general: una mejor ingeniería puede acercarse a los límites útiles del canal, pero no puede obtener una tasa de información confiable ilimitada a partir de recursos físicos fijos.

Por eso la capa física pertenece a un curso de redes para Ciencia de la Computación. Las abstracciones digitales funcionan precisamente porque existe una gran cantidad de ingeniería física debajo de ellas.

## Capítulo 3 · La espera fue un objeto matemático antes de las redes de paquetes

<div class="cn-book-note cn-history"><span class="cn-book-note-label">Principios del siglo XX–actualidad</span><strong>La teoría de colas es anterior a Internet</strong><p>Los ingenieros de telefonía ya necesitaban modelos para recursos compartidos y tiempos de espera. Las redes de paquetes heredaron el mismo problema básico: el trabajo llega de forma impredecible, recursos finitos lo atienden y el retardo aumenta con rapidez cuando la utilización se acerca a la capacidad.</p></div>

El análisis de rendimiento de redes no inventó la matemática de la espera. La telefonía ya había obligado a estudiar cuántos recursos compartidos eran necesarios ante una demanda variable y cómo cambiaba la espera cuando la carga se acercaba a la capacidad de servicio.

Las redes de paquetes heredaron esa estructura para paquetes, enlaces, buffers, procesadores y caminos extremo a extremo. El vocabulario moderno de rendimiento —serialización, propagación, colas, throughput, utilización, cuellos de botella y producto ancho de banda-retardo— permite separar mecanismos que de otro modo terminarían resumidos en la frase imprecisa “la red está lenta”.

La conexión histórica es importante porque muestra que el retardo de cola no es simplemente un defecto accidental de implementación: es una consecuencia de compartir recursos finitos bajo demanda variable.

## Capítulo 4 · Ethernet cambió mientras su abstracción sobrevivió

<div class="cn-book-note cn-history"><span class="cn-book-note-label">Década de 1970–actualidad</span><strong>Ethernet sobrevivió cambiando casi todo alrededor de su conocido modelo de trama y direcciones</strong><p>El Ethernet inicial era un medio compartido con colisiones; el Ethernet moderno suele ser conmutado y full-duplex. El nombre permaneció mientras cambiaban la topología, los medios, la velocidad y el mecanismo de contención.</p></div>

Ethernet nació en Xerox PARC durante la década de 1970 para conectar estaciones de trabajo, servidores e impresoras. En sus primeras versiones varias estaciones compartían el mismo medio, de modo que el acceso al canal era un problema central: dos estaciones podían transmitir simultáneamente, sus señales podían interferir y la red necesitaba detectar colisiones y reintentar de forma aleatoria.

Ese es el contexto histórico de CSMA/CD. Sus reglas temporales solo se entienden si se recuerda que importaba el tiempo de propagación de la señal por el medio compartido. El tamaño mínimo de trama y la extensión del dominio de colisión estaban vinculados al tiempo durante el cual un transmisor debía seguir activo para detectar una colisión en el peor caso.

Ethernet evolucionó después desde medios coaxiales compartidos, pasando por hubs, hasta switches con aprendizaje y enlaces punto a punto full-duplex. Las colisiones ordinarias desaparecieron del Ethernet conmutado moderno, las tasas crecieron varios órdenes de magnitud y los medios físicos cambiaron de forma radical. Sin embargo, las capas superiores siguen viendo una abstracción reconocible de tramas Ethernet y direcciones MAC.

La lección de diseño es que una interfaz exitosa puede sobrevivir al mecanismo que originalmente la motivó. La historia permite distinguir la genealogía de Ethernet del comportamiento que debe esperarse en una LAN moderna.
