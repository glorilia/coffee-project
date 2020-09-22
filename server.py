""" Server for the Coffee Project App"""

from flask import (Flask, render_template, request, session, redirect, jsonify)
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db
import requests
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
    del session['user_id'] # Deletes user from session (log user out)
    return jsonify({'message': "Logged Out"})

@app.route('/api/login', methods=['POST'])
def process_login(): # Get data from user login form input
    # expecting {"email": "glo@gmail.com", "password": "real secret like"}
    data = request.get_json()
    email = data['email']
    password = data['password']
    # Use email to check if this user is in the database
    user = crud.get_user_by_email(email=email)
    # If they're in the database, and passwords match, log them in
    if user and password == user.password:
        session["user_id"] = user.user_id  # Add user_id to the session (log user in)
        status = 'success'
        message = 'Logged in! Success!'
    else:
        status = 'error'
        message = 'Incorrect email or password. Try again.'

    return jsonify({'status': status, 'message':message})

@app.route('/api/create-account', methods=['POST'])
def create_new_account():
    # Get data from user to create a new account

    # expecting {"email": "glo@gmail.com", "password": "real secret like",
    # "homeZipcode": "90291"}
    data = request.get_json()
    email = data['email']
    password = data['password']
    home_zipcode = data['homeZipcode']

    # Request the geocoder api to get the lat and lng of this zipcode
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    payload = {
        "key": "AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY",
        "components": f"postal_code:{home_zipcode}"
    }
    # res = requests.get(url=url, params=payload)
    # res_data = res.json()
    # lat=res_data['results'][0]['geometry']['location']['lat']
    # lng=res_data['results'][0]['geometry']['location']['lng']
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

