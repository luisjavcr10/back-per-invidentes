# Back-per-invidentes

Backend para aplicación de personas invidentes desarrollado con NestJS.

## Descripción

Este proyecto es una API REST desarrollada con NestJS que proporciona servicios backend para una aplicación destinada a personas invidentes. La aplicación está diseñada con principios de accesibilidad y usabilidad en mente.

## Características

- ✅ API REST con NestJS
- ✅ TypeScript para tipado estático
- ✅ Configuración de CORS
- ✅ Pruebas unitarias y e2e
- ✅ Endpoint de salud de la aplicación
- ✅ Estructura modular y escalable

## Instalación

```bash
# Instalar dependencias
$ npm install
```

## Ejecutar la aplicación

```bash
# Desarrollo
$ npm run start

# Modo watch (desarrollo)
$ npm run start:dev

# Modo debug
$ npm run start:debug

# Producción
$ npm run start:prod
```

## Pruebas

```bash
# Pruebas unitarias
$ npm run test

# Pruebas e2e
$ npm run test:e2e

# Cobertura de pruebas
$ npm run test:cov
```

## Endpoints disponibles

### GET /
Retorna un mensaje de bienvenida de la API.

**Respuesta:**
```
¡Bienvenido a la API para personas invidentes!
```

### GET /health
Retorna el estado de salud de la aplicación.

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "back-per-invidentes",
  "version": "1.0.0",
  "description": "API funcionando correctamente"
}
```

## Estructura del proyecto

```
src/
├── app.controller.ts      # Controlador principal
├── app.controller.spec.ts # Pruebas del controlador
├── app.module.ts          # Módulo principal
├── app.service.ts         # Servicio principal
└── main.ts               # Punto de entrada de la aplicación

test/
├── app.e2e-spec.ts       # Pruebas end-to-end
└── jest-e2e.json         # Configuración de Jest para e2e
```

## Tecnologías utilizadas

- **NestJS** - Framework de Node.js para aplicaciones escalables
- **TypeScript** - Superset de JavaScript con tipado estático
- **Jest** - Framework de pruebas
- **ESLint** - Linter para mantener calidad de código
- **Prettier** - Formateador de código

## Configuración de desarrollo

El proyecto incluye configuraciones para:
- TypeScript (`tsconfig.json`)
- NestJS CLI (`nest-cli.json`)
- Jest para pruebas
- ESLint y Prettier para calidad de código

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y no tiene licencia pública.

## Contacto

Para más información sobre el proyecto, contacta al equipo de desarrollo.