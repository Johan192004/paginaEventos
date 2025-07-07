// URL de la API de eventos (JSON Server)
const API_URL_EVENTOS = 'http://localhost:3000/eventos'; 
// URL del backend Express para suscripciones y notificaciones
const API_URL_BACKEND = 'http://localhost:3001'; 

// Referencias a elementos del DOM
const heroCarouselInner = document.querySelector('#heroCarousel .carousel-inner');
const heroCarouselIndicators = document.querySelector('#heroCarousel .carousel-indicators');
const mainEventsContainer = document.getElementById('eventos-principales-container');
const secondaryCarouselInner = document.querySelector('#eventsCarousel .carousel-inner');
const moreEventsCollapseBtn = document.querySelector('[data-bs-target="#moreEventsCarouselCollapse"]');
const moreEventsCollapseDiv = document.getElementById('moreEventsCarouselCollapse');
const modalEvento = document.getElementById('modalEvento');

// Botón de scroll hacia arriba
let mybutton = document.getElementById("scrollTopBtn");

// Lógica para mostrar/ocultar y funcionalidad del botón de scroll
window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
};

mybutton.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({top: 0, behavior: 'smooth'});
});

// Función principal para cargar y mostrar eventos en la UI
async function cargarEventosYActualizarIU() {
    try {
        const response = await fetch(API_URL_EVENTOS);
        if (!response.ok) {
            throw new Error('No se pudieron cargar los eventos desde el servidor.');
        }
        const eventos = await response.json();

        // Filtrar eventos activos y ordenar por fecha
        const eventosActivos = eventos.filter(e => e.estado === 'activo')
                                     .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const eventosPrincipales = eventosActivos.slice(0, 3);
        const eventosAdicionales = eventosActivos.slice(3);

        // Actualizamos carrusel principal
        heroCarouselInner.innerHTML = '';
        heroCarouselIndicators.innerHTML = '';

        if (eventosPrincipales.length > 0) {
            eventosPrincipales.forEach((evento, index) => {
                const indicatorButton = document.createElement('button');
                indicatorButton.setAttribute('type', 'button');
                indicatorButton.setAttribute('data-bs-target', '#heroCarousel');
                indicatorButton.setAttribute('data-bs-slide-to', index.toString());
                indicatorButton.setAttribute('aria-label', `Slide ${index + 1}`);
                if (index === 0) {
                    indicatorButton.classList.add('active');
                    indicatorButton.setAttribute('aria-current', 'true');
                }
                heroCarouselIndicators.appendChild(indicatorButton);

                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) {
                    carouselItem.classList.add('active');
                }
                carouselItem.innerHTML = `<img src="${evento.imagen}" class="d-block w-100 event-carousel-img" alt="${evento.titulo}">`;
                heroCarouselInner.appendChild(carouselItem);
            });
        } else {
            heroCarouselInner.innerHTML = `<div class="carousel-item active"><img src="https://placehold.co/1920x600/cccccc/333333?text=No+Hay+Eventos+Destacados" class="d-block w-100 event-carousel-img" alt="No hay eventos destacados"></div>`;
        }

        // Actualizamos la sección de 3 eventos principales
        mainEventsContainer.innerHTML = '';
        if (eventosPrincipales.length > 0) {
            eventosPrincipales.forEach((evento, index) => {
                const rowClass = index % 2 === 0 ? '' : 'flex-row-reverse';
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

        // Actualizamos el carrusel de "Más Eventos"
        secondaryCarouselInner.innerHTML = ''; 
        
        if (eventosAdicionales.length > 0) {
            const chunkSize = 3;
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
            if (moreEventsCollapseBtn) {
                moreEventsCollapseBtn.style.display = 'block'; 
            }
        } else {
            if (moreEventsCollapseBtn) {
                moreEventsCollapseBtn.style.display = 'none'; 
            }
            if (moreEventsCollapseDiv) {
                moreEventsCollapseDiv.classList.remove('show'); 
            }
        }
        
        // Configuramos el único modal de detalles
        if (modalEvento) {
            modalEvento.addEventListener('show.bs.modal', async function (event) {
                const button = event.relatedTarget;
                const eventId = button.getAttribute('data-event-id');
                
                try {
                    const responseModal = await fetch(`${API_URL_EVENTOS}/${eventId}`);
                    if (!responseModal.ok) {
                        throw new Error('Error al cargar los detalles del evento.');
                    }
                    const evento = await responseModal.json();

                    document.getElementById('modalEventoLabel').textContent = evento.titulo;
                    modalEvento.querySelector('.modal-body img').src = evento.imagen;
                    modalEvento.querySelector('.modal-body img').alt = evento.titulo;
                    modalEvento.querySelector('.modal-body .event-description').textContent = evento.descripcion;
                    modalEvento.querySelector('.modal-body .event-date').textContent = `Fecha: ${evento.fecha}`;
                    modalEvento.querySelector('.modal-body .event-time').textContent = `Hora: ${evento.hora}`;
                    modalEvento.querySelector('.modal-body .event-location').textContent = `Lugar: ${evento.lugar}`;
                    modalEvento.querySelector('.modal-body .event-price').textContent = evento.precio ? `Precio: $${parseInt(evento.precio).toLocaleString('es-CO')}` : 'Precio: N/A';
                } catch (error) {
                    console.error("Error al cargar detalles del evento en el modal:", error);
                    document.getElementById('modalEventoLabel').textContent = "Error";
                    modalEvento.querySelector('.modal-body').innerHTML = "<p>No se pudieron cargar los detalles de este evento. Por favor, inténtalo de nuevo más tarde.</p>";
                }
            });
        }


    } catch (error) {
        console.error("Error general al cargar eventos para la página pública:", error.message);
        mainEventsContainer.innerHTML = `<p class="text-center text-danger">No pudimos cargar los eventos en este momento. Por favor, asegúrate de que el servidor esté funcionando.</p>`;
        heroCarouselInner.innerHTML = `<div class="carousel-item active"><img src="https://placehold.co/1920x600/ff0000/FFFFFF?text=ERROR+AL+CARGAR+EVENTOS" class="d-block w-100 event-carousel-img" alt="Error al cargar eventos"></div>`;
    }
}

// Lógica del formulario de suscripción
const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('subscribeEmail').value;

        try {
            const response = await fetch(`${API_URL_BACKEND}/subscribe`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                document.getElementById('subscribeEmail').value = '';
            } else {
                alert('Error al suscribirse: ' + (data.message || 'Error desconocido.'));
            }
        } catch (error) {
            console.error('Error en el formulario de suscripción (frontend):', error);
            alert('Hubo un problema con la suscripción. Intenta de nuevo más tarde.');
        }
    });
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarEventosYActualizarIU();
});