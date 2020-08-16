""" Models for Coffee Project App """

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Create a SQLAlchemy object named db
db = SQLAlchemy()


#********* Data model classes for the db (SQLAlchemy object) ***************#


class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    email = db.Column(db.String, 
                        unique=True,
                        nullable=False)
    password = db.Column(db.String,
                        nullable=False)
    home_zipcode = db.Column(db.String)

    # Relationships
    user_features = db.relationship('UserFeature')

    def __repr__(self):
        return f'<User email={self.email} user_id={self.user_id}>'


class Shop(db.Model):
    """A coffee shop."""

    __tablename__ = 'shops'

    # The place_id (shop_id in here), name, and address columns will come from 
    # information obtained from the Google Maps API
    shop_id = db.Column(db.String,
                        primary_key=True)
    name = db.Column(db.String)     # Not unique, shops can have many locations
    address_num = db.Column(db.Integer)
    address_street = db.Column(db.String)
    zipcode = db.Column(db.String)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    # Relationships
    user_features = db.relationship('UserFeature')

    def __repr__(self):
        return f'<Shop name={self.name} address={self.address_num} {self.address_street}>'
        # repr doesn't include shop_id (place_id) bc it can be veeerryy long


class Type(db.Model):
    """A type of feature, usually drink or aspect"""

    __tablename__ = "types"

    type_id = db.Column(db.Integer,
                        primary_key=True,
                        autoincrement=True)
    name = db.Column(db.String,
                        nullable=False)

    # Relationships
    features = db.relationship('Feature')

    def __repr__(self):
        return f'<Type name={self.name} type_id={self.type_id}>'


class Feature(db.Model):
    """A feature, like a latte, or privacy."""

    __tablename__ = "features"

    feature_id = db.Column(db.Integer,
                        primary_key=True,
                        autoincrement=True)
    name = db.Column(db.String,
                        nullable=False)
    type_id = db.Column(db.Integer,
                        db.ForeignKey('types.type_id'),
                        nullable=False)
    description = db.Column(db.String,
                        nullable=False)

    # Relationships
    type = db.relationship('Type')
    user_features = db.relationship('UserFeature')

    def __repr__(self):
        return f'<Feature name={self.name} feature_id={self.feature_id}>'


class UserFeature(db.Model):
    """A drink a user has added."""

    __tablename__ = "user_features"

    user_feature_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    feature_id = db.Column(db.Integer,
                        db.ForeignKey('features.feature_id'),
                        nullable=False)
    shop_id = db.Column(db.String,
                        db.ForeignKey('shops.shop_id'),
                        nullable=False)
    details = db.Column(db.String,
                        nullable=False)
    nickname = db.Column(db.String)
    ranking = db.Column(db.Integer,
                        default=0)
    last_updated = db.Column(db.DateTime)

    # Relationships
    user = db.relationship('User')
    shop = db.relationship('Shop')
    feature = db.relationship('Feature')

    def __repr__(self):
        return f'<UserFeature user_feature_id={self.user_feature_id} ranking={self.ranking}>'


#********* END OF Data model classes for the db (SQLAlchemy object) ***************#


# Connects the app entered as an argument to the db (SQLAlchemy object)
# and the hard-coded postgresql database of choice (here: coffee-project)
def connect_to_db(flask_app, db_uri='postgresql:///coffee_project', echo=True):
    """ Connects the flask_app to the default postresql database. """
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

    # Only need to run when creating (or re-creating) the db tables
    # db.create_all()