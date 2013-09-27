from flask.ext.classy import FlaskView, route
from flask.ext.login import login_user, current_user

from flask import render_template, request, redirect, url_for, flash

from string import digits

from .objects import User, Link, Tag, tags_mapper, session
from .decorators import json_output

class IndexView(FlaskView):
    route_base = '/'

    def index(self):
        if not current_user.is_authenticated():
            return render_template("landing.html") 

        links = current_user.links.order_by(Link.id.desc()).all()
        tags = current_user.tags
        return render_template("index.html", links=links, tags=tags)

class TagView(FlaskView):
    def get(self, tag):
        tag = Tag.query.filter_by(label=tag, user=current_user).first()
        if not tag:
            return redirect(url_for('IndexView:index'))

        links = tag.links.order_by(Link.id.desc()).all()
        tags = current_user.tags
        return render_template("index.html", links=links, tags=tags, active_tag=tag.label)

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

    @json_output
    @route("/link/<id>", methods=['PUT'])
    def link_put(self, id):
        link = Link.query.get(id)

        if not link:
            return {'status': 'not_found'}, 404

        if not current_user.is_owner_of(link):
            return {'status': 'unauthorized'}, 401
        
        
        link.title = request.form.get("title")
        link.link = request.form.get("url")
        link.tags = request.form.getlist("tags[]")

        session.commit()

        return {'status': 'ok'}

    @json_output
    @route("/link/by_tag/<tag>")
    def link_tag(self, tag):
        if tag == "*":
            links = current_user.links
        else:
            ids = [tag] if "+" not in tag else tag.split("+")

            # First, get the tags
            ids = map(lambda t: Tag.query.filter_by(label=t).first(), ids) 
            ids = filter(lambda t: t is not None, ids)
            ids = map(lambda i: i.id, ids) 

            # Then we get the links with a tag id in `tags`
            links = Link.query. \
                filter(Link.id == tags_mapper.c.link_id, tags_mapper.c.tag_id.in_(ids)). \
                order_by(Link.id.desc())


        links = map(lambda l: l.dict(), links)
        return {'status': 'ok', 'links': links}

    @json_output
    def tags(self):
        return {'status': 'ok', 'tags': current_user.tags}

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
        validators = {
            ("email_address_invalid",
             '@' in email and '.' in email),
            ("password_too_short",
             len(password) >= 8),
            ("password_needs_digits",
             any(char in digits for char in password))
            ("password_needs_nondigits",
             not all(char in digits for char in password))
        }
        validation_errors = {error for error, valid in validators
                             if not valid}
        if validation_errors:
            flash(error_messages[validation_errors])
            return redirect(url_for('RegisterView:index'))

        u = User.register(email, password)
        if u is None:
            flash("Email already registered")
            return redirect(url_for('RegisterView:index'))
        
        # Login user, redirect to index
        login_user(u)

        return redirect(url_for('IndexView:index'))
