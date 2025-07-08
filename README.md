#  Página de Eventos entre Amigos

Una página web para gestionar y compartir eventos musicales informales entre amigos. Está enfocada en actividades como karaokes, jams improvisadas, noches de vinilos y conciertos caseros, todo en un ambiente relajado y sin pretensiones.

##  Funcionalidades principales

- Visualización de eventos activos y destacados.
- Gestión de eventos (creación, edición, eliminación).
- Páginas separadas para escritorio, suscripciones, contacto, login, etc.
- Diseño responsive compatible con dispositivos móviles.
- Uso de imágenes dinámicas cargadas desde Cloudinary.

##  Tecnologías utilizadas

- **HTML5** y **CSS3**
- **Bootstrap** 
- **JavaScript** 
- **Cloudinary** (para alojar imágenes de eventos)
- `db.json` (simula el backend como base de datos)

##  Requisitos

- Json-server
- Node.js

##  Simulación de API con json-server

Este proyecto usa un archivo `db.json` para simular una API REST con ayuda de [`json-server`](https://github.com/typicode/json-server).

###  Instalación de json-server

Asegúrate de tener Node.js instalado. Luego, instala json-server globalmente:

```bash
npm install -g json-server@0.17.4
```

###  Ejecutar el servidor

Ubica la terminal en el directorio donde está `db.json` y ejecuta:

```bash
json-server --watch db.json --port 3000
```

Esto abrirá un servidor local en:  
 `http://localhost:3000`

Puedes acceder a los recursos como:

- `http://localhost:3000/eventos`
- `http://localhost:3000/usuarios`

##  Cómo iniciar

1. Clona o descomprime el repositorio.
2. Abre el archivo `index.html` en tu navegador.
3. Ejecuta el servidor con:
```bash
json-server --watch db.json --port 3000
```
4.. ¡Disfruta explorando y organizando eventos entre amigos!



##  Autores

- Brahiam Ruiz

- Johan Ramirez Marin

- Juan Manuel Arango Arana

- Juan Daniel Rua Marin

- Julio Cesar Molina Montoya

Hecho en Riwi.
