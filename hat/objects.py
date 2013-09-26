from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flaskext.bcrypt import generate_password_hash, check_password_hash

from datetime import datetime

db = SQLAlchemy()
session = db.session

login_manager = LoginManager()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True)
    pwdhash = db.Column(db.String(100))

    def __init__(self, **kw):
        for k in kw:
            setattr(self, k, kw.get(k))

    @classmethod
    def register(cls, email, password):
        if session.query(cls.query.filter_by(email=email).exists()).scalar():
            return None

        pwdhash = generate_password_hash(password)
        u = cls(email=email, pwdhash=pwdhash)

        session.add(u)
        session.commit()

        return u

    @classmethod
    def login(cls, email, password):
        u = cls.query.filter_by(email=email).first()
        if u is None:
            return None
       
        if check_password_hash(u.pwdhash, password):
            return u
        return None

    @property
    def tags(self):
        return [tag.label for tag in self._tags]

    def is_authenticated(self):
        return True

    def is_anonymous(self):
        return False

    def is_active(self):
        return True

    def get_id(self):
        return unicode(self.id)

    def is_owner_of(self, obj):
        return obj.user_id == self.id

tags_mapper = db.Table('tags_mapper', # Maps link <-> tag, many-to-many
    db.Column('link_id', db.Integer, db.ForeignKey('link.id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
)

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.Text)
    link = db.Column(db.Text)
    #_tags = db.Column(db.Text)
    date = db.Column(db.DateTime)
   
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref=db.backref('links', lazy='dynamic'))

    _tags = db.relationship('Tag', secondary=tags_mapper, backref=db.backref('links', lazy='dynamic'))

    @property
    def tags(self):
        return [tag.label for tag in self._tags]

    @tags.setter
    def tags(self, tags):
        if len(tags):
            tags = map(lambda t: Tag.save(t, self.user), tags) # Create all the tags

        self._tags = tags 

    def __init__(self, title, link, user, tags=[]):
        self.title = title
        self.link = link
        self.user = user
        self.tags = tags

        self.date = datetime.utcnow()

    @classmethod
    def save(cls, *args):
        inst = cls(*args)
        session.add(inst)
        session.commit()

        return inst

    def dict(self):
        return {
            'title': self.title,
            'url': self.link,
            'tags': self.tags,
            'id': self.id
        }

    def delete(self):
        empty_tags = filter(lambda tag: tag.links.count() <= 1, self.tags)
        session.delete(self)
        for tag in empty_tags:
            session.delete(tag)
        session.commit()

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    label = db.Column(db.String(length=255))

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref=db.backref('_tags', lazy='dynamic'))

    def __init__(self, label, user):
        self.label = label
        self.user = user

    @classmethod
    def save(cls, label, user):
        inst = cls.query.filter_by(label=label, user=user).first()
        if inst:
            return inst # Don't create a Tag if it already exists

        inst = cls(label, user)
        session.add(inst)
        session.commit()

        return inst
    
    def __repr__(self):
        return self.label

@login_manager.user_loader
def load_user(uid):
    return User.query.get(int(uid))
