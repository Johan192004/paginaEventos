document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
      }
    });
  });

  const form = document.getElementById('form-suscripcion');
  const correoInput = document.getElementById('correoInput');
  const tbody = document.querySelector('table tbody');

  if (form && correoInput && tbody) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const correo = correoInput.value.trim();
      if (correo) {
        const rowCount = tbody.rows.length + 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${rowCount}</strong></td><td>${correo}</td><td><a href="#" class="text-danger btn-eliminar">Eliminar</a></td>`;
        tbody.appendChild(tr);
        correoInput.value = '';
        localStorage.setItem('correoContacto', correo);
      }
    });

    // Delegación de eventos para eliminar filas
    tbody.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-eliminar')) {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (row) row.remove();
      }
    });
  }

  const mensajeContacto = document.getElementById('mensaje-contacto');
  if (mensajeContacto) {
    const correoGuardado = localStorage.getItem('correoContacto');
    if (correoGuardado) {
      mensajeContacto.textContent = correoGuardado;
    }
  }
});
