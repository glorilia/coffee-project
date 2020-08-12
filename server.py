from flask import (Flask, render_template, request, session, redirect)
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db

# Throw errors for undefined variables in Jinja2
from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined