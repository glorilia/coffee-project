"""Script to seed database!
Do all the boring work for us. Thanks python <3"""

# importing os and libraries
import os
import json
from random import choice, randint
from datetime import datetime

# importing files we made in this directory
import crud
import model
import server

# Dropping and creating the db (in case it was there before)
os.system('dropdb coffee_project')
os.system('createdb coffee_project')

# Connecting our db to our Flask app
model.connect_to_db(server.app)