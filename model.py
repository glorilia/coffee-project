from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Create a SQLAlchemy object named db
db = SQLAlchemy()


#*********
#********* Data model classes for the db (SQLAlchemy object) ***************#
#*********

class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    email = db.Column(db.String, 
                        unique=True)
    password = db.Column(db.String)

    # Relationships
    user_drinks = db.relationship('UserDrinks')
    user_aspects = db.relationship('UserAspects')


    def __repr__(self):
        return f'<User email={self.email} user_id={self.user_id}>'


class Shop(db.Model):
    """A coffee shop."""

    __tablename__ = 'shops'

    # The place_id, name, and address columns will come from 
    # information obtained from the Google Maps API
    place_id = db.Column(db.String,
                        unique=True,
                        nullable=False)
    name = db.Column(db.String)     # Not unique, shops can have many locations
    address_num = db.Column(db.Integer)
    address_street = db.Column(db.String)
    zipcode = db.Column(db.String)

    # Relationships
    drinks = db.relationship('Drink')
    aspects = db.relationship('Aspect')


    def __repr__(self):
        return f'<Shop name={self.name} address={self.address_num} {self.address_street}>'









# Connects the app entered as an argument to the db (SQLAlchemy object)
# and the hard-coded postgresql database of choice (here: coffee-project)
def connect_to_db(flask_app, db_uri='postgresql:///coffee_project', echo=True):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')



if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)