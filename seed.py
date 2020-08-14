"""Script to seed database!
Do all the boring work for us. Thanks python <3"""

# importing os and libraries
import os
import json
from random import choice, randint
from datetime import datetime
from faker import Faker

# importing files we made in this directory
import crud
import model
import server

# Dropping and creating the db (in case it was there before)
os.system('dropdb coffee_project')
os.system('createdb coffee_project')

# Connecting our db to our Flask app
model.connect_to_db(server.app)

# Creating our tables from classes inherited from db.model
model.db.create_all()

# Constructing a Faker object to fake data with
faker = Faker()


#*************** Creating Database Table Data ******************************#

# SHOP DATA
# This shop data comes from a places search API endpoint
# Load places data and from a json to python readable
with open('data/places-test.json') as p:
    places_data = json.loads(p.read())

all_shops_in_db = []

# Loop over places_data list of dictionaries
for place in places_data:
    # Get the lat and lng of the place
    shop_lat = place["geometry"]["location"]["lat"]
    shop_lng = place["geometry"]["location"]["lng"]

    # Get the name and id
    shop_name = place["name"]
    shop_id = place["place_id"]

    # Create a new shop and add to the db
    db_shop = crud.create_shop(lat=shop_lat, 
                                lng=shop_lng, 
                                name=shop_name, 
                                shop_id=shop_id,
                                )
    # Add the new shop to the list of overall shops
    all_shops_in_db.append(db_shop)

# TYPE DATA
# These will be the only two types for now
drink = crud.create_type('drink')
shop_aspect = crud.create_type('shop_aspect')

# FEATURE DATA
# This data is hard coded because I couldn't figure out a better way
# creating shop_aspect features
sa1 = crud.create_feature(name='privacy', type=shop_aspect, description="Low risk of being disturbed")
sa2 = crud.create_feature(name='music', type=shop_aspect, description="Play good music")
sa3 = crud.create_feature(name='volume', type=shop_aspect, description="Not too loud, not too quite")
sa4 = crud.create_feature(name='wifi', type=shop_aspect, description="Reliable connection")

# creating drink features
d1 = crud.create_feature(name='latte', type=drink, description="Espresso with steamed milk")
d2 = crud.create_feature(name='iced latte', type=drink, description="Espresso with milk over ice")
d3 = crud.create_feature(name='matcha latte', type=drink, description="Matcha tea with steamed milk")
d4 = crud.create_feature(name='drip coffee', type=drink, description="Regular cup of coffee")
d5 = crud.create_feature(name='cold brew', type=drink, description="Cold brewed coffee")
d6 = crud.create_feature(name='black tea', type=drink, description="Black tea")
d7 = crud.create_feature(name='cappuccino', type=drink, description="Espresso with steamed milk and foam")
d8 = crud.create_feature(name='pour over', type=drink, description="pour over coffee")
d9 = crud.create_feature(name='iced matcha latte', type=drink, description="Matcha tea with milk over ice")
d10 = crud.create_feature(name='frappe', type=drink, description="Blended ice coffee drink")

all_features = [sa1, sa2, sa3, sa4, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10]

# USER DATA
# These users are made using faker. This loop makes 10 users
for _ in range(10):
    email = f'{faker.email()}'
    password = f'{faker.word()}'
    home_zipcode = f'{faker.postcode()}'

    user = crud.create_user(email=email, password=password, home_zipcode=home_zipcode)

    # USER_FEATURES DATA
    # Will add rankings later
    # Create 20 userfeatures for every user
    for _ in range(20):
        random_feature = choice(all_features)
        random_shop = choice(all_shops_in_db)
        details = faker.sentence(nb_words=8)
        last_updated = datetime.now()
        liked = choice([True, False])

        user_feature = crud.create_user_feature(
                                    user=user,
                                    feature=random_feature,
                                    shop=random_shop,
                                    details=details,
                                    last_updated=last_updated,                                
                                    )

# MORE USER_FEATURES DATA
# Rank the already made features
crud.set_seed_rankings(crud.get_all_users())













