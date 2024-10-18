# app.py
from flask import Flask, session, redirect, url_for, request

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'  # Necesaria para usar sesiones

@app.route('/')
def home():
    return "¡Hola, mundo! <a href='/login'>Iniciar sesión</a>"

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']  # Almacena el nombre de usuario en la sesión
        return redirect(url_for('profile'))
    return '''
        <form method="post">
            Nombre de usuario: <input type="text" name="username">
            <input type="submit" value="Iniciar sesión">
        </form>
    '''

@app.route('/profile')
def profile():
    if 'username' in session:
        return f'¡Hola, {session["username"]}! <a href="/logout">Cerrar sesión</a>'
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('username', None)  # Elimina el nombre de usuario de la sesión
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)