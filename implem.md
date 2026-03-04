# Cómo instalar y usar PluginDrive

## Instalación (una sola vez)

---

### Parte 1 — Lo que necesitás instalar

**1. Claude Desktop**
Descargalo de [claude.ai/download](https://claude.ai/download) e instalalo normalmente.

**2. Node.js**
Descargalo de [nodejs.org](https://nodejs.org) (el botón que dice "LTS"). Instalalo normalmente. Si ya lo tenés, verificá que sea versión 18 o mayor:
```bash
node --version
```

---

### Parte 2 — Crear credenciales en Google (una sola vez, ~8 min)

Esto es lo único "técnico" del proceso. Lo hacés una vez y nunca más.

1. Entrá a [console.cloud.google.com](https://console.cloud.google.com) con tu cuenta de Google
2. Arriba a la izquierda, hacé clic en el selector de proyectos → **New Project** → ponele cualquier nombre (ej: `PluginDrive`) → **Create**
3. Menú izquierdo → **APIs & Services → Library** → buscá `Google Drive API` → clic en el resultado → **Enable**
4. Menú izquierdo → **APIs & Services → OAuth consent screen** → elegí **External** → **Create**
   - Completá "App name" (ej: `PluginDrive`) y tu email en los dos campos que pide
   - **Save and Continue** tres veces hasta llegar al dashboard
   - En la sección **Test users**, agregá los emails de Google de todos los que van a usar esto
5. Menú izquierdo → **APIs & Services → Credentials** → **+ Create Credentials** → **OAuth client ID**
   - Application type: **Desktop app**
   - **Create**
   - Te aparece un popup con un **Client ID** y un **Client Secret** — copiá los dos a un bloc de notas

---

### Parte 3 — Instalar PluginDrive

Descargá el repositorio (botón verde "Code" → "Download ZIP" en GitHub, o con git):
```bash
git clone https://github.com/tu-usuario/PluginDrive.git
```

Después ejecutá el instalador:

**Mac:**
```bash
bash install/install-mac.sh
```

**Windows** (clic derecho sobre el archivo → "Ejecutar con PowerShell"):
```
install\install-windows.ps1
```

El instalador te va a pedir el **Client ID** y el **Client Secret** que copiaste antes. Los pegás, presionás Enter, y se abre el navegador para que inicies sesión con Google. Aceptás los permisos y listo.

---

### Parte 4 — Activarlo en Claude

Cerrá Claude Desktop completamente (⌘Q en Mac, no solo la ventana) y volvé a abrirlo.

Abrí un chat nuevo y escribí:

> *"Listá todos mis Google Drives"*

Si te responde con tus drives, todo funciona.

---

## Uso diario

No hay nada especial que hacer. Abrís Claude Desktop, abrís un chat, y le hablás normal:

- *"Mostrá los archivos del drive de Finanzas"*
- *"Leé el archivo Presupuesto_2025.xlsx"*
- *"Buscá documentos sobre el proyecto Alpha"*
- *"Resumí la presentación del último kickoff"*

El token de Google se renueva solo. No tenés que volver a hacer login.

---

## Lo único que puede salir mal en el día a día

**El token expiró** (pasa si no usás la herramienta por mucho tiempo):

```bash
# Mac / Linux
node src/server.js --auth

# Windows
node src\server.js --auth
```

Se abre el navegador, iniciás sesión de nuevo, y vuelve a funcionar.

---

## Si querés que un compañero también lo use

1. Le mandás la carpeta `PluginDrive` (zipeada, por Drive, lo que sea)
2. Él ejecuta el mismo instalador
3. Usa el **mismo Client ID y Client Secret** que vos creaste — no necesita crear uno nuevo
4. Inicia sesión con **su propia cuenta de Google** cuando se abre el navegador

Listo. Cada uno tiene su propio token guardado en su computadora.
