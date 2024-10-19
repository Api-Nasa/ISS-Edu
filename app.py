import json
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import time
import requests
import webbrowser
import xmltodict
from datetime import datetime, timedelta
from pymap3d import ecef2geodetic
from typing import List, Dict
import traceback
import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Inicializamos la aplicación Flask
app = Flask(__name__, static_folder='static', template_folder='templates', static_url_path='/static')
CORS(app)  # Habilitamos CORS para permitir solicitudes de diferentes orígenes

# Variables globales para almacenar la ubicación y velocidad de la ISS
ub = [0, 0]  # Array para longitud y latitud
velocidad_iss = 0
altitud_iss = 0
astronautas_cache = None  # Cache para almacenar detalles de astronautas

def obtener_ubicacion_iss():
    global ub, velocidad_iss, altitud_iss
    try:
        # Realizamos una solicitud a la API para obtener la ubicación de la ISS
        respuesta = requests.get("https://api.wheretheiss.at/v1/satellites/25544")
        datos = respuesta.json()  # Convertimos la respuesta a formato JSON
        
        if respuesta.status_code == 200:  # Verificamos si la solicitud fue exitosa
            # Actualizamos las variables globales con los datos obtenidos
            ub = [float(datos['longitude']), float(datos['latitude'])]
            velocidad_iss = float(datos['velocity'])
            altitud_iss = float(datos['altitude'])
            return ub, velocidad_iss, altitud_iss  # Retornamos los datos
        else:
            return ub, velocidad_iss, altitud_iss  # Retornamos los datos anteriores en caso de error
    except requests.RequestException:
        return ub, velocidad_iss, altitud_iss  # Retornamos los datos anteriores si ocurre una excepción

@app.route('/actualizar_ubicacion')
def actualizar_ubicacion():
    print("Llamada a actualizar_ubicacion")
    try:
        # Obtenemos la ubicación actual de la ISS
        ubicacion, velocidad, altitud = obtener_ubicacion_iss()
        return {
            'longitud': ubicacion[0],
            'latitud': ubicacion[1],
            'velocidad': velocidad,
            'altitud': altitud
        }
    except Exception as e:
        print(f"Error en actualizar_ubicacion: {str(e)}")
        return jsonify({
            'longitud': ub[0],
            'latitud': ub[1],
            'velocidad': velocidad_iss,
            'altitud': altitud_iss,
            'error': 'Se produjo un error al actualizar la ubicación'
        })

def obtener_pasos_iss(latitud, longitud, dias=10):
    api_key = "J9JWLD-V6A5DE-9G6Y54-5CR5"  # Clave API para acceder a los datos de pasos de la ISS
    url = f"https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/{latitud}/{longitud}/0/{dias}/300/&apiKey={api_key}"
    
    try:
        # Realizamos una solicitud a la API para obtener los pasos de la ISS
        respuesta = requests.get(url, timeout=10)
        respuesta.raise_for_status()  # Verificamos si la solicitud fue exitosa
        datos = respuesta.json()
        
        print("URL de la solicitud (sin clave API):", url.rsplit('&apiKey=', 1)[0])
        print("Respuesta completa de la API:", json.dumps(datos, indent=2))
        
        if 'error' in datos:
            raise Exception(f"Error de la API N2YO: {datos['error']}")
        
        if 'passes' not in datos:
            print("No se encontraron pasos en la respuesta de la API")
            return []
        
        pasos = datos['passes']  # Extraemos los pasos de la respuesta
        print(f"Número de pasos encontrados: {len(pasos)}")
        
        pasos_formateados = []  # Lista para almacenar los pasos formateados
        for paso in pasos:
            try:
                # Convertimos las marcas de tiempo a un formato legible
                inicio = datetime.utcfromtimestamp(paso['startUTC'])
                fin = datetime.utcfromtimestamp(paso['endUTC'])
                pasos_formateados.append({
                    "inicio": inicio.strftime("%Y-%m-%d %H:%M:%S"),
                    "fin": fin.strftime("%Y-%m-%d %H:%M:%S"),
                    "duracion": str(timedelta(seconds=paso['duration'])),
                    "elevacion_maxima": paso['maxEl']
                })
            except KeyError as e:
                print(f"Error al procesar un paso: {e}. Datos del paso: {paso}")
        
        print(f"Pasos formateados: {json.dumps(pasos_formateados, indent=2)}")
        return pasos_formateados  # Retornamos los pasos formateados
    except requests.RequestException as e:
        raise Exception(f"Error al obtener datos de pasos de la ISS: {str(e)}")
    except KeyError as e:
        raise Exception(f"Error al procesar la respuesta de la API: Clave no encontrada: {str(e)}")
    except Exception as e:
        raise Exception(f"Error inesperado: {str(e)}")

