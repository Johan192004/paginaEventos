
// Importa y carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa los módulos necesarios
const express = require('express');
const bodyParser = require('body-parser'); // Middleware para procesar cuerpos de petición JSON
const nodemailer = require('nodemailer'); // Para el envío de correos electrónicos
const { Client, GatewayIntentBits } = require('discord.js'); // Para interactuar con la API de Discord
const fetch = require('node-fetch'); // Para hacer peticiones HTTP desde el backend (ej. a JSON Server)

// Inicializa la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001; 


// Configura bodyParser para procesar cuerpos de petición en formato JSON
app.use(bodyParser.json()); 

// Configura CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    // Define los métodos HTTP permitidos (GET, POST, PUT, DELETE, OPTIONS)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
    // Define las cabeceras permitidas en las peticiones
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    
    // Maneja las peticiones de pre-vuelo, que los navegadores envían antes de peticiones complejas
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Responde un 200 OK inmediatamente para las peticiones OPTIONS
    }
    next(); // Pasa la petición al siguiente middleware o a la ruta correspondiente
});

//Configuración e Inicialización del Bot de Discord 

// Obtenemos el token de .env
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Crea una nueva instancia del cliente de Discord, especificando las "intenciones" necesarias
const discordClient = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, // Necesario para acceder a información de servidores 
        GatewayIntentBits.MessageContent // Necesario para que el bot pueda enviar y recibir mensajes
                                       
    ] 
});

// Solo intenta iniciar sesión si el token de Discord está configurado
if (DISCORD_BOT_TOKEN) {
    // Evento ready, se dispara una vez que el bot se conecta exitosamente a Discord
    discordClient.once('ready', () => {
        console.log(`[Discord Bot] ${discordClient.user.tag} está en línea!`);
    });

    // Intenta iniciar sesión del bot en Discord
    discordClient.login(DISCORD_BOT_TOKEN)
        .catch(error => console.error("[Discord Bot] Error al iniciar sesión en Discord:", error));
} else {
    console.warn("[Discord Bot] DISCORD_BOT_TOKEN no configurado en .env. Las notificaciones de Discord no funcionarán.");
}

// configuración e Inicialización de Nodemailer para Envío de Correos 

// Obtiene las credenciales de correo desde las variables de entorno
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Crea un transporter de Nodemailer, que es el objeto que se encarga de enviar correos
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASS  
    }
});

// Advierte si las credenciales de correo no están configuradas
if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("[Email Notifier] EMAIL_USER o EMAIL_PASS no configurados en .env. Las notificaciones por correo no funcionarán.");
}


//  Endpoints de la API  

// Endpoint POST para manejar las suscripciones a tu boletín
// Llamado desde el formulario de suscripción en home.js
app.post('/subscribe', async (req, res) => {
    const { email } = req.body; // Extrae el correo electrónico del cuerpo de la petición

    // Valida que el email no esté vacío
    if (!email) {
        return res.status(400).json({ message: 'Email es requerido para la suscripción.' });
    }
    // Verificamos si el correo ya está suscrito
    const existing = await fetch(`http://localhost:3000/suscriptores?email=${encodeURIComponent(email)}`);
    const data = await existing.json();
    if (data.length > 0) {
        return res.status(409).json({ message: 'Este correo ya está suscrito.' });
    }

    try {
        // 1. Guardamos el email del suscriptor en JSON Server
        // Esta petición POST guarda el nuevo suscriptor en suscriptores de db.json
        const saveResponse = await fetch('http://localhost:3000/suscriptores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, fechaSuscripcion: new Date().toISOString() }) // Añade fecha
        });

        // Si la respuesta de JSON Server no es exitosa, lanza un error
        if (!saveResponse.ok) {
            throw new Error(`Error al guardar suscriptor en JSON Server: ${saveResponse.status} - ${saveResponse.statusText}`);
        }
        const newSubscriber = await saveResponse.json(); // Parseamos la respuesta de JSON Server
        console.log(`[Suscripción] Nuevo suscriptor guardado en db.json: ${newSubscriber.email}`);

        // 2. Enviar notificación al canal de Discord del administrador
        if (discordClient.isReady() && DISCORD_CHANNEL_ID) {
            try {
                // Intenta obtener el objeto del canal por su ID
                const channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);
                // Verifica que el canal exista y sea un canal de texto
                if (channel && channel.isTextBased()) {
                    // Envía el mensaje de notificación al canal de Discord
                    await channel.send(`🎉 ¡Nueva suscripción en DoReMiFa! Correo: **${email}**`);
                    console.log(`[Discord] Notificación de nueva suscripción enviada.`);
                } else {
                    console.warn(`[Discord] Canal de Discord no encontrado o no es de texto con ID: ${DISCORD_CHANNEL_ID}. Verifique ID y permisos.`);
                }
            } catch (discordError) {
                // incluso si hubo un problema menor o transitorio con Discord.
                console.error("[Discord] Error al intentar enviar mensaje a Discord (posiblemente un problema secundario):", discordError.message);
            }
        } else {
            console.warn("[Discord] Cliente de Discord no está listo o DISCORD_CHANNEL_ID no configurado, no se pudo intentar enviar notificación.");
        }

        // si todo va bien envía una respuesta de éxito al home.js
        res.status(200).json({ message: 'Suscripción exitosa y notificación enviada.' });

    } catch (error) {
        // manejo errores críticos, enviamos una respuesta de error al home.js
        console.error('Error en el endpoint /subscribe:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al procesar la suscripción.' });
    }
});

