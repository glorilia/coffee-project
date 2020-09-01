""" Server for the Coffee Project App"""

from flask import (Flask, render_template, request, session, redirect, jsonify)
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db
import crud
from datetime import datetime

# Throw errors for undefined variables in Jinja2
from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined


# ROUTES
@app.route('/')
def root():
    """Render the one page web app that's made w/ React"""
    return render_template('root.html')


# CATCH-ALL ROUTE
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('root.html')


# API ENDPOINTS
@app.route('/api/logout', methods=['POST'])
def process_logout():
    # Deletes user from session (log user out)
    del session['user_id']

    return jsonify({'message': "Logged Out"})

@app.route('/api/login', methods=['POST'])
def process_login():
    # Get data from user login form input
    # expecting {"email": "glo@gmail.com", "password": "real secret like"}
    
    print("************** In the server *****************")

    data = request.get_json()
    email = data['email']
    password = data['password']

    # Use email to check if this user is in the database
    user = crud.get_user_by_email(email=email)

    # If they're in the database, and passwords match, log them in
    if user and password == user.password:
        # Add user_id to the session (log user in)
        session["user_id"] = user.user_id
        status = 'success'
        message = 'Logged in! Success!'
        
    else:
        status = 'error'
        message = 'Incorrect email or password. Try again'
        
    return jsonify({'status': status, 'message':message})

@app.route('/api/create-account', methods=['POST'])
def create_new_account():
    # Get data from user to create a new account

    # expecting {"email": "glo@gmail.com", "password": "real secret like",
    # "homeZipcode": "90291"}
    print("************** In the server *****************")

    data = request.get_json()
    email = data['email']
    password = data['password']
    home_zipcode = data['homeZipcode']

    # Use email to check if this user is in the database
    user = crud.get_user_by_email(email=email)

    # If they're in the database, send message that they have an account
    if user:
        status = 'error'
        message = 'This email has an existing account. Try logging in.'
        
    else:
        # If they user is not in the db, create them!
        crud.create_user(email=email, password=password, home_zipcode=home_zipcode)
        status = 'success'
        message = 'Account created! Please log in.'
        
    return jsonify({'status': status, 'message':message})

@app.route('/api/get-user-information')
def get_user_info():
    # Get all information about a user when they're logged in

    # Get the user_id from the session
    user_id = session.get("user_id")

    # Query the db for the user
    user = crud.get_user_by_id(user_id)
    # zipcode = user.home_zipcode

    # Get all the user's user features
    user_features = crud.get_all_ufs_for_user(user)

    # Turn this list into a dictionary of dictionaries
    user_info = {
        # 'zipcode': zipcode,
        'drink': [],
        'shop_aspect': [] 
    }

    for uf in user_features:
        # Add to the list under the their feature_type key
        
        user_info[uf.feature.type.name].append(
            {
            'user_feature_id': uf.user_feature_id,
            'feature': uf.feature.name,
            'shop': uf.shop.name,
            'nickname': uf.nickname,
            'details': uf.details,
            'ranking': uf.ranking,
            'last_updated': uf.last_updated
            }
        )
   
    # User has list of dictionaries for 'drink' and 'shop_aspects'
    # print(user_info['shop_aspect'])

    return jsonify(user_info)

@app.route('/api/add-user-feature', methods=['POST'])
def add_user_feature():
    # Takes form input from the client and puts it in the database

    data = request.get_json()
    feature_name = data['featureName']
    nickname = data['nickname']
    details = data['details']
    liked = data['liked']
    shop_info = data['shop']

    # Get the user_id from the session
    user_id = session.get("user_id")
    # Query the db for the user
    user = crud.get_user_by_id(user_id)

    # Get the feature
    feature = crud.get_feature_by_name(feature_name)

    # Get the shop
    # see if there's a shop in the table with the same shop.shop_id id
    possible_shop = crud.get_shop_by_id(shop_info['shop_id'])
    if possible_shop:
        shop = possible_shop
        # if there is, make shop= that shop
    else:
        shop_id, name, address_street, lat, lng = shop_info.values()
        shop = crud.create_shop(shop_id=shop_id, name=name, address_street=address_street,
                                lat=lat, lng=lng)
        # if there isn't, create a new shop and set shop = to that new shop

    last_updated = datetime.now()

    user_feature = crud.create_user_feature(
                                user=user,
                                feature=feature,
                                shop=shop,
                                details=details,
                                nickname=nickname,
                                last_updated=last_updated)

    print(f'our new user feature: {user_feature}')
    
    uf_id = None
    feature_name = None
    if user_feature:
        uf_id = user_feature.user_feature_id
        feature_name = user_feature.feature.name
        status = "success"
        message = f"Your {feature_name} has been added"
    else:
        status ="Error"
        message = "Something went wrong, please try again."

    return jsonify({'status': status, 'message': message, 'need_to_rank': liked,
                    'uf_id': uf_id, 'feature_name': feature_name})


@app.route('/api/get-types')
def get_types():
    types = crud.get_all_types()
    all_types = []
    for a_type in types:
        all_types.append({'id': a_type.type_id, 'name': a_type.name})

    return jsonify(all_types)

