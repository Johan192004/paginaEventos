
// URL base para el servidor JSON
const API_URL_EVENTOS = 'http://localhost:3000/eventos'; 
// URL de tu servidor Express para suscripciones/notificaciones.
const API_URL_BACKEND = 'http://localhost:3001'; 

// Elementos del DOM 
const heroCarouselInner = document.querySelector('#heroCarousel .carousel-inner'); // El carrusel principal
const heroCarouselIndicators = document.querySelector('#heroCarousel .carousel-indicators'); // Indicadores del carrusel principal
const mainEventsContainer = document.getElementById('eventos-principales-container'); // Contenedor de los 3 eventos principales
const secondaryCarouselInner = document.querySelector('#eventsCarousel .carousel-inner'); // Carrusel de "Más eventos"
const moreEventsCollapseBtn = document.querySelector('[data-bs-target="#moreEventsCarouselCollapse"]'); // Botón "Más Eventos"
const moreEventsCollapseDiv = document.getElementById('moreEventsCarouselCollapse'); // Div colapsable de "Más Eventos"

// Modal único para los detalles del evento
const modalEvento = document.getElementById('modalEvento');


// Obtener botón
let mybutton = document.getElementById("scrollTopBtn");

// Cuando el usuario se desplaza 20px hacia abajo desde la parte superior del documento, muestra el botón
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// Cuando el usuario hace clic en el botón, se desplaza suavemente hacia la parte superior del documento
mybutton.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({top: 0, behavior: 'smooth'});
});


