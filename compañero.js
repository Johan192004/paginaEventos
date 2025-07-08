// --- CÓDIGO PARA TU COMPAÑERO (admin.js) ---

// Asegúrate de que esta URL coincida con el puerto de tu serverDiscord.js
const API_URL_BACKEND_NOTIFICACIONES = 'http://localhost:3001'; 

// --- Función para enviar el correo de prueba (asociada al botón #sendBtn) ---
// Tu compañero necesitará un botón <button type="button" id="sendBtn">Enviar correo de prueba</button> en su admin.html
document.getElementById("sendBtn").addEventListener("click", async () => {
    // Datos de prueba para un correo de bienvenida o notificación genérica
    const testEventData = {
        titulo: "Evento de Prueba",
        descripcion: "Esto es una prueba de envío de correo para un nuevo evento. ¡Ignorar!",
        imagen: "https://via.placeholder.com/600x400/FF0000/FFFFFF?text=TEST+EVENT",
        fecha: "2025-12-31",
        hora: "18:00",
        lugar: "Lugar de Prueba",
        precio: "10000"
    };

    // Llamamos a la función que enviará la notificación al backend Express
    await enviarNotificacionCorreos(testEventData, true); // true para indicar que es una prueba
});

/**
 * Función para enviar una notificación de evento al backend Express para el envío de correos.
 * @param {object} eventData - Los datos del evento (titulo, descripcion, imagen, etc.).
 * @param {boolean} isTest - Opcional. Si es una prueba (true), lo indica en el mensaje.
 */
async function enviarNotificacionCorreos(eventData, isTest = false) {
    console.log(`Intentando enviar notificación de correo para: ${eventData.titulo}`);
    
    // Si isTest es true, podríamos modificar el título o el asunto para que se distinga
    const displayTitle = isTest ? `[PRUEBA] ${eventData.titulo}` : eventData.titulo;

    try {
        const response = await fetch(`${API_URL_BACKEND_NOTIFICACIONES}/publish-event`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData) // Enviamos el objeto eventData completo
        });

        if (response.ok) {
            const data = await response.json();
            alert(`✅ Solicitud de correo "${displayTitle}" enviada con éxito: ${data.message}`);
            console.log("✅ Datos de evento enviados a Pipedream (vía Express).", data);
        } else {
            const errorData = await response.json();
            alert(`❌ Fallo al solicitar envío de correo "${displayTitle}": ${errorData.message || 'Error desconocido'}`);
            console.error("❌ Fallo al enviar solicitud de notificación de correo:", errorData);
        }
    } catch (err) {
        console.error("❌ Error de red al solicitar envío de correo:", err.message);
        alert(`Fallo de red al enviar solicitud de correo "${displayTitle}": ${err.message}`);
    }
}

// --- Cómo tu compañero usaría esta función DESPUÉS de un CRUD exitoso (ej. al crear un evento) ---
/*
async function crearEventoEnBackend(nuevoEvento) {
    // ... (Lógica para hacer POST a JSON Server: http://localhost:3000/eventos)
    const resJsonServer = await fetch('http://localhost:3000/eventos', { // Suponiendo un fetch exitoso
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEvento)
    });

    if (resJsonServer.ok) {
        const eventoCreado = await resJsonServer.json();
        console.log("Evento creado en DB:", eventoCreado);

        // ¡AHORA SE NOTIFICA A LOS SUSCRIPTORES!
        await enviarNotificacionCorreos(eventoCreado); // Llama a la función proporcionada
        
        return eventoCreado;
    } else {
        console.error("Error al crear evento en DB.");
        return null;
    }
}
*/