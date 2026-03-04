# Configuración de Google Cloud Console — Credenciales OAuth2 gratuitas para GoogleDrive MCP

Este es el **único paso que requiere Google Cloud Console**. Es completamente gratuito — sin facturación, sin tarjeta de crédito, sin servicios pagados. Solo se necesita una cuenta de Google.

Tiempo total: ~8 minutos.

---

## Paso 1 – Crear un proyecto en Google Cloud

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Hacer clic en el selector de proyectos en la parte superior izquierda (puede decir "Seleccionar un proyecto")
3. Hacer clic en **Proyecto nuevo**
4. Darle un nombre como `GoogleDrive MCP` (cualquier nombre sirve)
5. Dejar "Ubicación" como "Sin organización", a menos que la empresa tenga una
6. Hacer clic en **Crear**
7. Esperar unos segundos y verificar que `GoogleDrive MCP` esté seleccionado como proyecto activo en la barra superior

---

## Paso 2 – Habilitar la API de Google Drive

1. En el menú lateral, ir a **APIs y servicios → Biblioteca**
2. En el buscador escribir: `Google Drive API`
3. Hacer clic en **Google Drive API** en los resultados
4. Hacer clic en el botón azul **Habilitar**
5. Esperar unos segundos a que se active

---

## Paso 3 – Configurar la pantalla de consentimiento OAuth

1. En el menú lateral, ir a **APIs y servicios → Pantalla de consentimiento de OAuth**
2. Seleccionar **Externo** como tipo de usuario
3. Hacer clic en **Crear**
4. Completar los campos requeridos:
   - **Nombre de la aplicación**: `GoogleDrive MCP` (o cualquier nombre)
   - **Correo electrónico de asistencia del usuario**: su correo electrónico
   - **Información de contacto del desarrollador** (al final): su correo electrónico
5. Hacer clic en **Guardar y continuar**
6. En la página de "Permisos", hacer clic en **Guardar y continuar** (sin cambios)
7. En la página de "Usuarios de prueba":
   - Hacer clic en **Agregar usuarios**
   - Agregar las cuentas de Google de **todas las personas del equipo** que usarán GoogleDrive MCP
   - Hacer clic en **Guardar y continuar**
8. Hacer clic en **Volver al panel**

> [!NOTE]
> Los usuarios se agregan como "usuarios de prueba" porque la aplicación está en modo de prueba. Esto permite que hasta 100 usuarios se autentiquen sin necesidad de publicar la aplicación públicamente. Para la mayoría de los equipos esto es suficiente — no se requieren pasos adicionales.

---

## Paso 4 – Crear credenciales OAuth 2.0

1. En el menú lateral, ir a **APIs y servicios → Credenciales**
2. Hacer clic en **+ Crear credenciales** en la parte superior
3. Seleccionar **ID de cliente de OAuth**
4. En **Tipo de aplicación**, seleccionar **Aplicación de escritorio**
5. Darle el nombre `GoogleDrive MCP Desktop` (cualquier nombre)
6. Hacer clic en **Crear**
7. Aparecerá una ventana emergente con el **Client ID** y el **Client Secret**
8. **Copiar y guardar ambos valores** — se deben pegar en el instalador

> [!IMPORTANT]
> El Client ID tiene este formato: `123456789-abcdefghijkl.apps.googleusercontent.com`
> El Client Secret tiene este formato: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxx`
>
> Solo se necesitan una vez — el instalador los guarda localmente.

---

## Paso 5 – Ejecutar el instalador

Volver y ejecutar el instalador según el sistema operativo:

- **Mac:** `bash install/install-mac.sh`
- **Windows:** Clic derecho en `install\install-windows.ps1` → Ejecutar con PowerShell

Pegar el Client ID y el Client Secret cuando el instalador los solicite.

---

## Compartir con el equipo

**El proyecto de Google Cloud se crea una sola vez.** Los demás integrantes del equipo no necesitan crear el suyo.

Cada persona del equipo:

1. Recibe la carpeta `GoogleDriveMCP` (comprimida y compartida por email, Drive, USB, etc.)
2. Ejecuta el instalador
3. Usa el **mismo** Client ID y Client Secret creados anteriormente
4. Inicia sesión con su propia cuenta de Google cuando se abre el navegador

El token de Google de cada persona se guarda localmente en su propia computadora.

---

## Solución de problemas

| Problema | Solución |
| -------- | -------- |
| "Access blocked: GoogleDrive MCP has not completed the Google verification process" | Falta agregar al usuario como usuario de prueba en el Paso 3. Volver y agregarlo. |
| "Error 400: redirect_uri_mismatch" | El tipo de aplicación OAuth no está configurado como "Aplicación de escritorio". Eliminar la credencial y crear una nueva. |
| El navegador no se abre | Copiar manualmente la URL que aparece en la terminal y pegarla en cualquier navegador. |
| "Token has been expired or revoked" | Ejecutar `node src/server.js --auth` nuevamente para volver a autenticarse. |
