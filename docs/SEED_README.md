# 🌱 Configuración de Seed - Usuario Administrador

## Descripción

Este archivo contiene la configuración para crear datos iniciales en la base de datos, específicamente un usuario administrador que permite acceder a todos los endpoints protegidos de la API.

## Usuario Administrador Creado

### Credenciales por defecto:
- **Email:** `admin@perinvidentes.com`
- **Contraseña:** `admin123456`
- **Nombre:** Administrador del Sistema
- **Teléfono:** +56912345678

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login por seguridad.

## Cómo usar

### 1. Ejecutar el seed
```bash
npm run seed
```

### 2. Verificar la creación
El script mostrará un mensaje de confirmación:
```
🚀 Usuario administrador creado exitosamente:
   Email: admin@perinvidentes.com
   Password: admin123456
```

### 3. Usar las credenciales
1. Ve a la documentación de Swagger: `http://localhost:3000/api/docs`
2. Usa el endpoint `POST /auth/login` con las credenciales del admin
3. Copia el token JWT devuelto
4. Haz clic en "Authorize" en Swagger y pega el token
5. Ahora puedes usar todos los endpoints protegidos

## Funcionalidades del Seed

- ✅ Verifica si el usuario admin ya existe (evita duplicados)
- ✅ Hashea la contraseña de forma segura
- ✅ Crea la conexión a la base de datos automáticamente
- ✅ Maneja errores y cierra conexiones correctamente
- ✅ Proporciona feedback visual del proceso

## Estructura del Código

### `SeedConfig` Class
- `initialize()`: Inicializa la conexión a la base de datos
- `destroy()`: Cierra la conexión
- `createAdminUser()`: Crea el usuario administrador
- `runSeeds()`: Ejecuta todos los seeds disponibles

### Configuración de Base de Datos
El seed usa su propia configuración de DataSource para evitar conflictos con la aplicación principal:

```typescript
const seedConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: false,
  ssl: { rejectUnauthorized: false }
};
```

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que la variable `DATABASE_URL` esté configurada en `.env`
- Asegúrate de que la base de datos esté ejecutándose
- Confirma que las credenciales de la base de datos sean correctas

### Usuario ya existe
Si ves el mensaje "Usuario administrador ya existe", significa que el seed ya se ejecutó anteriormente. Esto es normal y seguro.

### Error de permisos
Asegúrate de que el usuario de la base de datos tenga permisos para crear registros en la tabla `users`.

## Próximos Pasos

1. **Login inicial**: Usa las credenciales para hacer login
2. **Cambiar contraseña**: Actualiza la contraseña del admin
3. **Crear usuarios**: Usa los endpoints de usuarios para crear más cuentas
4. **Configurar roles**: Si necesitas diferentes niveles de acceso, considera implementar un sistema de roles

## Seguridad

- 🔒 La contraseña se hashea con bcrypt (10 rounds)
- 🔒 El email es único en la base de datos
- 🔒 Se recomienda cambiar la contraseña por defecto
- 🔒 El seed no sobrescribe usuarios existentes