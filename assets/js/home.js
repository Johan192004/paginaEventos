
    // funcion para el boton de scroll hacia arriba
        
        // Obtener el botón
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

        // Espera a que todo el contenido del HTML se cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    obtenerEventosPrincipales();
});

// Función asíncrona para cargar los eventos desde db.json
async function obtenerEventosPrincipales() {
    try {
        //  Cargar el archivo JSON
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo db.json');
        }
        const data = await response.json();

        // Filtrar los eventos que tienen principal: true y tomar los 3 primeros
        const eventosPrincipales = data.eventos.filter(evento => evento.principal === true).slice(0, 3);

        // Obtenemos los contenedores del HTML donde se insertará el contenido
        const eventosContainer = document.getElementById('eventos-principales-container');
        const modalsContainer = document.getElementById('modals-container');
        
        // Limpiamos contenedores para evitar duplicados
        eventosContainer.innerHTML = '';
        modalsContainer.innerHTML = '';

        //  Generar el HTML para cada evento y su modal
        eventosPrincipales.forEach((evento, index) => {
            // alternamos el diseño de las imagenes y texto izquierda-derecha
            const orderClass = index % 2 === 0 ? '' : 'flex-row-reverse';

            // HTML para la tarjeta del evento
            const eventoHTML = `
                <div class="row mb-5 align-items-center ${orderClass}">
                    <div class="col-md-6">
                        <img src="${evento.imagen}" class="img-fluid" alt="${evento.titulo}">
                    </div>
                    <div class="col-md-6">
                        <h4>${evento.titulo}</h4>
                        <p>${evento.descripcion}</p>
                        <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#modalEvento${evento.id}">
                            VER DETALLES
                        </button>
                    </div>
                </div>
            `;
            eventosContainer.innerHTML += eventoHTML;

            // HTML para el modal del evento
            const modalHTML = `
                <div class="modal fade" id="modalEvento${evento.id}" tabindex="-1" aria-labelledby="modalLabel${evento.id}" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="modalLabel${evento.id}">${evento.titulo}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <img src="${evento.imagen}" class="img-fluid mb-3" alt="Detalle de ${evento.titulo}">
                                <p><strong>Descripción:</strong> ${evento.descripcion}</p>
                                <hr>
                                <p><strong> Lugar:</strong> ${evento.lugar}</p>
                                <p><strong> Fecha:</strong> ${evento.fecha}</p>
                                <p><strong> Hora:</strong> ${evento.hora}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            modalsContainer.innerHTML += modalHTML;
        });

    } catch (error) {
        console.error('Error al cargar los eventos:', error);
        const eventosContainer = document.getElementById('eventos-principales-container');
        eventosContainer.innerHTML = '<p class="text-center">No se pudieron cargar los eventos. Inténtalo más tarde.</p>';
    }
}

// funcion para los demás eventos
async function obtenerMasEventos() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) throw new Error('Error al cargar db.json');
        const data = await response.json();

        // 1. Filtrar eventos que NO son principales
        const otrosEventos = data.eventos.filter(evento => evento.principal === false);

        // 2. Apuntar al contenedor del carrusel y al de los modals
        const carouselInner = document.querySelector('#eventsCarousel .carousel-inner');
        const modalsContainer = document.getElementById('modals-container');
        
        carouselInner.innerHTML = ''; // Limpiar contenido estático

        // Lógica para agrupar eventos en slides de 3
        let slideHTML = '';
        otrosEventos.forEach((evento, index) => {
            // Cada 3 eventos (o en el primer evento), se abre un nuevo slide
            if (index % 3 === 0) {
                const activeClass = index === 0 ? 'active' : ''; // El primer slide debe ser 'active'
                slideHTML += `<div class="carousel-item ${activeClass}"><div class="row justify-content-center">`;
            }

            // HTML de la tarjeta para el evento actual
            slideHTML += `
                <div class="col-md-3">
                    <div class="card">
                        <img src="${evento.imagen}" class="card-img-top" alt="${evento.titulo}">
                        <div class="card-body">
                            <h5 class="card-title">${evento.titulo}</h5>
                            <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#modalEvento${evento.id}">
                                VER DETALLES
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Cada 3 eventos (o en el último evento), se cierra el slide
            if ((index + 1) % 3 === 0 || (index + 1) === otrosEventos.length) {
                slideHTML += `</div></div>`;
            }

            // También generamos su modal correspondiente
            modalsContainer.innerHTML += `
                <div class="modal fade" id="modalEvento${evento.id}">
                    </div>
            `;
        });
        
        // 3. Inyectar todos los slides generados en el carrusel
        carouselInner.innerHTML = slideHTML;

    } catch (error) {
        console.error('Error al cargar "Más Eventos":', error);
    }
}