@app.route('/predecir_pasos', methods=['POST'])
def predecir_pasos():
    try:
        print("Datos recibidos:", request.json)
        datos = request.json
        latitud = datos.get('latitud')
        longitud = datos.get('longitud')
        
        if not latitud or not longitud:
            return jsonify({"error": "Se requieren latitud y longitud"}), 400
        
        pasos = obtener_pasos_iss(latitud, longitud)
        
        print(f"Número de pasos obtenidos: {len(pasos)}")
        print(f"Pasos a enviar al cliente: {json.dumps(pasos, indent=2)}")
        
        if not pasos:
            return jsonify({"mensaje": "No hay pasos visibles de la ISS para esta ubicación en los próximos días.", "pasos": []}), 200
        
        return jsonify({"mensaje": "Pasos de la ISS encontrados", "pasos": pasos}), 200
    except Exception as e:
        error_details = traceback.format_exc()
        app.logger.error(f"Error en predecir_pasos: {str(e)}\n{error_details}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

def obtener_y_procesar_datos_xml(max_reintentos=5, tiempo_espera=3):
    url_archivo = "https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.xml"
    intentos = 0  # Contador de intentos

    while intentos < max_reintentos:
        try:
            # Realizamos una solicitud para obtener datos en formato XML
            respuesta = requests.get(url_archivo)
            respuesta.raise_for_status()  # Verificamos si la solicitud fue exitosa
            
            # Convertimos el contenido XML a un diccionario
            data = xmltodict.parse(respuesta.content)  # Convertimos el contenido XML a un diccionario
            state_vectors = data['ndm']['oem']['body']['segment']['data']['stateVector']
            
            lista = []  # Lista para almacenar las coordenadas
            latitudes = []  # Lista para almacenar latitudes
            longitudes = []  # Lista para almacenar longitudes
            
            for vector in state_vectors:
                epoch = vector['EPOCH']
                x = float(vector['X']['#text']) * 1000  # Convertimos a metros
                y = float(vector['Y']['#text']) * 1000
                z = float(vector['Z']['#text']) * 1000
                
                fecha, hora = extraer_fecha_hora(epoch)  # Extraemos la fecha y hora
                lat, lon = cartesian_to_geodetic(x, y, z)  # Convertimos coordenadas cartesianas a geodésicas
                lista.append([lon, lat])  # Agregamos las coordenadas a la lista
                latitudes.append(lat)
                longitudes.append(lon)
            
            return lista, latitudes, longitudes  # Retornamos las listas de coordenadas

        except requests.ConnectionError:
            return render_template('sin_internet.html')  # Template para error de conexión
        except requests.RequestException as e:
            intentos += 1  # Incrementamos el contador de intentos
            print(f"Error al obtener o procesar el archivo XML (intento {intentos}): {str(e)}")
            if intentos < max_reintentos:
                print("Reintentando en {} segundos...".format(tiempo_espera))
                time.sleep(tiempo_espera)  # Esperamos antes de reintentar
            else:
                print("Se alcanzó el número máximo de reintentos. Retornando listas vacías.")
                return render_template('error_nasa.html')  # Template para error de NASA
    
    return [], [], []  # Retornamos listas vacías en caso de error después de los reintentos

@app.route('/mapa')
def mostrar_mapa():
    print("Accediendo a la ruta /mapa")
    ubicacion, velocidad, altitud = obtener_ubicacion_iss()
    lista, latitudes, longitudes = obtener_y_procesar_datos_xml()
    
    if not lista:
        return render_template('error_nasa.html')  # Template para error de NASA
    
    astronautas = obtener_todos_detalles_astronautas()
    return render_template('mapa.html', ubicacion=ubicacion, velocidad=velocidad, altitud=altitud, lista=lista, astronautas=astronautas)

@app.route('/')
def inicio():
    print("Accediendo a la ruta raíz")
    return render_template("index.html")

@app.route('/obtener_coordenadas_ciudad', methods=['GET'])
def obtener_coordenadas_ciudad():
    ciudad = request.args.get('buscador')
    lugares = []
    if not ciudad:
        return render_template('/componentes/datos-ciudad.html', ciudades="No se proporcionó ninguna ciudad", latitudes=0, longitudes=0)

    try:
        url = f"https://nominatim.openstreetmap.org/search?q={ciudad}&format=json"
        respuesta = requests.get(url, headers={'User-Agent': 'MiAplicacion/1.0'})
        datos = respuesta.json()

        if respuesta.status_code == 200 and datos:
            for lugar in datos:
                lugares.append([lugar['display_name'], lugar['lat'], lugar['lon']])
            return render_template('/componentes/datos-ciudad.html', ciudades=lugares)
        else:
            lugares.append([f"No se encontraron datos para: {ciudad}", "", ""])
            return render_template('/componentes/datos-ciudad.html', ciudades=lugares)

    except Exception as e:
        print(f"Error en la búsqueda de coordenadas: {str(e)}")
        lugares.append([f"Error en la búsqueda: {str(e)}", "", ""])
        return render_template('/componentes/datos-ciudad.html', ciudades=lugares)

pais=""
@app.route('/ciudades', methods=['GET'])
def ciudades():
    global pais
    pais = request.args.get('country')
    if not pais:
        return jsonify({"error": "No se proporcion un país"}), 400

    poblacion_minima = 200000  # Ajusta este valor según tus necesidades

    url = "https://countriesnow.space/api/v0.1/countries/population/cities/filter"
    payload = {
        "country": pais,
        "order": "dsc",
        "orderBy": "population",
        "limit": 1000  # Ajusta este límite según tus necesidades
    }

    try:
        respuesta = requests.post(url, json=payload, timeout=10)
        respuesta.raise_for_status()
        datos = respuesta.json()
        
        if 'data' in datos and isinstance(datos['data'], list):
            ciudades_filtradas = [
                ciudad['city'] 
                for ciudad in datos['data'] 
                if ciudad.get('populationCounts') and 
                   int(ciudad['populationCounts'][0]['value']) > poblacion_minima
            ]
            
            if ciudades_filtradas:
                try:
                    return render_template('/componentes/select-ciudades.html', ciudades=ciudades_filtradas, pais=pais)
                except Exception as e:
                    print(f"Error al renderizar la plantilla: {str(e)}")
                    return jsonify({"error": f"Error al renderizar la plantilla: {str(e)}"}), 500
            else:
                return jsonify({"error": f"No se encontraron ciudades con población mayor a {poblacion_minima} en {pais}"}), 404
        else:
            return jsonify({"error": f"Formato de datos inesperado para las ciudades de {pais}"}), 500
    
    except requests.Timeout:
        print("La solicitud excedió el tiempo de espera")
        return jsonify({"error": "La solicitud al servidor tardó demasiado"}), 504
    except requests.RequestException as e:
        print(f"Error en la solicitud: {str(e)}")
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 500
    except ValueError as e:
        print(f"Error al procesar JSON: {str(e)}")
        return jsonify({"error": "Error al procesar la respuesta del servidor"}), 500
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

def extraer_fecha_hora(epoch_str):
    dt = datetime.strptime(epoch_str, '%Y-%jT%H:%M:%S.%fZ')
    return dt.strftime('%Y-%m-%d'), dt.strftime('%H:%M:%S')

def cartesian_to_geodetic(x, y, z):
    lat, lon, alt = ecef2geodetic(x, y, z)
    return lat, lon

@app.route('/pasos', methods=['GET'])
def pasos():
  global pais
  ciudad = request.args.get('lista-ciudades')
  return render_template('/componentes/pasos.html',pais=pais,ciudad=ciudad)

def obtener_todos_detalles_astronautas():
    global astronautas_cache
    
    if astronautas_cache is not None:
        return astronautas_cache

    try:
        url_iss = "http://api.open-notify.org/astros.json"
        respuesta_iss = requests.get(url_iss)
        datos_iss = respuesta_iss.json()
        
        astronautas_iss = [astronauta['name'] for astronauta in datos_iss['people'] if astronauta['craft'] == 'ISS']
        
        astronautas_detallados = []
        
        for astronauta in astronautas_iss:
            # Hacer una llamada individual para cada astronauta
            nasa_api_key = "LcOsUb9QsY53AdyV9gpTyoQAoilOpz0zKwpR3Jph"
            url_nasa = f"https://images-api.nasa.gov/search?q={astronauta}&media_type=image"
            respuesta_nasa = requests.get(url_nasa)
            datos_nasa = respuesta_nasa.json()
            
            detalles = obtener_detalles_astronauta_optimizado(astronauta, datos_nasa)
            astronautas_detallados.append(detalles)
        
        astronautas_cache = astronautas_detallados
        return astronautas_detallados
    except Exception as e:
        print(f"Error al obtener datos de astronautas: {e}")
        return []

def obtener_detalles_astronauta_optimizado(nombre, datos_nasa):
    imagen_url = "https://via.placeholder.com/200x200.png?text=No+Image"
    descripcion = "No hay información adicional disponible."
    nacionalidad = "Desconocida"
    agencia = "ISS"
    fecha_nacimiento = "Desconocida"
    galeria_fotos = []
    
    if 'items' in datos_nasa['collection']:
        for item in datos_nasa['collection']['items']:
            if 'data' in item and item['data']:
                data = item['data'][0]
                if nombre.lower() in data.get('title', '').lower():
                    descripcion = data.get('description', descripcion)
                    if 'location' in data:
                        nacionalidad = data['location']
                    elif 'center' in data:
                        agencia = data['center']
                        nacionalidad = obtener_nacionalidad_por_agencia(agencia)
                    fecha_nacimiento = data.get('date_created', fecha_nacimiento)
                    if 'links' in item:
                        for link in item['links']:
                            if link.get('rel') == 'preview' and link.get('render') == 'image':
                                foto_url = link['href'].replace('~thumb', '~medium')
                                if imagen_url == "https://via.placeholder.com/200x200.png?text=No+Image":
                                    imagen_url = foto_url
                                else:
                                    galeria_fotos.append(foto_url)
    
    tiempo_espacio = (datetime.now() - datetime(2021, 4, 1)).days

    return {
        "nombre": nombre,
        "nave": "ISS",
        "foto_url": imagen_url,
        "galeria_fotos": galeria_fotos,  # Ahora no incluye la foto principal
        "descripcion": descripcion,
        "nacionalidad": nacionalidad,
        "agencia": agencia,
        "fecha_nacimiento": fecha_nacimiento,
        "tiempo_espacio": f"{tiempo_espacio} días",
        "mision_actual": "Expedición actual en la ISS"
    }

def obtener_nacionalidad_por_agencia(agencia):
    if "NASA" in agencia:
        return "Estados Unidos"
    elif "Roscosmos" in agencia:
        return "Rusia"
    elif "JAXA" in agencia:
        return "Japón"
    elif "ESA" in agencia:
        return "Europa"
    elif "CSA" in agencia:
        return "Canadá"
    else:
        return "Desconocida"

@app.route('/api/todos_astronautas')
def api_todos_astronautas():
    astronautas = obtener_todos_detalles_astronautas()
    return jsonify(astronautas)





if __name__ == '__main__':
  
    app.run(debug=True)
