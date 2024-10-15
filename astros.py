import requests,json,time

def obtener_astronautas():
  
    url = "http://api.open-notify.org/astros.json"
    intentos = 3
    espera = 2

    for intento in range(intentos):
        try:
            respuesta = requests.get(url)
            respuesta.raise_for_status()  # Lanza una excepción para códigos de estado HTTP erróneos
            data = respuesta.json()
            return data['people']
        except (requests.RequestException, json.JSONDecodeError) as e:
            print(f"Error en el intento {intento + 1}: {e}")
            if intento < intentos - 1:
                print(f"Reintentando en {espera} segundos...")
                time.sleep(espera)
            else:
                print("No se pudo obtener la información después de varios intentos.")
                return []