@app.route('/api/get-user-information/<view>')
def get_user_info(view):
    # Get view-base information about a user when they're logged in

    # Get the user_id from the session
    user_id = session.get("user_id")
    # Query the db for the user
    user = crud.get_user_by_id(user_id)
    # Get all the user's user features
    user_features = crud.get_all_ufs_for_user(user)
    user_info = []  # will be filled with a dict for each user feature, as detailed below
    for uf in user_features:
        user_info.append(
            {
            'user_feature_id': uf.user_feature_id,
            'feature': { 
                'name': uf.feature.name, 
                'feature_id': uf.feature.feature_id, 
                'description': uf.feature.description,
                'type_name': uf.feature.type.name
                },
            'shop': { 
                'name': uf.shop.name, 
                'shop_id': uf.shop.shop_id, 
                'lat': uf.shop.lat, 
                'lng': uf.shop.lng
                },
            'nickname': uf.nickname,
            'details': uf.details,
            'ranking': uf.ranking,
            'last_updated': uf.last_updated
            }
        )
    
    organized_user_info = {}

    if view == 'shops':
        for uf in user_info: # go through array of user feature dicts
            if uf['shop']['shop_id'] in organized_user_info: 
                # if the shop_id is already in the organized_user_info dict
                # add the uf to its all_user_features liked or disliked list
                if uf['ranking'] > 0:
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['liked'].append(uf)
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['liked'].sort(key=lambda item: item.get('ranking'))
                else:
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['disliked'].append(uf)
            else: # if the shop_id is not in organized_user_info dict,
                # use its shop_id as a key and make its value a dict w/ name string and ufs being
                # list a liked and a disliked list.
                if uf['ranking'] > 0:
                    organized_user_info[uf['shop']['shop_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['shop']['name'],
                        'all_user_features': {
                            'liked': [uf],
                            'disliked': []
                        }
                    }
                else:
                    organized_user_info[uf['shop']['shop_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['shop']['name'],
                        'all_user_features': {
                            'liked': [],
                            'disliked': [uf]
                        }
                    }
        # makes organized_user_info look like: {
        #   'ChIJaVGAwidHmYARy8OSQcTXNgc' : {
        #       'name': 'Purple Bean',
        #       'user_features_list': {
        #           liked: [
            #           {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
            #           {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #           ],
        #           disliked: [
            #           {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
            #           {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #           ]
        #       }
        #   },
        # }
    else: # goes here if the view is either drinks or shopAspects
        # filter user_info by drinks or shop_aspect from type_name
        if view == 'drinks':
            user_info = list(filter(lambda uf: uf['feature']['type_name'] == 'drink', user_info))
        else:
            user_info = list(filter(lambda uf: uf['feature']['type_name'] == 'shop_aspect', user_info))
        # use this new user_info to put data into organized_user_info dict
        for uf in user_info: # go through array of user feature dicts
            if uf['feature']['feature_id'] in organized_user_info: 
                # if the feature_id is already in the organized_user_info dict
                # add the uf to its all_user_features liked or disliked list
                if uf['ranking'] > 0:
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['liked'].append(uf)
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['liked'].sort(key=lambda item: item.get('ranking'))

                else:
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['disliked'].append(uf)
            else: # if the feature_id is not in organized_user_info dict,
                # use its feature_id as a key and make its value a dict w/ name string and ufs being
                # list a liked and a disliked list.
                if uf['ranking'] > 0:
                    organized_user_info[uf['feature']['feature_id']] = {
                        # 'lat': uf['shop']['lat'],
                        # 'lng': uf['shop']['lng'],
                        'name': uf['feature']['name'],
                        'all_user_features': {
                            'liked': [uf],
                            'disliked': []
                        }
                    }
                else:
                    organized_user_info[uf['feature']['feature_id']] = {
                        # 'lat': uf['shop']['lat'],
                        # 'lng': uf['shop']['lng'],
                        'name': uf['feature']['name'],
                        'all_user_features': {
                            'liked': [],
                            'disliked': [uf]
                        }
                    }

    return jsonify(organized_user_info)


@app.route('/api/all-information/<view>')
def get_all_information(view):
    # Get the user_id from the session
    user_id = session.get("user_id")
    # Query the db for the user
    user = crud.get_user_by_id(user_id)
    # Get all the user's user features
    user_features = crud.get_all_ufs_for_user(user)
    user_info = []  # will be filled with a dict for each user feature, as detailed below
    for uf in user_features:
        user_info.append(
            {
            'user_feature_id': uf.user_feature_id,
            'feature': { 
                'name': uf.feature.name, 
                'feature_id': uf.feature.feature_id, 
                'description': uf.feature.description,
                'type_name': uf.feature.type.name
                },
            'shop': { 
                'name': uf.shop.name, 
                'shop_id': uf.shop.shop_id, 
                'lat': uf.shop.lat, 
                'lng': uf.shop.lng
                },
            'nickname': uf.nickname,
            'details': uf.details,
            'ranking': uf.ranking,
            'last_updated': uf.last_updated
            }
        )
    
    organized_user_info = {}

    if view == 'shops':
        for uf in user_info: # go through array of user feature dicts
            if uf['shop']['shop_id'] in organized_user_info: 
                # if the shop_id is already in the organized_user_info dict
                # add the uf to its all_user_features liked or disliked list
                if uf['ranking'] > 0:
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['liked'].append(uf)
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['liked'].sort(key=lambda item: item.get('ranking'))
                else:
                    organized_user_info[uf['shop']['shop_id']]['all_user_features']['disliked'].append(uf)
            else: # if the shop_id is not in organized_user_info dict,
                # use its shop_id as a key and make its value a dict w/ name string and ufs being
                # list a liked and a disliked list.
                if uf['ranking'] > 0:
                    organized_user_info[uf['shop']['shop_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['shop']['name'],
                        'all_user_features': {
                            'liked': [uf],
                            'disliked': []
                        }
                    }
                else:
                    organized_user_info[uf['shop']['shop_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['shop']['name'],
                        'all_user_features': {
                            'liked': [],
                            'disliked': [uf]
                        }
                    }
        # makes organized_user_info look like: {
        #   'ChIJaVGAwidHmYARy8OSQcTXNgc' : {
        #       'name': 'Purple Bean',
        #       'user_features_list': {
        #           liked: [
            #           {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
            #           {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #           ],
        #           disliked: [
            #           {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
            #           {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #           ]
        #       }
        #   },
        # }
    else: # goes here if the view is either drinks or shopAspects
        # filter user_info by drinks or shop_aspect from type_name
        if view == 'drinks':
            user_info = list(filter(lambda uf: uf['feature']['type_name'] == 'drink', user_info))
        else:
            user_info = list(filter(lambda uf: uf['feature']['type_name'] == 'shop_aspect', user_info))
        # use this new user_info to put data into organized_user_info dict
        for uf in user_info: # go through array of user feature dicts
            if uf['feature']['feature_id'] in organized_user_info: 
                # if the feature_id is already in the organized_user_info dict
                # add the uf to its all_user_features liked or disliked list
                if uf['ranking'] > 0:
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['liked'].append(uf)
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['liked'].sort(key=lambda item: item.get('ranking'))

                else:
                    organized_user_info[uf['feature']['feature_id']]['all_user_features']['disliked'].append(uf)
            else: # if the feature_id is not in organized_user_info dict,
                # use its feature_id as a key and make its value a dict w/ name string and ufs being
                # list a liked and a disliked list.
                if uf['ranking'] > 0:
                    organized_user_info[uf['feature']['feature_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['feature']['name'],
                        'all_user_features': {
                            'liked': [uf],
                            'disliked': []
                        }
                    }
                else:
                    organized_user_info[uf['feature']['feature_id']] = {
                        'lat': uf['shop']['lat'],
                        'lng': uf['shop']['lng'],
                        'name': uf['feature']['name'],
                        'all_user_features': {
                            'liked': [],
                            'disliked': [uf]
                        }
                    }

    return jsonify(organized_user_info)







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

@app.route('/api/rankings/<to_rank>/<user_feature_id>')
def get_rankings(to_rank, user_feature_id):
    feature_name = to_rank
    feature = crud.get_feature_by_name(feature_name)
    user_id = session.get("user_id")
    user = crud.get_user_by_id(user_id)
    user_features = crud.get_specific_feature_ufs_for_user(user=user, feature=feature)
    user_info = []  # will be filled with a dict for each user feature, as detailed below
    for uf in user_features:
        user_info.append(
            {
            'user_feature_id': uf.user_feature_id,
            'feature': { 
                'name': uf.feature.name, 
                'feature_id': uf.feature.feature_id, 
                'description': uf.feature.description,
                'type_name': uf.feature.type.name
                },
            'shop': { 
                'name': uf.shop.name, 
                'shop_id': uf.shop.shop_id, 
                'lat': uf.shop.lat, 
                'lng': uf.shop.lng
                },
            'nickname': uf.nickname,
            'details': uf.details,
            'ranking': uf.ranking,
            'last_updated': uf.last_updated
            }
        )
    
    special_uf = None
    organized_user_info = {
        'liked': [],
        'disliked': []
    }
    for uf in user_info: # go through array of specific feature's user feature dicts
        print(f'looking for the uf_id: {user_feature_id}')
        if str(uf['user_feature_id']) == user_feature_id:
            special_uf = uf
            print('found it!')
        else:
            print(f'not this one, which has uf_id:')
            print(uf['user_feature_id'])
            if uf['ranking'] > 0:
                # add it to the liked list in organized_user_info
                organized_user_info['liked'].append(uf)
                organized_user_info['liked'].sort(key=lambda item: item.get('ranking'))
            else:
                organized_user_info['disliked'].append(uf)

    print(f'*************** special_uf is {special_uf}*****************')
    if special_uf:
        organized_user_info['liked'].insert(0, special_uf)
        # make organized_user_info look like: {
        #   'liked' : [
        #               {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
        #               {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #            ],
        #   'disliked': [
        #               {'user_feature_id': 201, 'feature': {name: latte, description: ...}},
        #                {'user_feature_id': 209, 'feature': {name: cold brew, description: ...}}
        #           ]
        #       }

    # Add in the user feature with user_feature_id to the front of like if it's not none


    # THE OLD WAY
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

    return jsonify(organized_user_info)
    # return jsonify(uf_data)

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
        else:
            need_to_rerank = True
    if changes_made > 0:
        crud.update_user_feature_last_updated(user_feature_id=user_feature_id,
                                        new_last_updated=datetime.now())

    return jsonify({'message': 'Saved changes', 'need_to_rerank': need_to_rerank })

@app.route('/api/delete-user-feature', methods=['POST'])
def delete_user_feature():
    data = request.get_json()
    user_feature_id = data['userFeatureId']
    uf_to_delete = crud.get_user_feature_by_id(user_feature_id)
    ranking_uf_to_delete = uf_to_delete.ranking
    feature = uf_to_delete.feature 
    crud.delete_user_feature_by_id(user_feature_id)
    if ranking_uf_to_delete > 0:
        user_id = session.get("user_id")
        user = crud.get_user_by_id(user_id)
        user_features = crud.get_specific_feature_ufs_for_user(user=user, feature=feature)
        ranked_user_features = list(filter(lambda uf: uf.ranking > 0, user_features))
        ranked_user_features.sort(key=lambda uf: uf.ranking)
        for index, uf in enumerate(ranked_user_features):
            new_ranking = index + 1
            crud.update_user_feature_ranking(user_feature_id=uf.user_feature_id,
                                            new_ranking=new_ranking)
    return jsonify({'message': f'the {feature.name} entry has been deleted',})

    




@app.route('/api/add-new-feature', methods=['POST'])
def add_new_feature():
    # expecting a dict with name, description, and type
    data = request.get_json()
    name = data['name']
    description = data['description']
    feature_type_name = data['type']
    feature_type = crud.get_type_by_name(feature_type_name)
    feature = crud.create_feature(name=name, feature_type=feature_type, description=description)
    message = f"Your new {feature_type_name}, {feature.name}, has been added!"
    return jsonify({'message': message})

@app.route('/api/shop-info/<shopName>')
def get_shop_user_features(shopName):
    shop = crud.get_shop_by_name(shopName)
    shop_coords = { 'lat': shop.lat, 'lng': shop.lng}
    user_id = session.get("user_id")
    user = crud.get_user_by_id(user_id)
    user_features = crud.get_specific_shop_ufs_for_user(user=user, shop=shop)
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
    return jsonify({'shop_coords': shop_coords, 'uf_data': uf_data})

@app.route('/api/all-shop-coordinates/<view>')
def get_all_shop_coordinates(view):
    print(f'******************** view is {view}*************************')

    # get all of a user's ufs, then get shop info for them
    # Get the user_id from the session
    user_id = session.get("user_id")
    # Query the db for the user
    user = crud.get_user_by_id(user_id)
    # Get all the user's user features
    user_features = list(filter(lambda uf: uf.ranking >0 , crud.get_all_ufs_for_user(user)))
    print(f'//////////// there are {len(user_features)} ufs')
    
    if view != 'shops' :
        print('########### it aint shops ################')
        if view == 'drinks':
            user_features = list(filter(lambda uf: uf.feature.type.name == 'drink' and  uf.ranking > 0, user_features))
            print(f'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ drinks are {user_features}')
        else:
            user_features = list(filter(lambda uf: uf.feature.type.name == 'shop_aspect' and uf.ranking > 0, user_features))

    shop_coords = {}
    for uf in user_features:
        if uf.shop.shop_id in shop_coords:
            continue
        else: 
            shop_coords[uf.shop.shop_id] = {
                'lat': uf.shop.lat,
                'lng': uf.shop.lng,
                'name': uf.shop.name
            }
    return jsonify(shop_coords)





if __name__ == '__main__':
    # Connect to db first, then app can access it.
    # Set debug to True before accessing the Debug Toolbar
    
    # app.debug = True
    connect_to_db(app)
    # DebugToolbarExtension(app)
    app.run(host='0.0.0.0')