// --- Función principal para cargar todos los eventos y actualizar la UI ---
async function cargarEventosYActualizarUI() {
    try {
        const response = await fetch(API_URL_EVENTOS);
        if (!response.ok) {
            // Mensaje de error simplificado
            throw new Error('No se pudieron cargar los eventos desde el servidor.');
        }
        const eventos = await response.json();

        // Filtrar solo los eventos activos (si tienes un campo 'estado' en tu db.json)
        // Y ordenar por fecha (del más próximo al más lejano)
        const eventosActivos = eventos.filter(e => e.estado === 'activo')
                                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));


        // Los primeros 3 eventos activos serán los "principales"
        const eventosPrincipales = eventosActivos.slice(0, 3);
        const eventosAdicionales = eventosActivos.slice(3); // El resto de eventos para el carrusel secundario

        // --- 1. Actualizar Carrusel Principal (Hero Carousel) ---
        heroCarouselInner.innerHTML = ''; // Limpiar contenido anterior
        heroCarouselIndicators.innerHTML = ''; // Limpiar indicadores anteriores

        if (eventosPrincipales.length > 0) {
            eventosPrincipales.forEach((evento, index) => {
                // Crear indicador del carrusel
                const indicatorButton = document.createElement('button');
                indicatorButton.setAttribute('type', 'button');
                indicatorButton.setAttribute('data-bs-target', '#heroCarousel');
                indicatorButton.setAttribute('data-bs-slide-to', index.toString());
                indicatorButton.setAttribute('aria-label', `Slide ${index + 1}`);
                if (index === 0) { // El primer indicador es activo
                    indicatorButton.classList.add('active');
                    indicatorButton.setAttribute('aria-current', 'true');
                }
                heroCarouselIndicators.appendChild(indicatorButton);

                // Crear ítem del carrusel (con la imagen del evento principal)
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) { // El primer ítem es activo
                    carouselItem.classList.add('active');
                }
                carouselItem.innerHTML = `<img src="${evento.imagen}" class="d-block w-100 event-carousel-img" alt="${evento.titulo}">`;
                heroCarouselInner.appendChild(carouselItem);
            });
        } else {
            // Si no hay eventos principales, muestra un placeholder genérico
            heroCarouselInner.innerHTML = `<div class="carousel-item active"><img src="https://placehold.co/1920x600/cccccc/333333?text=No+Hay+Eventos+Destacados" class="d-block w-100 event-carousel-img" alt="No hay eventos destacados"></div>`;
        }

        // --- 2. Actualizar Sección de 3 Eventos Principales (las tarjetas debajo del carrusel) ---
        mainEventsContainer.innerHTML = ''; // Limpiar contenedor
        if (eventosPrincipales.length > 0) {
            eventosPrincipales.forEach((evento, index) => {
                const rowClass = index % 2 === 0 ? '' : 'flex-row-reverse'; // Alternar imagen/texto
                const eventoHtml = `
                    <div class="row mb-5 align-items-center ${rowClass}">
                        <div class="col-md-6">
                            <img src="${evento.imagen}" class="img-fluid" alt="${evento.titulo}">
                        </div>
                        <div class="col-md-6">
                            <h4>${evento.titulo}</h4>
                            <p>${evento.descripcion}</p>
                            <p><strong>Fecha:</strong> ${evento.fecha} | <strong>Hora:</strong> ${evento.hora}</p>
                            <p><strong>Lugar:</strong> ${evento.lugar}</p>
                            ${evento.precio ? `<p><strong>Precio:</strong> $${parseInt(evento.precio).toLocaleString('es-CO')}</p>` : ''}
                            <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#modalEvento" data-event-id="${evento.id}">
                                VER DETALLES
                            </button>
                        </div>
                    </div>
                `;
                mainEventsContainer.innerHTML += eventoHtml;
            });
        } else {
            mainEventsContainer.innerHTML = '<p class="text-center text-white">Pronto tendremos nuevos eventos destacados. ¡Mantente atento!</p>';
        }


        // --- 3. Actualizar Carrusel de "Más Eventos" (si hay eventos adicionales) ---
        secondaryCarouselInner.innerHTML = ''; 
        
        if (eventosAdicionales.length > 0) {
            const chunkSize = 3; // Mostrar 3 eventos por slide en este carrusel
            for (let i = 0; i < eventosAdicionales.length; i += chunkSize) {
                const chunk = eventosAdicionales.slice(i, i + chunkSize);
                const activeClass = i === 0 ? 'active' : '';
                let slideHtml = `<div class="carousel-item ${activeClass}"><div class="row">`;
                chunk.forEach(evento => {
                    slideHtml += `
                        <div class="col-md-4">
                            <div class="card h-100"> 
                                <img src="${evento.imagen}" class="card-img-top" alt="${evento.titulo}">
                                <div class="card-body d-flex flex-column"> 
                                    <h5 class="card-title">${evento.titulo}</h5>
                                    <p class="card-text flex-grow-1">${evento.descripcion.substring(0, 100)}...</p> 
                                    <button type="button" class="btn btn-danger mt-auto" data-bs-toggle="modal" data-bs-target="#modalEvento" data-event-id="${evento.id}">
                                        Ver más
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                slideHtml += `</div></div>`;
                secondaryCarouselInner.innerHTML += slideHtml;
            }
            // Mostrar el botón de "Más eventos" si hay eventos adicionales
            if (moreEventsCollapseBtn) { // Verificar que el botón exista
                moreEventsCollapseBtn.style.display = 'block'; 
            }
        } else {
            // Ocultar el botón y el div colapsable si no hay más eventos
            if (moreEventsCollapseBtn) { // Verificar que el botón exista
                moreEventsCollapseBtn.style.display = 'none'; 
            }
            if (moreEventsCollapseDiv) { // Verificar que el div exista
                moreEventsCollapseDiv.classList.remove('show'); 
            }
        }
        
        // --- 4. Configurar el ÚNICO Modal de Detalles (se rellena al hacer clic en cualquier botón "Ver Detalles") ---
        // Se adjunta un solo listener al modal, y este se activará cuando cualquier botón de "Ver Detalles" lo abra.
        // Se usa { once: true } para que este listener particular se elimine después de ejecutarse una vez,
        // esto es para prevenir múltiples registros si la función cargarEventosYActualizarUI se llamara varias veces.
        // El modal de Bootstrap se encarga de reabrirse y su gestión interna.
        modalEvento.addEventListener('show.bs.modal', async function (event) {
            const button = event.relatedTarget; // Este es el botón "VER DETALLES" que fue clickeado
            const eventId = button.getAttribute('data-event-id'); // Obtenemos el ID del evento de ese botón
            
            try {
                // Hacemos un fetch para obtener los detalles específicos del evento clickeado
                const responseModal = await fetch(`${API_URL_EVENTOS}/${eventId}`);
                if (!responseModal.ok) {
                    throw new Error('Error al cargar los detalles del evento.');
                }
                const evento = await responseModal.json();

                // Rellenar el contenido del ÚNICO modal con los datos del evento
                document.getElementById('modalEventoLabel').textContent = evento.titulo;
                modalEvento.querySelector('.modal-body img').src = evento.imagen;
                modalEvento.querySelector('.modal-body img').alt = evento.titulo;
                modalEvento.querySelector('.modal-body .event-description').textContent = evento.descripcion;
                modalEvento.querySelector('.modal-body .event-date').textContent = `Fecha: ${evento.fecha}`;
                modalEvento.querySelector('.modal-body .event-time').textContent = `Hora: ${evento.hora}`;
                modalEvento.querySelector('.modal-body .event-location').textContent = `Lugar: ${evento.lugar}`;
                // Asegurarse de que el precio existe antes de mostrarlo
                modalEvento.querySelector('.modal-body .event-price').textContent = evento.precio ? `Precio: $${parseInt(evento.precio).toLocaleString('es-CO')}` : 'Precio: N/A';
            } catch (error) {
                console.error("Error al cargar detalles del evento en el modal:", error);
                document.getElementById('modalEventoLabel').textContent = "Error";
                modalEvento.querySelector('.modal-body').innerHTML = "<p>No se pudieron cargar los detalles de este evento. Por favor, inténtalo de nuevo más tarde.</p>";
            }
        }, { once: true }); // Este listener solo se adjuntará una vez


    } catch (error) {
        console.error("Error general al cargar eventos para la página pública:", error.message);
        // Mostrar mensajes de error en la UI si la carga inicial falla
        mainEventsContainer.innerHTML = `<p class="text-center text-danger">No pudimos cargar los eventos en este momento. Por favor, asegúrate de que el servidor esté funcionando.</p>`;
        heroCarouselInner.innerHTML = `<div class="carousel-item active"><img src="https://placehold.co/1920x600/ff0000/FFFFFF?text=ERROR+AL+CARGAR+EVENTOS" class="d-block w-100 event-carousel-img" alt="Error al cargar eventos"></div>`;
    }
}

// --- Código del formulario de suscripción (Tu parte) ---
const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) { // Siempre verifica que el elemento exista antes de intentar añadir un listener
    subscribeForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Evita que el formulario se envíe de forma tradicional
        const email = document.getElementById('subscribeEmail').value; // Obtiene el email del input

        try {
            // Envía la petición POST al servidor Express para gestionar la suscripción
            // El servidor Express es el que interactuará con JSON Server (para guardar el email)
            // y con Discord (para enviar la notificación al admin).
            const response = await fetch(`${API_URL_BACKEND}/subscribe`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email }) // Envía el email en formato JSON
            });

            const data = await response.json(); // Parsea la respuesta del servidor
            if (response.ok) { // Si la respuesta es exitosa (código 2xx)
                alert(data.message); // Muestra el mensaje de éxito del servidor
                document.getElementById('subscribeEmail').value = ''; // Limpia el campo de email
            } else { // Si la respuesta indica un error
                alert('Error al suscribirse: ' + (data.message || 'Error desconocido.'));
            }
        } catch (error) {
            console.error('Error en el formulario de suscripción (frontend):', error);
            alert('Hubo un problema con la suscripción. Intenta de nuevo más tarde.');
        }
    });
}


// --- Ejecutar al cargar todo el contenido del DOM ---
document.addEventListener('DOMContentLoaded', () => {
    cargarEventosYActualizarUI(); // Inicia la carga y renderización de los eventos
});