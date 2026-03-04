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

Sin esos flags, los Shared Drives son invisibles. GoogleDriveMCP los agrega, y además convierte todos los formatos de archivo que Drive no exporta directamente como texto.

---

## Lo que se puede hacer después de instalarlo

Dentro de Claude Desktop, se puede hablar de forma natural:

- *"Lista todos mis Google Drives"*
- *"Muestra los archivos del Shared Drive 'Reportes Q1'"*
- *"Lee el archivo Budget_2026.xlsx de nuestro drive de Finanzas"*
- *"Resume la presentación Kickoff.pptx"*
- *"Busca archivos sobre facturas en todos mis drives"*
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
| [Google Cloud Project](docs/google-cloud-setup.md) | Gratis. Configuración única de ~8 minutos. |

---

## Instalación

### Paso 1 — Crear credenciales en Google Cloud (una sola vez, ~8 min)

Siga la guía **[docs/google-cloud-setup.md](docs/google-cloud-setup.md)**. Explica paso a paso cómo crear credenciales OAuth2 gratuitas.

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

- Verificar que tiene Claude Desktop y Node.js instalados
- Instalar las dependencias
- Pedir el Client ID y Client Secret (del paso 1)
- Configurar Claude Desktop automáticamente
- Abrir el navegador para iniciar sesión con Google

### Paso 3 — Reiniciar Claude Desktop

Cierre completamente (⌘Q en Mac / bandeja del sistema en Windows) y vuelva a abrirlo. Inicie un chat nuevo y escriba:

> *"Lista todos mis Google Drives"*

---

## Compartir con compañeros de equipo

Una vez que se crean las credenciales en Google Cloud, los demás integrantes del equipo no necesitan crear las suyas.

1. Comprima esta carpeta y compártala (email, Drive, USB, etc.)
2. Cada persona ejecuta el instalador
3. Usan el **mismo Client ID + Client Secret** creado en Google Cloud
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

GoogleDriveMCP corre como un servidor local en segundo plano. Claude Desktop se comunica con él vía stdio usando el **Model Context Protocol (MCP)**. Hay 5 herramientas disponibles:

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

Verifique que GoogleDriveMCP aparece en la configuración de Claude Desktop:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (Mac)
// %APPDATA%\Claude\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "googledrivemcp": {
      "command": "node",
      "args": ["/ruta/a/GoogleDriveMCP/src/server.js"]
    }
  }
}
```

Si falta esa sección, vuelva a ejecutar el instalador.

</details>

<details>
<summary><strong>"Access blocked: GoogleDriveMCP has not completed the Google verification process"</strong></summary>

Falta agregar el usuario como Test User en el paso 3 del setup de Google Cloud. Vuelva a la pantalla de OAuth consent → Test users y agregue la cuenta.

</details>

<details>
<summary><strong>"Error 400: redirect_uri_mismatch"</strong></summary>

El tipo de aplicación OAuth no está configurado como "Desktop app". Elimine la credencial en Google Cloud y cree una nueva con el tipo correcto.

</details>

<details>
<summary><strong>El token expiró o fue revocado</strong></summary>

Vuelva a autenticarse ejecutando:

```bash
# Mac / Linux
node src/server.js --auth

# Windows (PowerShell)
node src\server.js --auth
```

</details>

<details>
<summary><strong>El navegador no se abre automáticamente</strong></summary>

Copie la URL que aparece en la terminal y péguela manualmente en cualquier navegador.

</details>

---

## Licencia

MIT