@app.route('/api/get-features/<feature_type>')
def get_features(feature_type):
    features = crud.get_all_features()
    features_of_type = []
    for feature in features:
        if feature.type.name == feature_type:
            features_of_type.append({'id': feature.feature_id, 'name': feature.name})

    return jsonify(features_of_type)

@app.route('/api/rankings/<to_rank>')
def get_rankings(to_rank):
    feature_name = to_rank
    feature = crud.get_feature_by_name(feature_name)

    user_id = session.get("user_id")
    user = crud.get_user_by_id(user_id)

    user_features = None
    if feature:
        user_features = crud.get_specific_feature_ufs_for_user(user=user, feature=feature)
    else:
        shop_name = to_rank
        shop = crud.get_shop_by_name(shop_name)
        user_features= crud.get_specific_shop_ufs_for_user(user=user, shop=shop)

    uf_data = []
    for uf in user_features:
        uf_data.append(
            {
            'user_feature_id': uf.user_feature_id,
            'feature': uf.feature.name,
            'shop': uf.shop.name,
            'nickname': uf.nickname,
            'details': uf.details,
            'ranking': uf.ranking,
            'last_updated': uf.last_updated
            }
        )

    return jsonify(uf_data)

@app.route('/api/update-rankings', methods=['POST'])
def update_user_feature_rankings():
    # expecting to receive a list of dictionaries (or objects?)
    data = request.get_json()
    for index, updated_user_feature in enumerate(data):
        user_feature_id = updated_user_feature['user_feature_id']
        new_ranking = index + 1
        crud.update_user_feature_ranking(user_feature_id=user_feature_id, new_ranking=new_ranking)

    message = 'Saved!'

    return jsonify({'message': message})

@app.route('/api/specific-uf-info/<user_feature_id>')
def get_specific_uf_info(user_feature_id):
    user_feature = crud.get_user_feature_by_id(user_feature_id)
    uf_data = {
        'user_feature_id': user_feature.user_feature_id,
        'feature': user_feature.feature.name,
        'shop': user_feature.shop.name,
        'nickname': user_feature.nickname,
        'details': user_feature.details,
        'ranking': user_feature.ranking,
        'last_updated': user_feature.last_updated
    }

    return jsonify(uf_data)

@app.route('/api/edit-user-feature', methods=['POST'])
def edit_user_feature():
    # expecting to receive a dictionary with nickname, details, and liked as keys
    # get dictionary of data from form on front-end
    data = request.get_json()

    # get the user_feature_id and use it to get the user_feature from the db
    user_feature_id = data['userFeatureId']
    user_feature = crud.get_user_feature_by_id(user_feature_id)

    updated_nickname = data['nickname']
    updated_details = data['details']
    updated_liked = data['liked']

    changes_made = 0

    if updated_nickname != user_feature.nickname:
        changes_made += 1
        crud.update_user_feature_nickname(user_feature_id=user_feature_id,
                                        new_nickname=updated_nickname)
    if updated_details != user_feature.details:
        changes_made += 1
        crud.update_user_feature_details(user_feature_id=user_feature_id,
                                        new_details=updated_details)
    current_ranking = user_feature.ranking
    current_liked = current_ranking > 0 

    need_to_rerank = False
    if updated_liked != current_liked:
        changes_made += 1
        # if they now dislike it, rerank here and change the edited uf's ranking to 0
        if updated_liked == False:
            feature = user_feature.feature
            user_id = session.get("user_id")
            user = crud.get_user_by_id(user_id)
            user_features = crud.get_specific_feature_ufs_for_user(user=user, feature=feature)
            ranked_user_features = list(filter(lambda uf: uf.ranking > 0, user_features))
            for uf in ranked_user_features:
                if uf.ranking == current_ranking:
                    crud.update_user_feature_ranking(user_feature_id=uf.user_feature_id,
                                                    new_ranking=0)
                elif uf.ranking > current_ranking:
                    new_ranking = uf.ranking - 1
                    crud.update_user_feature_ranking(user_feature_id=uf.user_feature_id,
                                                    new_ranking=new_ranking)
            need_to_rerank = False
        #if they now like it, note it somehow?
        else:
            need_to_rerank = True

    if changes_made > 0:
        crud.update_user_feature_last_updated(user_feature_id=user_feature_id,
                                        new_last_updated=datetime.now())

    return jsonify({'message': 'Saved changes', 'need_to_rerank': need_to_rerank })

@app.route('/api/add-new-feature', methods=['POST'])
def add_new_feature():
    # expecting a dict with name, description, and type
    data = request.get_json()
    name = data['name']
    description = data['description']
    feature_type_name = data['type']

    feature_type = crud.get_type_by_name(feature_type_name)

    feature = crud.create_feature(name=name, feature_type=feature_type, description=description)

    print(f'********************* feature is: {feature}************')
    message = f"Your new {feature_type_name}, {feature.name}, has been added!"

    return jsonify({'message': message})



if __name__ == '__main__':
    # Connect to db first, then app can access it.
    # Set debug to True before accessing the Debug Toolbar
    app.debug = True
    connect_to_db(app)
    DebugToolbarExtension(app)
    app.run(host='0.0.0.0')