// Endpoint POST para manejar la publicación/actualización de un evento
app.post('/publish-event', async (req, res) => {
    const event = req.body; // El objeto del evento completo enviado desde el frontend del admin

    // Valida que los datos esenciales del evento estén presentes
    if (!event || !event.titulo || !event.descripcion || !event.imagen) {
        return res.status(400).json({ message: 'Datos del evento incompletos para publicar notificación.' });
    }

    try {
        // 1. Obtener todos los suscriptores de JSON Server para enviarles correos
        const suscriptoresResponse = await fetch('http://localhost:3000/suscriptores');
        if (!suscriptoresResponse.ok) {
            throw new Error(`Error al obtener suscriptores de JSON Server: ${suscriptoresResponse.status}`);
        }
        const suscriptores = await suscriptoresResponse.json();
        const emails = suscriptores.map(s => s.email).filter(Boolean); // Extrae solo los correos válidos de la lista

        // Si no hay suscriptores, no es necesario enviar correos
        if (emails.length === 0) {
            console.log('[Publish Event] No hay suscriptores para enviar correos.');
            return res.status(200).json({ message: 'Notificación de evento procesada. No hay suscriptores para notificar por correo.' });
        }

        // 2. Enviar correo a cada suscriptor usando Nodemailer
        const mailOptions = {
            from: EMAIL_USER, // El remitente del correo (tu email configurado en .env)
            to: emails.join(', '), // Los destinatarios (todos los suscriptores, separados por coma)
            subject: `🎉 ¡Nuevo Evento en DoReMiFa: ${event.titulo}!`, 
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #0599b3;">¡No te pierdas este nuevo evento!</h2>
                    <h3>${event.titulo}</h3>
                    <img src="${event.imagen}" alt="${event.titulo}" style="max-width: 100%; height: auto; display: block; margin-bottom: 20px;">
                    <p>${event.descripcion}</p>
                    <p><strong>Fecha:</strong> ${event.fecha}</p>
                    <p><strong>Hora:</strong> ${event.hora}</p>
                    <p><strong>Lugar:</strong> ${event.lugar}</p>
                    ${event.precio ? `<p><strong>Precio:</strong> $${parseInt(event.precio).toLocaleString('es-CO')}</p>` : ''}
                    <p style="margin-top: 20px;">¡Te esperamos!</p>
                    <p><a href="http://localhost:5500/index.html" style="display: inline-block; padding: 10px 20px; background-color: #0599b3; color: white; text-decoration: none; border-radius: 5px;">Visita nuestra web para más detalles</a></p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 30px;">Este correo fue enviado porque te suscribiste a nuestras notificaciones de eventos musicales.</p>
                </div>
            `
        };

        // Intenta enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`[Email Notifier] Correos de notificación de evento "${event.titulo}" enviados exitosamente a ${emails.length} suscriptores.`);

        // mensaje de éxito alq home.js
        res.status(200).json({ message: 'Notificación de evento procesada y correos enviados.' });

    } catch (error) {
        // Manejo de errores para este endpoint
        console.error('Error en el endpoint /publish-event:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al procesar la publicación del evento.' });
    }
});


// Iniciamos el servidor Express
// app.listen() nos permite que el servidor comience a escuchar peticiones en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log(`Asegúrate de que JSON Server también esté corriendo en http://localhost:3000`);
});