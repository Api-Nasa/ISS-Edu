var astronautasGlobales = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mapa.js cargado');
   
    try {
        var astronautasData = document.getElementById('my-data').getAttribute('data-name');
        astronautasGlobales = JSON.parse(astronautasData);
        console.log("Datos de astronautas parseados:", astronautasGlobales);
        
        if (Array.isArray(astronautasGlobales) && astronautasGlobales.length > 0) {
            actualizarListaAstronautas(astronautasGlobales);
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

    document.getElementById('opciones').style.opacity="1";
    var accordion = document.querySelector('ul[uk-accordion]');
    
    UIkit.util.on(accordion, 'shown', function(e) {
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

    astronautas.forEach(function(astronauta) {
        var li = document.createElement('li');
        var enlace = document.createElement('a');
        enlace.href = '#';
        enlace.className = 'astronauta-link';
        enlace.setAttribute('data-nombre', astronauta.nombre);
        enlace.textContent = astronauta.nombre;
        
        enlace.onclick = function(e) {
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
   
    window.mostrarPanelAstronautas = function() {
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

    window.addEventListener('click', function(event) {
        if (event.target == contenidoDiv) {
            cerrarDiv();
        }
    });
}

function cerrarPanelAstronautas() {
    const panelAstronautas = document.getElementById('panel-astronautas');
    if (panelAstronautas) {
        panelAstronautas.style.display = 'none';}
        
    
    // Cerrar también el panel-astronauta
    cerrarPanelAstronauta();
}

function cerrarPanelAstronauta() {
    const panelAstronauta = document.getElementById('panel-astronauta');
    if (panelAstronauta) {
        panelAstronauta.style.display = 'none';
    }
}

function astronautas(popupToClose){
    if (popupToClose) {
        setTimeout(function(){
            popupToClose.remove();  
        }, 100);
    }
    mostrarPanelAstronautas();
}

function ver_solo_estacion(){
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

function pasar_src(source){
    document.getElementById('myvideo').setAttribute('src', source);
    document.getElementById('titulo-video').innerHTML=document.getElementById(source).innerHTML;
}

function quitar_source(){
    document.getElementById('myvideo').setAttribute('src', "");
    document.getElementById('myinfo').setAttribute('src', "");
}

UIkit.util.on('#modal-example', 'hidden', function() {
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
    var astronauta = astronautasGlobales.find(a => a.nombre === nombre);
    
    if (astronauta) {
        var panelAstronauta = document.getElementById('panel-astronauta');
        
        if (!panelAstronauta) {
            console.error('No se encontró el panel de astronauta');
            return;
        }
        
        var contenidoHTML = `
            <div class="panel-header">
                <h3>${astronauta.nombre || 'Nombre no disponible'}</h3>
                <button class="cerrar-panel">&times;</button>
            </div>
            <div class="panel-content">
                <img src="${astronauta.foto_url || '#'}" alt="${astronauta.nombre || 'Astronauta'}">
                <p>${astronauta.descripcion || 'Descripción no disponible'}</p>
                <p><strong>Nacionalidad:</strong> ${astronauta.nacionalidad || 'No disponible'}</p>
                <p><strong>Agencia:</strong> ${astronauta.agencia || 'No disponible'}</p>
                <p><strong>Tiempo en el espacio:</strong> ${astronauta.tiempo_espacio || 'No disponible'}</p>
                <p><strong>Misión actual:</strong> ${astronauta.mision_actual || 'No disponible'}</p>
            </div>
        `;
        
        panelAstronauta.innerHTML = contenidoHTML;
        panelAstronauta.style.display = 'block';
        
        // Hacer el panel dragable
        makeDraggable(panelAstronauta);

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
    }
}