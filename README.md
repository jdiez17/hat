# hat
Hat is an open source bookmark management tool.

# Pretty picture

![](https://mediacru.sh/rE_CwXVyw3Jl.png)

# License

This software uses the MIT license. Read `LICENSE.md` for more details.

# Installation

To install Hat from scratch on your server, you must first invent the universe.

Once you've done that, clone Hat:

    git clone git@github.com:jdiez17/hat /home/service/webapps/hat

Create a virtual environment

    virtualenv hat --no-site-packages --python=python27

Install the requirements

    pip install -r requirements.txt

And fill in a config.py. Here's a template:

    class Config(object):
        DEBUG = False 
        TESTING = False 
        
        SQLALCHEMY_DATABASE_URI = "mysql://hat:password@host/database"
        SECRET_KEY = "correct horse battery staple"

If everything went according to plan, you will be able to run `app.py`:

    $ python app.py 
    * Running on http://0.0.0.0:8080/

Hat will create the database during startup, so you don't have to worry about any of that.

Note that you will need a MySQL server. I recommend using MariaDB, but it is up to you.
