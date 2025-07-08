// serverDiscord.js

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001; 

// Middlewares
app.use(bodyParser.json()); 

// CORS - permite que el frontend haga peticiones al servidor
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Configuración del Bot de Discord
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const discordClient = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ] 
});

// Inicia el bot de Discord si hay token configurado
if (DISCORD_BOT_TOKEN) {
    discordClient.once('ready', () => {
        console.log(`[Discord Bot] ${discordClient.user.tag} está en línea!`);
    });

    discordClient.login(DISCORD_BOT_TOKEN)
        .catch(error => console.error("[Discord Bot] Error al iniciar sesión en Discord:", error));
} else {
    console.warn("[Discord Bot] DISCORD_BOT_TOKEN no configurado en .env. Las notificaciones de Discord no funcionarán.");
}

// Endpoint para manejar suscripciones
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email es requerido para la suscripción.' });
    }

    try {
        // Guardar suscriptor en JSON Server
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

        // Enviar notificación a Discord
        if (discordClient.isReady() && DISCORD_CHANNEL_ID) {
            try {
                const channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);
                if (channel && channel.isTextBased()) {
                    await channel.send(`🎉 ¡Nueva suscripción en Medellín Sounds! Correo: **${email}**`);
                    console.log(`[Discord] Notificación de nueva suscripción enviada.`);
                } else {
                    console.warn(`[Discord] Canal de Discord no encontrado o no es de texto con ID: ${DISCORD_CHANNEL_ID}. Verifique ID y permisos.`);
                }
            } catch (discordError) {
                // Solo registra el error, no interrumpe el proceso
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

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log(`Asegúrate de que JSON Server también esté corriendo en http://localhost:3000`);
});