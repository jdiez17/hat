from flask.ext.classy import FlaskView, route
from flask.ext.login import login_user, current_user

from flask import render_template, request, redirect, url_for, flash

from .objects import User, Link
from .decorators import json_output

class IndexView(FlaskView):
    route_base = '/'

    def index(self):
        if not current_user.is_authenticated():
            return render_template("landing.html") 

        links = current_user.links.order_by(Link.id.desc()).all()
        tags = current_user.tags.all()
        return render_template("index.html", links=links, tags=tags)

class LinkView(FlaskView):
    pass

class APIView(FlaskView):
    @json_output
    @route("/link", methods=['POST'])
    def link(self):
        title = request.form.get("title")
        url = request.form.get("url")
        tags = request.form.getlist("tags[]")

        l = Link.save(title, url, current_user, tags)

        if l.id:
            return {'status': 'ok', 'id': l.id}
        else:
            return {'status': 'bad_request'}, 400

    @json_output
    @route("/link", methods=['DELETE'])
    def link_delete(self):
        id = request.form.get("id")
        link = Link.query.get(id)

        if not link:
            return {'status': 'not_found'}, 404

        if not current_user.is_owner_of(link):
            return {'status': 'unauthorized'}, 401

        # At this point we're ready to delete

        link.delete()
        return {'status': 'ok'}

class LoginView(FlaskView):
    def index(self):
        return render_template("login.html")

    def post(self):
        email = request.form['email']
        password = request.form['password']

        u = User.login(email, password)
        if not u:
            flash("Email or password incorrect")
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
