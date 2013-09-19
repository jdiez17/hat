from flask import Flask, render_template, url_for, redirect

from flaskext.bcrypt import Bcrypt
from flask.ext.login import logout_user, login_required

from hat.views import LoginView, RegisterView, IndexView, LinkView, APIView
from hat.objects import db, login_manager

app = Flask(__name__)
app.config.from_object('config.Config')

Bcrypt(app)

db.init_app(app)
login_manager.init_app(app)

IndexView.register(app)
LoginView.register(app)
RegisterView.register(app)
LinkView.register(app)
APIView.register(app)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect('/')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8080, debug=True)
