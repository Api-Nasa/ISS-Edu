

// Función para precargar imágenes
function precargarImagenesAstronautas(astronautas) {
    astronautas.forEach(astronauta => {
        if (astronauta.foto_url) {
            const img = new Image();
            img.src = astronauta.foto_url;
        }
        if (astronauta.galeria_fotos && Array.isArray(astronauta.galeria_fotos)) {
            astronauta.galeria_fotos.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }
    });
}



document.addEventListener('DOMContentLoaded', function () {
    console.log('Mapa.js cargado');
     
    
    try {
        var astronautasData = document.getElementById('my-data').getAttribute('data-name');
        astronautasGlobales = JSON.parse(astronautasData);
        console.log("Datos de astronautas parseados:", astronautasGlobales);

        if (Array.isArray(astronautasGlobales) && astronautasGlobales.length > 0) {
            actualizarListaAstronautas(astronautasGlobales);
            precargarImagenesAstronautas(astronautasGlobales);
        } else {
            console.warn("Los datos de astronautas no son un array válido o están vacíos");
        }
    } catch (e) {
        console.error('Error al parsear los datos de astronautas:', e);
    }

    // Inicialmente, ocultamos el panel de astronautas
    var panelAstronautas = document.getElementById('panel-astronautas');
    if (panelAstronautas) {
        panelAstronautas.style.display = 'none';
    }

    // Configuramos el botón para mostrar la lista de astronautas
    var botonMostrarAstronautas = document.getElementById('boton-mostrar-astronautas');
    if (botonMostrarAstronautas) {
        botonMostrarAstronautas.addEventListener('click', mostrarPanelAstronautas);
    }

    inicializarPanelAstronautas();

    document.getElementById('opciones').style.opacity = "1";
    var accordion = document.querySelector('ul[uk-accordion]');

    UIkit.util.on(accordion, 'shown', function (e) {
        if (e.target.contains(document.getElementById('caja-buscar'))) {
            document.getElementById('caja-buscar').focus();
        }
    });

    var cerrarBoton = document.querySelector('#panel-astronauta .cerrar-panel');
    if (cerrarBoton) {
        cerrarBoton.addEventListener('click', cerrarPanelAstronauta);
    }
});

function scrollPanelToTop() {
    const panel = document.getElementById('panel-astronautas');
    const listaAstro = document.getElementById('lista-astro');
    if (panel) panel.scrollTop = 0;
    if (listaAstro) listaAstro.scrollTop = 0;
}

