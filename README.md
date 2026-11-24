## Weather CLI APP

El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

### Opciones:

- Ingresar el nombre de una ciudad.
- Guardar la ciudad por defecto.
- Registrar varias otras ciudades para buscar el clima en esas otras ciudades.

## Stack

- Bun.js
- OpenMeteo

## Ejemplo de petición http:

1. Paso 1: Geocoding API.
2. Paso 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

### Pronóstico a 7 días

Las opciones `6` y `7` consultan el pronóstico diario de Open-Meteo para la ciudad default o para todas las ciudades guardadas. Cada día muestra temperatura máxima y mínima, descripción del clima (códigos WMO) y probabilidad de lluvia, respetando la unidad configurada (`°C` / `°F`).

```
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=7&timezone=auto
```

## Inicializar proyecto

```bash
bun init
```

## Testing

Los tests están en `test/` y usan el propio Bun (`bun:test`), sin dependencias extra:

```bash
bun run test        # ejecuta toda la suite
bun run test:watch  # modo watch
bun run check       # typecheck + tests
bun run build       # verifica todo antes de compilar el binario
```

Si cualquier test falla, `bun run build` se detiene y **no se genera el binario**.
Las pruebas no hacen peticiones reales ni escriben en el `~/.weather-cli` del usuario.

### Ejemplo del menú
Esta es la apariencia que deseamos crear

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Pronóstico 7 días (ciudad default)
  7. Pronóstico 7 días (todas las ciudades) (1)
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```