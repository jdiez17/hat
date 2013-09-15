from flask.ext.classy import FlaskView, route
from flask.ext.login import login_user, current_user

from flask import render_template, request, redirect, url_for, flash

from .objects import User, Link

class IndexView(FlaskView):
    route_base = '/'

    def index(self):
        if not current_user.is_authenticated():
            return redirect(url_for('LoginView:index'))

        links = current_user.links.all() 
        return render_template("index.html", links=links)

class LinkView(FlaskView):
    def test(self):
        l = Link.save('Caca', 'http://google.com', current_user)
        return l.id

class LoginView(FlaskView):
    def index(self):
        return render_template("login.html")

    def post(self):
        email = request.form['email']
        password = request.form['password']

        print email, password

        u = User.login(email, password)
        if not u:
            return redirect(url_for('LoginView:index'))

        login_user(u)
        return redirect(url_for('IndexView:index'))

class RegisterView(FlaskView):
    def index(self):
        return render_template("register.html")
    
    def post(self):
        email = request.form['email']
        password = request.form['password']

        validation = {
            "You must provide an email": len(email),
            "You must provide a password": len(password),
        }

        valid = True 
        for k in validation:
            v = validation[k]
            if not v:
                valid = False
                flash(k)

        if not valid:
            return redirect(url_for('RegisterView:index'))

        u = User.register(email, password)
        if u is None:
            flash("Email already registered")
            return redirect(url_for('RegisterView:index'))
        
        # Login user, redirect to index
        login_user(u)

        return redirect(url_for('IndexView:index'))
