// serverDiscord.js

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const bodyParser = require('body-parser'); 
const { Client, GatewayIntentBits } = require('discord.js'); 
const fetch = require('node-fetch'); // Para hacer peticiones HTTP (a JSON Server y a Pipedream)

const app = express();
const PORT = process.env.PORT || 3001; 

// --- Middlewares ---
app.use(bodyParser.json()); 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); 
    }
    next(); 
});

// --- Configuración e Inicialización del Bot de Discord ---
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const discordClient = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent 
    ] 
});

if (DISCORD_BOT_TOKEN) {
    discordClient.once('ready', () => {
        console.log(`[Discord Bot] ${discordClient.user.tag} está en línea!`);
    });

    discordClient.login(DISCORD_BOT_TOKEN)
        .catch(error => console.error("[Discord Bot] Error al iniciar sesión en Discord:", error));
} else {
    console.warn("[Discord Bot] DISCORD_BOT_TOKEN no configurado en .env. Las notificaciones de Discord no funcionarán.");
}

// --- Configuración de Pipedream para Envío de Correos ---
// URL del webhook de Pipedream al que enviaremos los datos del evento para que Pipedream gestione el email
const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL; 

if (!PIPEDREAM_WEBHOOK_URL) {
    console.warn("[Email Notifier] PIPEDREAM_WEBHOOK_URL no configurado en .env. Las notificaciones por correo vía Pipedream no funcionarán.");
}


// --- Endpoints de la API ---

// Endpoint POST para manejar las suscripciones a tu boletín (llamado desde home.js)
app.post('/subscribe', async (req, res) => {
    const { email } = req.body; 
    if (!email) {
        return res.status(400).json({ message: 'Email es requerido para la suscripción.' });
    }

    try {
        // 1. Guardar el email del suscriptor en JSON Server
        const saveResponse = await fetch('http://localhost:3000/suscriptores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, fechaSuscripcion: new Date().toISOString() })
        });

        if (!saveResponse.ok) {
            throw new Error(`Error al guardar suscriptor en JSON Server: ${saveResponse.status} - ${saveResponse.statusText}`);
        }
        const newSubscriber = await saveResponse.json();
        console.log(`[Suscripción] Nuevo suscriptor guardado en db.json: ${newSubscriber.email}`);

        // 2. Enviar notificación al canal de Discord del administrador
        if (discordClient.isReady() && DISCORD_CHANNEL_ID) {
            try {
                const channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);
                if (channel && channel.isTextBased()) {
                    await channel.send(`🎉 ¡Nueva suscripción en DoReMiFa! Correo: **${email}**`);
                    console.log(`[Discord] Notificación de nueva suscripción enviada.`);
                } else {
                    console.warn(`[Discord] Canal de Discord no encontrado o no es de texto con ID: ${DISCORD_CHANNEL_ID}. Verifique ID y permisos.`);
                }
            } catch (discordError) {
                console.error("[Discord] Error al intentar enviar mensaje a Discord (posiblemente un problema secundario):", discordError.message);
            }
        } else {
            console.warn("[Discord] Cliente de Discord no está listo o DISCORD_CHANNEL_ID no configurado, no se pudo intentar enviar notificación.");
        }

        res.status(200).json({ message: 'Suscripción exitosa y notificación enviada.' });

    } catch (error) {
        console.error('❌ Error en el endpoint /subscribe:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al procesar la suscripción.' });
    }
});

// Endpoint POST para manejar la publicación/actualización de un evento
// Llamado desde el panel de administración (admin.js)
app.post('/publish-event', async (req, res) => {
    const event = req.body; // El objeto del evento completo que se ha creado/editado desde el admin.js

    if (!event || !event.titulo || !event.descripcion || !event.imagen) {
        return res.status(400).json({ message: 'Datos del evento incompletos para publicar notificación.' });
    }

    try {
        // 1. Obtener todos los suscriptores de JSON Server
        const suscriptoresResponse = await fetch('http://localhost:3000/suscriptores');
        if (!suscriptoresResponse.ok) {
            throw new Error(`Error al obtener suscriptores de JSON Server: ${suscriptoresResponse.status}`);
        }
        const suscriptores = await suscriptoresResponse.json();
        const emails = suscriptores.map(s => s.email).filter(Boolean); 

        // Si no hay suscriptores, no es necesario enviar correos.
        // O si no hay URL de Pipedream configurada para intentar el envío.
        if (emails.length === 0 || !PIPEDREAM_WEBHOOK_URL) {
            console.log('[Publish Event] No hay suscriptores o PIPEDREAM_WEBHOOK_URL no configurada. Correos no enviados.');
            return res.status(200).json({ message: 'Notificación de evento procesada. No hay suscriptores o Pipedream no configurado para correos.' });
        }

        // 2. Enviar datos del evento y lista de suscriptores a Pipedream Webhook
        const pipedreamPayload = {
            event: event,       // Detalles del evento
            subscribers: emails // Lista de emails de suscriptores
        };

        const pipedreamResponse = await fetch(PIPEDREAM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pipedreamPayload)
        });

        if (!pipedreamResponse.ok) {
            // Registramos el error de Pipedream, pero no hacemos que el endpoint de Express falle.
            console.error(`[Email Notifier] Error al enviar datos a Pipedream: ${pipedreamResponse.status} - ${pipedreamResponse.statusText}`);
            // try { console.error('Pipedream response body:', await pipedreamResponse.text()); } catch(e) { console.error('Error al leer body de Pipedream error:', e); }
        } else {
            console.log(`[Email Notifier] Datos del evento enviados a Pipedream Webhook para ${emails.length} suscriptores.`);
        }
        
        res.status(200).json({ message: 'Notificación de evento procesada y solicitud de correos enviada a Pipedream.' });

    } catch (error) {
        console.error('❌ Error en el endpoint /publish-event:', error.message);
        res.status(500).json({ message: 'Error interno del servidor al procesar la publicación del evento.' });
    }
});


// Inicia el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log(`Asegúrate de que JSON Server también esté corriendo en http://localhost:3000`);
});