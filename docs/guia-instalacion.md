# Guía de instalación — GoogleDriveMCP para Claude Desktop

**Para usuarios sin conocimientos técnicos**

---

## ¿Qué es esto y para qué sirve?

Claude Desktop puede conectarse con Google Drive, pero tiene una limitación importante: **solo puede ver archivos de tu Google Drive personal**, y no puede abrir muchos tipos de archivo como Excel (.xlsx), PowerPoint (.pptx) o Word (.docx).

**GoogleDriveMCP resuelve ambos problemas.** Con esto instalado, podrás pedirle a Claude cosas como:

- *"Lista todos mis Google Drives"*
- *"Muéstrame los archivos del Drive compartido 'Proyectos 2025'"*
- *"Lee el archivo Presupuesto.xlsx y resúmelo"*
- *"Busca archivos sobre contratos en todos mis drives"*

Es completamente gratis y funciona en **Windows y Mac**.

---

## Lo que vas a necesitar

Antes de empezar, asegúrate de tener:

| Requisito | ¿Lo tienes? | Cómo conseguirlo |
|-----------|------------|-----------------|
| Claude Desktop instalado | | Descárgalo gratis en [claude.ai/download](https://claude.ai/download) |
| Una cuenta de Google | | La que usas normalmente para Gmail o Drive |
| Node.js instalado | | Descárgalo gratis en [nodejs.org](https://nodejs.org) → botón verde "LTS" |
| La carpeta GoogleDriveMCP | | Te la tienen que compartir (por email, USB, etc.) |

> **Nota sobre Node.js:** Es un programa técnico que corre "por detrás" — no lo vas a usar directamente. Solo instálalo como cualquier otro programa y listo.

---

## PARTE 1 — Crear las credenciales en Google Cloud

> Esto se hace **una sola vez**. Si alguien de tu equipo ya lo hizo, sáltate al [Paso 5](#parte-2--ejecutar-el-instalador) y pídele el Client ID y el Client Secret.

Tiempo aproximado: **8 minutos**. Es completamente gratis, no necesitas tarjeta de crédito.

---

### Paso 1 — Crear un proyecto en Google Cloud

1. Abre el navegador y ve a **[console.cloud.google.com](https://console.cloud.google.com)**
2. Inicia sesión con tu cuenta de Google
3. En la parte superior izquierda vas a ver un menú desplegable (puede decir "Seleccionar un proyecto" o el nombre de un proyecto anterior). Haz clic ahí.
4. En la ventana que se abre, haz clic en **"Proyecto nuevo"** (arriba a la derecha)
5. En "Nombre del proyecto", escribe: `GoogleDrive MCP` (puedes usar cualquier nombre)
6. Deja el campo "Ubicación" tal como está
7. Haz clic en **Crear**
8. Espera unos segundos. Verifica que en la barra superior aparezca seleccionado `GoogleDrive MCP` como proyecto activo

---

### Paso 2 — Activar la API de Google Drive

1. En el menú de la izquierda, busca y haz clic en **"APIs y servicios"** → **"Biblioteca"**
2. En la barra de búsqueda escribe: `Google Drive API`
3. Haz clic en el resultado **"Google Drive API"**
4. Haz clic en el botón azul **"Habilitar"**
5. Espera unos segundos a que se active

---

### Paso 3 — Configurar la pantalla de consentimiento

Esta pantalla es la que verás cuando Google te pida permiso para que la aplicación acceda a tu Drive.

1. En el menú de la izquierda, haz clic en **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** como tipo de usuario
3. Haz clic en **"Crear"**
4. Completa los campos que aparecen:
   - **Nombre de la aplicación:** `GoogleDrive MCP`
   - **Correo electrónico de asistencia del usuario:** tu correo electrónico
   - **Información de contacto del desarrollador** (al final de la página): tu correo electrónico
5. Haz clic en **"Guardar y continuar"**
6. En la siguiente página ("Permisos"), no cambies nada. Haz clic en **"Guardar y continuar"**
7. En la página "Usuarios de prueba":
   - Haz clic en **"Agregar usuarios"**
   - Escribe el correo de Google de **todas las personas** que van a usar GoogleDriveMCP (incluyendo el tuyo)
   - Haz clic en **"Guardar y continuar"**
8. Haz clic en **"Volver al panel"**

> **¿Por qué "usuarios de prueba"?** Porque la aplicación queda en modo privado, sin publicarse al público. Esto es suficiente para equipos de hasta 100 personas y no requiere ningún paso adicional.

---

### Paso 4 — Crear las credenciales OAuth

Aquí obtendrás el **Client ID** y el **Client Secret**, los dos "códigos" que necesita el instalador.

1. En el menú de la izquierda, haz clic en **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ Crear credenciales"** (en la parte superior)
3. Selecciona **"ID de cliente de OAuth"**
4. En **"Tipo de aplicación"**, selecciona **"Aplicación de escritorio"**
   > ⚠️ Es importante que sea "Aplicación de escritorio" y no otra opción
5. En "Nombre", escribe: `GoogleDrive MCP Desktop`
6. Haz clic en **"Crear"**
7. Aparecerá una ventana con dos códigos:
   - **Client ID** — se ve así: `123456789-abcdefgh.apps.googleusercontent.com`
   - **Client Secret** — se ve así: `GOCSPX-xxxxxxxxxxxxxx`
8. **Copia y guarda ambos en un lugar seguro** (un bloc de notas, por ejemplo). Los vas a necesitar en el siguiente paso.

---

## PARTE 2 — Ejecutar el instalador

### Paso 5 — Tener la carpeta GoogleDriveMCP lista

Si no la tienes aún, pídele a quien la creó que te la comparta. Guárdala en un lugar que recuerdes, por ejemplo en tu Escritorio o en tu carpeta de Documentos.

> No borres ni muevas la carpeta después de instalar. El programa la necesita ahí para funcionar.

---

### Paso 6 — Ejecutar el instalador

**En Mac:**

1. Abre la aplicación **Terminal**
   - Puedes buscarla con Spotlight (⌘ + Espacio) y escribir "Terminal"
2. Escribe el siguiente comando y presiona Enter. Reemplaza `/ruta/a` con la ruta real donde guardaste la carpeta:
   ```
   bash /ruta/a/GoogleDriveMCP/install/install-mac.sh
   ```
   > **Tip:** También puedes arrastrar el archivo `install-mac.sh` al Terminal después de escribir `bash ` (con un espacio al final) y presionar Enter.

**En Windows:**

1. Abre la carpeta `GoogleDriveMCP` en el Explorador de Archivos
2. Entra a la carpeta `install`
3. Haz clic derecho sobre el archivo `install-windows.ps1`
4. Selecciona **"Ejecutar con PowerShell"**
   - Si aparece una advertencia de seguridad, haz clic en **"Sí"** o **"Ejecutar de todas formas"**

---

### Paso 7 — Seguir las instrucciones del instalador

El instalador va a pedirte dos cosas:

1. **Client ID** → pega el que guardaste en el Paso 4
2. **Client Secret** → pega el que guardaste en el Paso 4

Luego, el instalador va a **abrir el navegador automáticamente**. Verás la pantalla de inicio de sesión de Google:

1. Elige tu cuenta de Google
2. Es posible que veas un aviso que dice "Esta aplicación no está verificada". Haz clic en **"Avanzado"** → **"Ir a GoogleDrive MCP (no seguro)"**
   > No hay riesgo real — este aviso aparece porque la aplicación es tuya y no está publicada en Google.
3. Haz clic en **"Permitir"** para darle acceso a tu Drive
4. Verás una página que dice "Autenticación completada". Puedes cerrar esa pestaña.

El instalador terminará solo. ¡Listo!

---

### Paso 8 — Reiniciar Claude Desktop

Para que los cambios surtan efecto, **cierra Claude Desktop completamente** y vuelve a abrirlo:

- **Mac:** Haz clic derecho en el ícono de Claude en el Dock → **"Salir"** (o presiona ⌘Q)
- **Windows:** Haz clic derecho en el ícono de Claude en la barra de tareas (abajo a la derecha) → **"Salir"**

Luego vuelve a abrir Claude Desktop normalmente.

---

## PARTE 3 — Primeros pasos

### Paso 9 — Probar que funciona

Abre Claude Desktop, inicia una conversación nueva y escribe:

> *"Lista todos mis Google Drives"*

Si todo está bien, Claude te responderá con la lista de tus drives.

### Ejemplos de lo que puedes pedirle

```
"Muéstrame los archivos del drive 'Marketing'"
"Lee el archivo Informe_Enero.xlsx y dame un resumen"
"¿Qué hay en la carpeta 'Contratos > 2025'?"
"Busca archivos sobre presupuesto en todos mis drives"
"Resume la presentación Kickoff.pptx"
```

---

## Para tu equipo — Cómo compartir con otras personas

Una vez que tengas las credenciales creadas, **tus compañeros no necesitan repetir la Parte 1**.

Cada persona del equipo tiene que:

1. Recibir la carpeta `GoogleDriveMCP` (puedes compartirla por email, Drive, USB, etc.)
2. Ejecutar el instalador (Pasos 6 y 7)
3. Usar el **mismo Client ID y Client Secret** que tú creaste
4. Iniciar sesión con **su propia cuenta de Google** cuando se abre el navegador

El acceso de cada persona queda guardado solo en su computadora.

---

## Solución de problemas frecuentes

### Claude dice que no puede acceder a Google Drive

El instalador no terminó bien. Vuelve a ejecutarlo desde el Paso 6.

---

### Aparece "Access blocked: GoogleDriveMCP has not completed the Google verification process"

Falta agregar tu cuenta como usuario de prueba. Vuelve al **Paso 3** en Google Cloud Console, ve a "Usuarios de prueba" y agrega tu correo electrónico.

---

### Aparece "Error 400: redirect_uri_mismatch"

El tipo de aplicación no está bien configurado. Ve a Google Cloud Console → Credenciales, elimina la credencial que creaste y crea una nueva asegurándote de seleccionar **"Aplicación de escritorio"** en el Paso 4.

---

### El navegador no se abrió automáticamente

Busca en la ventana del Terminal o PowerShell una línea que empiece con `https://`. Copia esa URL completa y pégala en tu navegador manualmente.

---

### Necesito volver a iniciar sesión con Google (el acceso expiró)

**En Mac/Linux:** Abre Terminal y ejecuta:
```
node /ruta/a/GoogleDriveMCP/src/server.js --auth
```

**En Windows:** Abre PowerShell y ejecuta:
```
node C:\ruta\a\GoogleDriveMCP\src\server.js --auth
```

Sigue las instrucciones del navegador como en el Paso 7.

---

*Guía para GoogleDriveMCP · Instalación gratuita · Sin conocimientos técnicos requeridos*