function scrollToTop(element) {
    if (element) {
        element.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function actualizarListaAstronautas(astronautas) {
    console.log("Actualizando lista de astronautas");
    var listaAstronautas = document.querySelector('.lista-astronautas');
    if (!listaAstronautas) {
        console.error('No se encontró la lista de astronautas');
        return;
    }

    listaAstronautas.innerHTML = '';

    astronautas.forEach(function (astronauta) {
        var li = document.createElement('li');
        var enlace = document.createElement('a');
        enlace.href = '#';
        enlace.className = 'astronauta-link';
        enlace.setAttribute('data-nombre', astronauta.nombre);
        enlace.textContent = astronauta.nombre;

        enlace.onclick = function (e) {
            e.preventDefault();
            mostrarDetallesAstronauta(astronauta.nombre);
        };

        li.appendChild(enlace);
        listaAstronautas.appendChild(li);
    });

    console.log("Número de astronautas en la lista:", listaAstronautas.children.length);
}


function inicializarPanelAstronautas() {
    const panel = document.getElementById('panel-astronautas');
    const cerrarBoton = panel.querySelector('.cerrar-panel');

    makeDraggable(panel);

    panel.style.display = 'none';

    window.mostrarPanelAstronautas = function () {
        panel.style.display = 'block';

    };

    if (cerrarBoton) {
        cerrarBoton.addEventListener('click', cerrarPanelAstronautas);
    }
}



function makeDraggable(element) {
    // Solo hacer el elemento arrastrable si la pantalla es lo suficientemente grande
    if (window.innerWidth > 600) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (element.querySelector('.panel-header')) {
            element.querySelector('.panel-header').onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

function manejarClicOpciones() {
    const panelAstronautas = document.getElementById('panel-astronautas');
    const panelAstronauta = document.getElementById('panel-astronauta');
    if (panelAstronautas && panelAstronautas.style.display !== 'none') {
        panelAstronautas.style.display = 'none';
        panelAstronauta.style.display = 'none';
    }
    toggleOpcionesMenu();
}

document.getElementById('opciones').addEventListener('click', manejarClicOpciones);

function predecirPasosISS(lat, lng, popupToClose) {
    if (popupToClose) {
        popupToClose.remove();
    }

    fetch('/predecir_pasos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            latitud: lat,
            longitud: lng
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error + (data.details ? ': ' + data.details : ''));
            }
            mostrarPrediccionesPasos(data, lat, lng);
        })
        .catch(error => {
            console.error('Error completo:', error);
            alert('Hubo un error al predecir los pasos de la ISS: ' + error.message);
        });
}

function mostrarPrediccionesPasos(data, lat, lng) {
    console.log("Datos recibidos en mostrarPrediccionesPasos:", data);

    let contenidoDiv = document.createElement('div');
    contenidoDiv.id = 'predicciones-pasos';
    contenidoDiv.style.position = 'absolute';
    contenidoDiv.style.top = '50%';
    contenidoDiv.style.left = '50%';
    contenidoDiv.style.transform = 'translate(-50%, -50%)';
    contenidoDiv.style.backgroundColor = '#f0f0f0';
    contenidoDiv.style.color = '#333';
    contenidoDiv.style.padding = '20px';
    contenidoDiv.style.borderRadius = '10px';
    contenidoDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    contenidoDiv.style.zIndex = '50';
    contenidoDiv.style.maxHeight = '80vh';
    contenidoDiv.style.overflowY = 'auto';
    contenidoDiv.style.minWidth = '300px';
    contenidoDiv.style.border = '2px solid #333';

    let closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '10px';
    closeButton.style.backgroundColor = '#cc0000';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';

    let contenido = `<h3 style="color: #0066cc; padding-right: 30px;">Predicción de pasos de la ISS</h3>`;
    contenido += `<p>Ubicación: Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}</p>`;

    if (data.error) {
        console.log("Se recibió un error:", data.error);
        contenido += `<p style="color: red;">Error: ${data.error}</p>`;
        if (data.details) {
            contenido += `<p style="color: #cc0000;">Detalles: ${data.details}</p>`;
        }
    } else if (data.mensaje) {
        contenido += `<p style="color: #006600;">${data.mensaje}</p>`;
    }

    if (data.pasos && data.pasos.length > 0) {
        console.log("Número de pasos a mostrar:", data.pasos.length);
        contenido += `<h4 style="color: #0066cc;">Pasos previstos:</h4>`;

        const ahora = new Date();
        let hayPasoHoy = false;

        data.pasos.forEach((paso, index) => {
            console.log(`Procesando paso ${index + 1}:`, paso);
            const inicioFecha = new Date(paso.inicio);
            const esHoy = inicioFecha > ahora && inicioFecha.toDateString() === ahora.toDateString();
            let fecha = new Date(paso.inicio);

            let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            let fechaFormateada = `${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
            if (esHoy && !hayPasoHoy) {
                contenido += `<h5 style="color: #ffcc00; background-color: #333; padding: 5px;">¡Hoy lo puedes ver!</h5>`;
                hayPasoHoy = true;
            }

            const estilo = esHoy ? 'background-color: #333; color: #ffcc00; padding: 10px; border-radius: 5px;' : '';

            contenido += `
                <div style="margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; ${estilo}">
                    <strong style="color: ${esHoy ? '#ffcc00' : '#0066cc'};">Paso ${index + 1}: ${fechaFormateada}</strong><br>
                    <span>Inicio: ${paso.inicio}</span><br>
                    <span>Fin: ${paso.fin}</span><br>
                    <span>Duración: ${paso.duracion}</span><br>
                    <span>Elevación máxima: ${paso.elevacion_maxima}°</span>
                </div>
            `;
        });
    } else {
        console.log("No se encontraron pasos para mostrar");
        contenido += `<p style="color: #cc6600;">No se encontraron pasos visibles de la ISS para esta ubicación en los próximos días.</p>`;
    }

    contenidoDiv.innerHTML = contenido;
    contenidoDiv.appendChild(closeButton);

    document.body.appendChild(contenidoDiv);

    function cerrarDiv() {
        document.body.removeChild(contenidoDiv);
    }

    closeButton.addEventListener('click', cerrarDiv);

    window.addEventListener('click', function (event) {
        if (event.target == contenidoDiv) {
            cerrarDiv();
        }
    });
}

function cerrarPanelAstronautas() {
    const panelAstronautas = document.getElementById('panel-astronautas');
    if (panelAstronautas) {
        panelAstronautas.style.display = 'none';
    }


    // Cerrar también el panel-astronauta
    cerrarPanelAstronauta();
}

function cerrarPanelAstronauta() {
    const panelAstronauta = document.getElementById('panel-astronauta');
    if (panelAstronauta) {
        panelAstronauta.style.display = 'none';
    }
}

function astronautas(popupToClose) {
    if (popupToClose) {
        setTimeout(function () {
            popupToClose.remove();
        }, 100);
    }
    mostrarPanelAstronautas();
}

function ver_solo_estacion() {
    if (screen.width < 1200) {
        document.getElementById('cerrar-aside').click();
    }
    borrar_xml();
    centrarMapa();
}

function limpiar_caja() {
    document.getElementById('caja-buscar').value = "";
    document.getElementById('caja-buscar').focus();
    document.getElementById('ciudad').innerHTML = '';
}

function pasar_src(source) {
    document.getElementById('myvideo').setAttribute('src', source);
    document.getElementById('titulo-video').innerHTML = document.getElementById(source).innerHTML;
}

function quitar_source() {
    document.getElementById('myvideo').setAttribute('src', "");
    document.getElementById('myinfo').setAttribute('src', "");
}

UIkit.util.on('#modal-example', 'hidden', function () {
    document.getElementById('myvideo').setAttribute('src', "");
    document.getElementById('opciones').click();
});

function borrar_xml() {
    console.log("Iniciando borrar_xml");
    if (screen.width < 1200) {
        document.getElementById('cerrar-aside').click();
    }
    if (!map || !map.loaded()) {
        console.error("El mapa no está cargado o definido");
        return;
    }

    const elementsToRemove = [
        'iss-demo-points',
        'iss-demo-lines',
        'iss-points',
        'iss-route'
    ];

    elementsToRemove.forEach(id => {
        if (map.getLayer(id)) {
            map.removeLayer(id);
            console.log(`Capa ${id} eliminada`);
        }
        if (map.getSource(id)) {
            map.removeSource(id);
            console.log(`Fuente ${id} eliminada`);
        }
    });

    if (window.issAnimationFrame) {
        cancelAnimationFrame(window.issAnimationFrame);
        window.issAnimationFrame = null;
        console.log("Animación detenida");
    }

    if (window.issMarkers) {
        window.issMarkers.forEach(marker => marker.remove());
        window.issMarkers = [];
        console.log("Todos los marcadores eliminados");
    }

    if (window.issMarker) {
        window.issMarker.remove();
        window.issMarker = null;
        console.log("Marcador de demo_estacion eliminado");
    }

    if (issMarker) {
        issMarker.addTo(map);
        console.log("Marcador en tiempo real restaurado");
    }

    console.log("Limpieza completa, incluyendo elementos de demo_estacion");
}

function mostrarDetallesAstronauta(nombre) {
    cerrarPanelAstronautas()
    var astronauta = astronautasGlobales.find(a => a.nombre === nombre);

    if (astronauta) {
        var panelAstronauta = document.getElementById('panel-astronauta');

        if (!panelAstronauta) {
            console.error('No se encontró el panel de astronauta');
            return;
        }

        var contenidoHTML = `
            <div class="uk-container uk-container-xsmall uk-margin-auto">
                <div class="panel-header uk-flex uk-flex-between uk-flex-middle">
                    <h3 class="uk-margin-remove">${astronauta.nombre || 'Nombre no disponible'}</h3>
                    <button class="cerrar-panel uk-close-large" uk-close></button>
                </div>
                <div class="uk-position-relative uk-margin-small-top">
                    <button class="uk-button uk-button-primary uk-position-top-right">Ver Galería</button>
                </div>
                <div class="uk-grid-small uk-grid-match" uk-grid>
                    <div class="uk-width-1-1 uk-width-1-3@m">
                        <div class="uk-card uk-card-default uk-card-body">
                            <img class="uk-width-1-1" src="${astronauta.foto_url || '#'}" alt="${astronauta.nombre || 'Astronauta'}">
                        </div>
                    </div>
                    <div class="uk-width-1-1 uk-width-2-3@m">
                        <div class="uk-card uk-card-default uk-card-body">
                            <h4 class="uk-card-title">Descripción</h4>
                            <p>${astronauta.descripcion || 'Descripción no disponible'}</p>
                                    <div class="uk-margin-bottom">
                                         <button class="uk-button uk-button-primary uk-width-1-1" onclick="abrirGaleriaAstronauta('${astronauta.nombre}')">Ver Galería de Fotos</button>
                                    </div>
                                     <div class="uk-margin-bottom">
                                <button class="uk-button uk-button-secondary uk-width-1-1" onclick="abrirGaleriaEquipoCompleto()">Ver Fotos de Todo el Equipo</button>
                            </div>
                            </div>
                    </div>
                </div>
                <div class="uk-grid-small uk-child-width-1-2@s uk-child-width-1-4@m uk-margin-small-top" uk-grid>
                    <div>
                        <div class="uk-card uk-card-default uk-card-body">
                            <p class="uk-margin-remove"><strong>Nacionalidad:</strong> ${astronauta.nacionalidad || 'No disponible'}</p>
                        </div>
                    </div>
                    <div>
                        <div class="uk-card uk-card-default uk-card-body">
                            <p class="uk-margin-remove"><strong>Agencia:</strong> ${astronauta.agencia || 'No disponible'}</p>
                        </div>
                    </div>
                    <div>
                        <div class="uk-card uk-card-default uk-card-body">
                            <p class="uk-margin-remove"><strong>Tiempo en el espacio:</strong> ${astronauta.tiempo_espacio || 'No disponible'}</p>
                        </div>
                    </div>
                    <div>
                        <div class="uk-card uk-card-default uk-card-body">
                            <p class="uk-margin-remove"><strong>Misión actual:</strong> ${astronauta.mision_actual || 'No disponible'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        panelAstronauta.innerHTML = contenidoHTML;
        panelAstronauta.style.display = 'block';

        // Hacer el panel dragable
        //makeDraggable(panelAstronauta);

        // Añadir evento de cierre al botón
        var cerrarBoton = panelAstronauta.querySelector('.cerrar-panel');
        if (cerrarBoton) {
            cerrarBoton.addEventListener('click', cerrarPanelAstronauta);
        }

        // Asegurarse de que el panel de detalles esté en la parte superior
        panelAstronauta.scrollTop = 0;
    } else {
        console.error('No se encontraron detalles para el astronauta:', nombre);
    }
}

function mostrarPanelAstronautas() {
    var panelAstronautas = document.getElementById('panel-astronautas');
    if (panelAstronautas) {
        panelAstronautas.style.display = 'block';
        panelAstronautas.scrollTop = 0;
        panelAstronautas.height = "fit-content"
    }
}


// Función para mostrar el panel de un astronauta
function mostrarPanelAstronauta(astronauta) {
    const panelContainer = document.getElementById('panel-container');
    panelContainer.innerHTML = crearPanelAstronauta(astronauta);

    // Aquí puedes agregar la lógica para hacer el panel arrastrable si es necesario
    // Por ejemplo, usando una biblioteca como Draggabilly
    const element = document.getElementById('panel-astronautas');
    new Draggabilly(element, {
        handle: '.panel-header'
    });
}

// Función para abrir la galería de fotos del astronauta
function abrirGaleriaAstronauta(nombre) {
    // Primero, cerrar la ficha del astronauta actual
    cerrarFichaAstronauta();
    cerrarPanelAstronautas()

    console.log("Abriendo galería para:", nombre);
    var astronauta = astronautasGlobales.find(a => a.nombre === nombre);
    
    // Crear los badges para los otros astronautas
    const otrosAstronautas = astronautasGlobales
        .filter(a => a.nombre !== nombre)
        .map(a => `<span class="uk-badge uk-margin-small-right uk-margin-small-bottom" style="cursor: pointer;" data-astronauta="${a.nombre}">${a.nombre}</span>`)
        .join('');

    // Crear el contenido del modal
    var modalContent = `
        <div style="z-index:7000" class="uk-modal-dialog uk-modal-body uk-modal-large" style="width: 90vw; max-width: 1200px; background-color: white;">
            <button class="uk-modal-close-default" type="button" uk-close></button>
            <h2 class="uk-modal-title" style="color: #333;">Galería de ${nombre}</h2>
            <div class="uk-margin-medium-bottom">
                <h4>Otros astronautas:</h4>
                <div id="otros-astronautas-container">
                    ${otrosAstronautas}
                </div>
            </div>
            <div id="galeria-container" class="uk-grid uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@m uk-child-width-1-5@l uk-grid-small" uk-grid>
                <!-- Las imágenes se cargarán aquí -->
            </div>
        </div>
    `;

    // Crear y mostrar el modal
    var modalContainer = document.createElement('div');
    modalContainer.id = 'galeria-modal';
    modalContainer.innerHTML = modalContent;
    modalContainer.style.width="90%"
    document.body.appendChild(modalContainer);

    var modal = UIkit.modal('#galeria-modal', {
        bgClose: true,
        escClose: true
    });
    
    modal.show();

    // Agregar event listeners a los badges
    const badgesContainer = document.getElementById('otros-astronautas-container');
    badgesContainer.addEventListener('click', function(event) {
        if (event.target.hasAttribute('data-astronauta')) {
            const nombreAstronautaSeleccionado = event.target.getAttribute('data-astronauta');
            modal.hide();
            setTimeout(() => {
                mostrarDetallesAstronauta(nombreAstronautaSeleccionado);
            }, 300);
        }
    });

    UIkit.util.on('#galeria-modal', 'hidden', function() {
        document.body.removeChild(modalContainer);
    });

    // Cargar las imágenes o mostrar mensaje si no hay fotos
    if (astronauta && astronauta.galeria_fotos && astronauta.galeria_fotos.length > 0) {
        cargarImagenes(astronauta.galeria_fotos, nombre);
    } else {
        mostrarMensajeNoFotos(nombre);
    }
}

function cerrarFichaAstronauta() {
    const panelAstronauta = document.getElementById('panel-astronauta');
    if (panelAstronauta) {
        panelAstronauta.innerHTML = '';
        panelAstronauta.style.display = 'none';
    }
}

function cargarImagenes(urls, nombreAstronauta) {
    const galeriaContainer = document.getElementById('galeria-container');
    galeriaContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevas imágenes

    urls.forEach(url => {
        const divImagen = document.createElement('div');
        divImagen.innerHTML = `
            <div class="uk-card uk-card-default">
                <div class="uk-card-media-top">
                    <img src="${url}" alt="Imagen de ${nombreAstronauta}" loading="lazy" style="width: 100%; height: auto;">
                </div>
            </div>
        `;
        galeriaContainer.appendChild(divImagen);
    });

    // Actualizar el layout del grid de UIkit
    UIkit.update(galeriaContainer);
}

function mostrarMensajeNoFotos(nombreAstronauta) {
    const galeriaContainer = document.getElementById('galeria-container');
    if (galeriaContainer) {
        galeriaContainer.innerHTML = `
            <div class="uk-width-1-1 uk-flex uk-flex-column uk-flex-middle uk-flex-center" style="height: 50vh; background-color: #f8f8f8;">
                <p class="uk-text-large uk-text-center" style="color: #333; font-weight: bold;">No hemos encontrado fotos de este astronauta</p>
                <button class="uk-button uk-button-primary uk-margin-large-top" onclick="abrirGaleriaEquipoCompleto()">Ver Fotos de Todo el Equipo</button>
            </div>
        `;
    }
}

function abrirGaleriaEquipoCompleto() {
    console.log("Abriendo galería del equipo completo");
    cerrarPanelAstronautas()
    // Crear los badges para todos los astronautas
    const todosLosAstronautas = astronautasGlobales
        .map(a => `<span class="uk-badge uk-margin-small-right uk-margin-small-bottom" style="cursor: pointer;" data-astronauta="${a.nombre}">${a.nombre}</span>`)
        .join('');

    // Crear el contenido del modal
    var modalContent = `
        <div style="z-index:7000" class="uk-modal-dialog uk-modal-body uk-modal-large" style="width: 90vw; max-width: 1200px; background-color: white;">
            <button class="uk-modal-close-default" type="button" uk-close></button>
            <h2 class="uk-modal-title" style="color: #333;">Galería del Equipo ISS Completo</h2>
            <div class="uk-margin-medium-bottom">
                <h4>Astronautas:</h4>
                <div id="todos-astronautas-container">
                    ${todosLosAstronautas}
                </div>
            </div>
            <div id="galeria-equipo-completo-container" class="uk-grid uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@m uk-child-width-1-5@l uk-grid-small" uk-grid>
                <!-- Las imágenes se cargarán aquí -->
            </div>
        </div>
    `;

    // Crear y mostrar el modal
    var modalContainer = document.createElement('div');
    modalContainer.id = 'galeria-equipo-completo-modal';
    modalContainer.innerHTML = modalContent;
    modalContainer.style.width="90%"
    document.body.appendChild(modalContainer);
   
    var modal = UIkit.modal('#galeria-equipo-completo-modal', {
        bgClose: true,
        escClose: true
    });
    
    modal.show();

    // Agregar event listeners a los badges
    const badgesContainer = document.getElementById('todos-astronautas-container');
    badgesContainer.addEventListener('click', function(event) {
        if (event.target.hasAttribute('data-astronauta')) {
            const nombreAstronautaSeleccionado = event.target.getAttribute('data-astronauta');
            modal.hide();
            setTimeout(() => {
                mostrarDetallesAstronauta(nombreAstronautaSeleccionado);
            }, 300);
        }
    });

    UIkit.util.on('#galeria-equipo-completo-modal', 'hidden', function() {
        document.body.removeChild(modalContainer);
    });

    // Cargar todas las imágenes de todos los astronautas
    const todasLasImagenes = astronautasGlobales.flatMap(astronauta => 
        [astronauta.foto_url, ...(astronauta.galeria_fotos || [])]
    ).filter(url => url && url.trim() !== '');

    cargarImagenesEquipoCompleto(todasLasImagenes);
}

function cargarImagenesEquipoCompleto(urls) {
    const galeriaContainer = document.getElementById('galeria-equipo-completo-container');
    galeriaContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevas imágenes
    cerrarPanelAstronautas()
    urls.forEach((url, index) => {
        const divImagen = document.createElement('div');
        divImagen.innerHTML = `
            <div style="z-index:4500" class="uk-card uk-card-default">
                <div class="uk-card-media-top">
                    <img src="${url}" alt="Imagen ${index + 1}" loading="lazy" style="width: 100%; height: auto;">
                </div>
            </div>
        `;
        galeriaContainer.appendChild(divImagen);
    });

    // Actualizar el layout del grid de UIkit
    UIkit.update(galeriaContainer);
}

function precargarImagenesAstronautas(astronautas) {
    astronautas.forEach(astronauta => {
        if (astronauta.foto_url) {
            const img = new Image();
            img.src = astronauta.foto_url;
        }
        if (astronauta.galeria_fotos && Array.isArray(astronauta.galeria_fotos)) {
            astronauta.galeria_fotos.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }
    });
}