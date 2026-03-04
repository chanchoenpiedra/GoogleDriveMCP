<div align="center">

# GoogleDriveMCP

**Conecta Claude Desktop con tus Google Drive compartidos**

[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-7C3AED)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Google Drive API](https://img.shields.io/badge/Google%20Drive%20API-v3-4285F4?logo=google-drive&logoColor=white)](https://developers.google.com/drive)

La integración nativa de Claude con Google Drive solo funciona con Google Docs personales.<br>
**GoogleDriveMCP** extiende esa integración para acceder a **Shared Drives**, **carpetas compartidas** y todos los formatos de archivo — incluyendo XLSX, PPTX, PDF y DOCX — directamente desde cualquier conversación.

</div>

---

## ¿Por qué existe esto?

Claude tiene integración con Google Drive de forma nativa, pero omite dos flags críticos de la API:

```
includeItemsFromAllDrives: true
supportsAllDrives: true
```

Sin esos flags, los Shared Drives son invisibles. GoogleDriveMCP los agrega, y de paso convierte todos los formatos de archivo que Drive no exporta directamente como texto.

---

## Lo que podés hacer después de instalarlo

Dentro de Claude Desktop, simplemente hablás de forma natural:

- *"Listá todos mis Google Drives"*
- *"Mostrá los archivos del Shared Drive 'Reportes Q1'"*
- *"Leé el archivo Budget_2026.xlsx de nuestro drive de Finanzas"*
- *"Resumí la presentación Kickoff.pptx"*
- *"Buscá archivos sobre facturas en todos mis drives"*
- *"¿Qué hay en la carpeta 'Contratos > 2025'?"*

---

## Formatos soportados

| Tipo | Formato |
|------|---------|
| Google Docs | ✅ Texto completo |
| Google Sheets | ✅ Como CSV |
| Google Slides | ✅ Texto de cada slide |
| PDF | ✅ |
| Word (.docx) | ✅ |
| Excel (.xlsx) | ✅ Todas las hojas |
| PowerPoint (.pptx) | ✅ Texto slide por slide |
| Texto plano / Markdown / CSV | ✅ |

---

## Requisitos

| Requisito | Notas |
|-----------|-------|
| [Claude Desktop](https://claude.ai/download) | Gratis. Windows o Mac. |
| [Node.js 18+](https://nodejs.org/en/download/) | Gratis. El instalador lo verifica. |
| [Google Cloud Project](docs/google-cloud-setup.md) | Gratis. Setup único de ~8 minutos. |

---

## Instalación

### Paso 1 — Crear credenciales en Google Cloud (una sola vez, ~8 min)

Seguí la guía **[docs/google-cloud-setup.md](docs/google-cloud-setup.md)**. Explica paso a paso cómo crear credenciales OAuth2 gratuitas.

### Paso 2 — Ejecutar el instalador

**macOS:**

```bash
bash install/install-mac.sh
```

**Windows** (clic derecho → "Ejecutar con PowerShell"):

```
install\install-windows.ps1
```

El instalador va a:

- Verificar que tenés Claude Desktop y Node.js
- Instalar las dependencias
- Pedir tu Client ID y Client Secret (del paso 1)
- Configurar Claude Desktop automáticamente
- Abrir el navegador para que inicies sesión con Google

### Paso 3 — Reiniciar Claude Desktop

Cerrá completamente (⌘Q en Mac / bandeja del sistema en Windows) y volvé a abrirlo. Iniciá un chat nuevo y escribí:

> *"Listá todos mis Google Drives"*

---

## Compartir con compañeros de equipo

Una vez que vos creaste las credenciales en Google Cloud, tus compañeros no necesitan crear las suyas.

1. Comprimí esta carpeta y compartila (email, Drive, USB, etc.)
2. Cada compañero ejecuta el instalador
3. Usan el **mismo Client ID + Client Secret** que creaste en Google Cloud
4. Cada uno inicia sesión con **su propia cuenta de Google** cuando se abre el navegador
5. El token se guarda únicamente en su propia computadora

---

## Cómo funciona

```
Claude Desktop  ──MCP (stdio)──►  GoogleDriveMCP (Node.js)
                                         │
                               Google Drive API v3
                                         │
                         My Drive + Shared Drives / Carpetas
```

GoogleDriveMCP corre como un servidor local en segundo plano. Claude Desktop se comunica con él vía stdio usando el **Model Context Protocol (MCP)**. Son 5 herramientas disponibles:

| Herramienta | Qué hace |
|-------------|----------|
| `list_drives` | Lista My Drive y todos los Shared Drives |
| `list_files` | Lista archivos y carpetas dentro de un drive o carpeta |
| `read_file` | Lee el contenido de un archivo (convierte a texto) |
| `search_files` | Búsqueda de texto completo en todos los drives |
| `get_file_metadata` | Devuelve metadata detallada de un archivo |

---

## Estructura del proyecto

```
GoogleDriveMCP/
├── src/
│   ├── server.js           ← Servidor MCP (Claude habla con esto)
│   ├── auth.js             ← Flujo OAuth2 con Google
│   ├── drive.js            ← Wrapper de la API de Google Drive
│   ├── converters.js       ← PDF, DOCX, XLSX, PPTX → texto
│   ├── functions/          ← Lógica de negocio
│   └── tools/              ← Registro de herramientas MCP
├── install/
│   ├── install-mac.sh      ← Instalador macOS
│   └── install-windows.ps1 ← Instalador Windows
├── docs/
│   └── google-cloud-setup.md
└── package.json
```

---

## Solución de problemas

<details>
<summary><strong>Claude dice que no puede acceder a Google Drive</strong></summary>

Verificá que GoogleDriveMCP aparece en la configuración de Claude Desktop:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (Mac)
// %APPDATA%\Claude\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "plugindrive": {
      "command": "node",
      "args": ["/ruta/a/GoogleDriveMCP/src/server.js"]
    }
  }
}
```

Si falta esa sección, volvé a ejecutar el instalador.

</details>

<details>
<summary><strong>"Access blocked: GoogleDriveMCP has not completed the Google verification process"</strong></summary>

Olvidaste agregar el usuario como Test User en el paso 3 del setup de Google Cloud. Volvé a la pantalla de OAuth consent → Test users y agregá la cuenta.

</details>

<details>
<summary><strong>"Error 400: redirect_uri_mismatch"</strong></summary>

El tipo de aplicación OAuth no está configurado como "Desktop app". Borrá la credencial en Google Cloud y creá una nueva con el tipo correcto.

</details>

<details>
<summary><strong>El token expiró o fue revocado</strong></summary>

Volvé a autenticarte ejecutando:

```bash
# Mac / Linux
node src/server.js --auth

# Windows (PowerShell)
node src\server.js --auth
```

</details>

<details>
<summary><strong>El navegador no se abre solo</strong></summary>

Copiá la URL que aparece en la terminal y pegala manualmente en cualquier navegador.

</details>

---

## Licencia

MIT
