// Mostrar todos los mensajes de contacto guardados en db.json (JSON Server)
window.addEventListener('DOMContentLoaded', async function() {
    const mensajeContactoElem = document.getElementById('mensaje-contacto');
    if (mensajeContactoElem) {
        try {
            const response = await fetch('http://localhost:3000/mensajes');
            if (response.ok) {
                const mensajes = await response.json();
                if (mensajes.length > 0) {
                    mensajeContactoElem.innerHTML = mensajes.map(m => `
                        <div class="mb-3 p-2 border rounded">
                            <strong>Nombre:</strong> ${m.nombre}<br>
                            <strong>Correo:</strong> ${m.correo}<br>
                            <strong>Asunto:</strong> ${m.asunto}<br>
                            <strong>Mensaje:</strong> ${m.mensaje}
                        </div>
                    `).join('');
                } else {
                    mensajeContactoElem.textContent = 'No hay mensajes registrados.';
                }
            } else {
                mensajeContactoElem.textContent = 'No se pudieron cargar los mensajes.';
            }
        } catch (error) {
            mensajeContactoElem.textContent = 'Error al cargar los mensajes.';
        }
    }
});