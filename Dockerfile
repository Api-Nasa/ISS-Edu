# Utiliza una imagen base de Python
FROM python:3.9

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo requirements.txt al contenedor
COPY requirements.txt .

# Instala las dependencias de la aplicación
RUN pip install -r requirements.txt

# Copia todo el contenido del directorio actual al contenedor
COPY . .
# Establece la variable de entorno para Flask
ENV FLASK_APP=app.py  # Cambia esto al nombre de tu archivo principal
ENV FLASK_ENV=production  # Establece el entorno a producción
# Expone el puerto 5000 (o el puerto en el que se ejecute tu aplicación Flask)
EXPOSE 5000

# Comando para ejecutar tu aplicación Flask
CMD ["python", "app.py"]