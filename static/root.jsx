const Router = ReactRouterDOM.BrowserRouter;
const { useHistory, useParams, Redirect, Switch, Prompt, Link, Route } = ReactRouterDOM;
const createPortal = ReactDOM.createPortal
// const {range, inRange} = lodash;

const APPNAME = "Perkticular"
const SUBTITLE = "A Place For Your Inner Coffee Shop Critic"

function LandingPage() { // First page anyone lands on, can login or create account
  let history = useHistory()
  // Callback for create account button click
  const handleClick = () => {
    history.push('/create-account')
  }

  return (
    <div id="landing-page"> 
      <h1 className="app-title">{APPNAME}</h1>
      <h2 className="app-subtitle">{SUBTITLE}</h2>
      <Login />
      <h3 id="landing-page-or">OR</h3>
      <button className='create-button' id="create-account" onClick={handleClick}>
        Create a New Account
      </button>
    </div>
  )
}


function Login() { // A form to gather login info from a user
  let history = useHistory()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  // Callback for login event
  const logIn = (event) => {
    event.preventDefault();
    const formData = { 'email': email, 'password': password };
    fetch('/api/login',
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status == 'success') {
          history.push('/homepage')
        } else {
          alert(data.message);
        }
      })
  };

  return (
    <div className="form-bin" id="login-form">
      <form>
        <label htmlFor="email-input">Email:</label>
        <input
          id="email-input"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        ></input>
        <label htmlFor="password-input">Password:</label>
        <input
          id="password-input"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        ></input>
        <button onClick={logIn}> Log In </button>
      </form>
    </div>
  )
}


function CreateAccount() { // A form to create a new user account
  let history = useHistory()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [homeZipcode, setHomeZipcode] = React.useState('')
  // Callback for create account event
  const logIn = (event) => {
    event.preventDefault();
    console.log('inside login')
    const formData = {
      'email': email,
      'password': password,
      'homeZipcode': homeZipcode
    };
    fetch('/api/create-account',
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message)
        history.push('/')
      })
  };

  return (
    <div id="create-account-page">
      <h1>Create an Account</h1>
      <h2>You'll Be Logging Your Coffee Shop Drink Opinions in No Time</h2>
      <div className="form-bin" id="create-account-form">
        <label htmlFor="create-email-input">Email:</label>
        <input
          id="create-email-input"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        ></input>
        <label htmlFor="create-password-input">Password:</label>
        <input
          id="create-password-input"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        ></input>
        <label htmlFor="create-home-zipcode-input">Home Zipcode:</label>
        <span className="label-explainer">(where you drink most of your drinks)</span>
        <input
          id="create-home-zipcode-input"
          type="text"
          onChange={(e) => setHomeZipcode(e.target.value)}
          value={homeZipcode}
        ></input>
        <button className="add-button" onClick={logIn}> Create Account </button>
      </div>
    </div>
  )
}




const HOMEPAGE_VIEWS = { // Enum table for the homepage views, correspond to button bar
  'Top Shops': 'shops',
  'Top Drinks': 'drinks',
  'Top Shop Aspects': 'shopAspects'
};


function Homepage() { // The main page a user sees. Includes a map and text info from db
  const [view, setView] = React.useState('shops'); //set by ButtonBar
  const [locationBounds, setLocationBounds] = React.useState() // set by MapContainer

  return (
    <div id="homepage">
      <ButtonBar setView={setView} />
      <MapContainer view={view} setLocationBounds={setLocationBounds} locationBounds={locationBounds}/>
      <InfoContainer view={view} locationBounds={locationBounds}/>
      <SelectorAddButton view={view} />
    </div>
  )
}


function ButtonBar(props) { // 
  // Callback for a button's click event
  const changeView = (event) => {
    const newView = event.target.textContent; // want to get the inner contents of the event.target
    props.setView(HOMEPAGE_VIEWS[newView]);  // setview to that view according to the HOMEPAGE_VIEWS obj
  }

  return (
    <div id="button-bar">
      <button onClick={changeView} >Top Shops</button>
      <button onClick={changeView} >Top Drinks</button>
      <button onClick={changeView} >Top Shop Aspects</button>
    </div>
  )
}

// MapContainer
function MapContainer(props) {
  const [ map, setMap] = React.useState();
  const [ searchBox, setSearchBox] = React.useState();
  const [ options, setOptions] = React.useState({
    center: { lat: 39.5296, lng: -119.8138},
    zoom: 13
  });

  const mapDimensions = {
    width: '50%',
    height: '300px'
  }

  const MemoMap = React.useCallback( 
    <MapComponent
      map={map} 
      setMap={setMap} 
      options={options}
      mapDimensions={mapDimensions}
    />, [options])

  React.useEffect(() => {
    if (map !== undefined) map.addListener('bounds_changed', 
      () => {
        props.setLocationBounds(map.getBounds())

      })
  }, [map])

  return (
    <div id="map-container">
      <LocationSetter setSearchBox={setSearchBox} searchBox={searchBox} setOptions={setOptions} options={options}/>
      {MemoMap}
      <ShopMarkers map={map} view={props.view}/>
    </div>
  )
}

// LocationSetter
function LocationSetter(props) {
  const ref = React.useRef();
  // const [searchBox, setSearchBox] = React.useState();
  React.useEffect(() => {
    const createSearchBox = () => props.setSearchBox(new window.google.maps.places.Autocomplete(ref.current));
    if (!window.google) { // Create an html element with a script tag in the DOM
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY&libraries=places';
      document.head.append(script);
      script.addEventListener('load', createSearchBox);
      console.log("made google, then made search bar")
      return () => script.removeEventListener('load', createSearchBox);
    } else { // Initialize the map if a script element with google url IS found
      createSearchBox();
      console.log("made a search bar cause there was google already")
    }
  }, [])


  
  // Setting the fields that the place will return
  React.useEffect(() => {
    if (props.searchBox !== undefined) {
      props.searchBox.setFields(
        ['formatted_address', 'place_id', 'name', 'geometry']);
      // event listener for when the user picks a place from the autocomplete widget
      props.searchBox.addListener('place_changed', changeCenter);
    }
  }, [props.searchBox])

  const changeCenter = () => {
    const place = props.searchBox.getPlace();
    console.log('place is:')
    console.log(place)
    props.setOptions({
      ...props.options,
      center: { 
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    })
  }

  return (
    <input
      ref={ref}
      className="search-box"
      id="location-setter"
      type="text"
      placeholder="Wanna search somewhere else?"
    ></input>
  )
}

// Map Component
function MapComponent(props) {
  console.log('rendering the map')
  const options = props.options;
  const ref = React.useRef();
  React.useEffect(() => {
    const createMap = () => props.setMap(new window.google.maps.Map(ref.current, options));
    if (!window.google) { // Create an html element with a script tag in the DOM
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY&libraries=places';
      document.head.append(script);
      script.addEventListener('load', createMap);
      console.log('and now there is a map')
      return () => script.removeEventListener('load', createMap);
    } else { // Initialize the map if a script element with google url IS found
      createMap();
      console.log('and now there is a map');
    }
  }, [options.center.lat]); //Need the value of the lat of options because it does not change

  if (props.map) {
    console.log('and the map exists')
  } else { console.log('but there is no map')}


  return (
    <div id="map-div"
      style={{ height: props.mapDimensions.height, 
        margin: `1em 0`, borderRadius: `0.5em`, 
        width: props.mapDimensions.width }}
      ref={ref}
    ></div>
  )
}


function ShopMarkers(props) {
  let history = useHistory();
  const [markers , setMarkers] = React.useState([]);

  function clearMarkers() {
    console.log('clearing old markers')
    for (const marker of markers) { marker.setMap(null); }
    setMarkers([])
  }

  const makeMarkers = (coordsData) => {
    clearMarkers();
    const allMarkers = []
    for (const shop in coordsData) {
      const shopMarker = new window.google.maps.Marker({
        map: props.map,
        position: {
          lat: coordsData[shop].lat,
          lng: coordsData[shop].lng
        },
        title: coordsData[shop].name,
        // Can add icon here 
      })
      shopMarker.addListener('click', () => history.push(`/shop-info/${coordsData[shop].name}`))
      allMarkers.push(shopMarker);
    }
    setMarkers(allMarkers)
  }

  React.useEffect( () => {
    if(props.map){

      fetch(`/api/all-shop-coordinates/${props.view}`)
      .then(response => response.json())
      .then(data => makeMarkers(data))
    }
    
  }, [props.map, props.view])

  return null;
}


// InfoContainer
function InfoContainer(props) { //get the user's user features' information according to the view
  const [listItems, setListItems] = React.useState([]);
  const [itemsIsEmpty, setItemsIsEmpty] =  React.useState(null)
  // function that creates list of ListItem components after getting db data
  const makeListItems = (data) => {
    // if (props.locationBounds !== undefined) {
    //   console.log(`in InfoContainer, props.locationBounds is: ${props.locationBounds}`)
    // }
    const allListItems = []
    for (const item in data) {
      if (props.view == 'shops') { //if we're in the shops view
        const shopLatLng = {lat: data[item].lat, lng: data[item].lng}; //get the shop coords
        if (props.locationBounds !== undefined) { //once there's a locationBounds
          if ( !props.locationBounds.contains(shopLatLng) || data[item].all_user_features.liked.length == 0 ) { continue }
        } // don't add a List Item if the shop isn't on the map, or if it has no liked ufs
      } else { // this means the view is either drinks or shop_aspects
        const likedList = data[item].all_user_features.liked 
        if (likedList.length == 0) { continue }
        else { // this means the likedList has at least one user feature in it, 
          //so we'll check each user feature's location now.
          let noShopsOnMap = true; // set this to true as the default
          for (const uf of likedList) {
            const ufShopLatLng = {lat: uf.shop.lat , lng: uf.shop.lng} //get each uf's shop coords
            if (props.locationBounds !== undefined) {
              if (props.locationBounds.contains(ufShopLatLng)) { noShopsOnMap = false}
            } // if it's on the map, then noShopsOnMap will be false
          }
          if (noShopsOnMap) { continue } // if no shops are on the map, don't make the ListItem
        }
      }

      allListItems.push(
        <ListItem
          key={item}
          view={props.view}
          title={data[item].name}
          allUserFeatures={data[item].all_user_features}
        />)}
    setListItems(allListItems);
    (allListItems.length == 0) ? setItemsIsEmpty(true) : setItemsIsEmpty(false)
  }
  // gets information about user features from db according to view
  React.useEffect(() => {
    fetch(`/api/get-user-information/${props.view}`)
    .then(response => response.json())
    .then(data => makeListItems(data))
  }, [props.view, props.locationBounds])

  return (
    <div id="info-container">
      <h1 id="info-container-title">Top {props.view}</h1>
      <ul id="top-user-features">
        {itemsIsEmpty && <p className="empty-list">You haven't tried shops in this area. Try moving around the map (or adding something new!).</p>}
        {(listItems.length > 0 ) ? listItems : <i className="fas fa-spin fa-coffee"></i>}
      </ul>
      <ViewAllButton view={props.view}/>
    </div>
  )
}


function ListItem(props) {
  let history = useHistory();
  // calculate what label will be in item body list according to view
  const label = props.view == 'shops' ? 'feature' : 'shop';
  // send to page about the feature or shop according to view
  const handleListItemClick = () => {
    if (props.view == 'shops') {
      const shopName = props.title
      history.push(`/shop-info/${shopName}`)
    } else {
      const toRank = props.title;
      history.push(`/rankings/${toRank}/none`)
    }
  }

  return (
    <li className="list-item" onClick={handleListItemClick}>
      <h2 className="list-item-title">{props.title}</h2>
      <ItemBodyList 
        label={label} 
        likedList={props.allUserFeatures.liked}
        dislikedList={props.allUserFeatures.disliked}/>
    </li>
  )
}


function ItemBodyList(props) {
  const [listElements, setListElements] = React.useState([]);
  const numItemsToShow = 3;
  const numLikesLeft = props.likedList.length - numItemsToShow;
  const numDislikes = props.dislikedList.length;
  const needNumLikesLeft = numLikesLeft > 0;
  const needNumDislikes= numDislikes > 0;
  // creates list of BodyListElement components, according to numItemsToShow and props.likedList
  const makeListElements = () => {
    const allListElements = [];
    for (const listElement of props.likedList.slice(0, numItemsToShow)) {
      allListElements.push(
        <BodyListElement
          key={listElement.user_feature_id}
          bodyListElement={listElement[props.label].name} 
        />)}
    setListElements(allListElements)
  }

  React.useEffect( ()=> {
    makeListElements()
  }, [props.label, props.likedList, props.dislikedList]);
  
  return (
    <React.Fragment>
      <ul className="item-body-list">{listElements}</ul>
      { needNumLikesLeft && <span className="additional-items">+{numLikesLeft} more <i className="fas fa-thumbs-up"></i></span>} 
      { (needNumLikesLeft && needNumDislikes) && <span className="additional-items">, </span>}
      { needNumDislikes && <span className="additional-items"> {numDislikes} {numDislikes==1 ? 'dislike' : 'dislikes'} <i className="fas fa-thumbs-down"></i></span>}
    </React.Fragment>
  )
}


function BodyListElement(props) {
  return <li>{props.bodyListElement}</li>
}


const HEIGHT = 80;


function RankedListContainer() {
  const { toRank, userFeatureId} = useParams();
  const [description, setDescription] = React.useState('no description');
  const [changesMade, setChangesMade] = React.useState(0);
  const [allUserFeatures, setAllUserFeatures] = React.useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [idToEdit, setIdToEdit] = React.useState('');

  React.useEffect( () => {
      fetch(`/api/rankings/${toRank}/${userFeatureId}`)
      .then(response => response.json())
      .then(data => {
        setAllUserFeatures(data);
        setDescription(data.liked.length > 0 ? data.liked[0].feature.description : data.disliked[0].feature.description);
        // setDescription(data.liked)
      })
  }, [
    userFeatureId,
    changesMade
  ]);

  // console.log(`1. In RankedListContainer, allUserFeatures liked is ${allUserFeatures.liked}`)
  // console.log(`2. In RankedListContainer, allUserFeatures disliked is ${allUserFeatures.disliked}`)

  if (Object.keys(allUserFeatures).length > 0) {
    return (
      <div id="ranked-list-container">
        <h1>{toRank}</h1>
        <h2>{description}</h2>
        <AreaForDragging 
          toRank={toRank}
          userFeatureId={userFeatureId}
          allUserFeatures={allUserFeatures}
          changesMade ={changesMade}
          setChangesMade={setChangesMade} 
          showModal={showModal}
          setShowModal={setShowModal}
          setIdToEdit={setIdToEdit}
        />
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <EditUserFeature 
            userFeatureId={idToEdit}
            setShowModal={setShowModal}
            setChangesMade={setChangesMade}
            changesMade={changesMade}/>
        </Modal>
      </div>
    )
  } else return null;
}


function Modal(props) {
  // const [showModal, setShowModal] = React.useState(false)
  // const activator = props.activator;
  const modalContent =  (
      <div className="overlay">
        <div className="modal">
          <div className="modal-body">
            {props.children}
          </div>
          <button
            className="cancel-button"
            // className="modal-close"
            type="button"
            onClick= {() => props.setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )

  return createPortal(props.showModal ? modalContent : null, document.body)
}


function AreaForDragging(props) {
  let history = useHistory();
  const unranked=props.allUserFeatures.disliked;
  const items = props.allUserFeatures.liked;
  const [state, setState] = React.useState({
    order: items,
    dragOrder: items,
    draggedIndex: null
  })

  React.useEffect( () => {
    setState({
      order: items,
      dragOrder: items,
      draggedIndex: null
    })
  }, [items])

  const handleDrag = React.useCallback(({translation, id}) => {
    const delta = Math.round(translation.y / HEIGHT);
    const index = state.order.indexOf(id);
    const dragOrder = state.order.filter(item => item !== id);
    if (!_.inRange(index + delta, 0, items.length)){
      return;
    }
    dragOrder.splice(index + delta, 0, id);
    setState(state => ({
      ...state,
      draggedIndex: id,
      dragOrder
    }));
  }, [state.order, items.length]);

  const handleDragEnd = React.useCallback(() => {
    setState(state => ({
      ...state,
      order: state.dragOrder,
      draggedIndex: null
    }));
  }, []);
  
  const saveRankings = React.useCallback(() => {
    const userFeaturesByRanking = state.order
    fetch('/api/update-rankings',
      {
        method: 'POST',
        body: JSON.stringify(userFeaturesByRanking),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
    .then(response => response.json())
    .then(data => {
      props.setChangesMade(props.changesMade + 1);
      alert(data.message);
      history.push(`/rankings/${props.toRank}/none`)
    })
  }, [state.order])


  return(
    <Container> 
      { (items.length > 1 || props.userFeatureId != 'none') && <button 
        className="save-button"
        id="save-rankings-button" 
        onClick={saveRankings}
        >
          Save Rankings
      </button>}
      {items.map((item, index) => {
        const isDragging = state.draggedIndex === index;
        const top = state.dragOrder.indexOf(item) * (HEIGHT + 10);
        // console.log(`OG index${index}-> state.dragOrder.indexOf(item->${item.shop.name}): ${state.dragOrder.indexOf(item)}`)
        // console.log(`OG index${index}-> top: ${top}`)
        const draggedTop = state.order.indexOf(item) * (HEIGHT + 10);
        // console.log(`OG index${index}-> draggedTop: ${draggedTop}`)

        return (
          <Draggable
            key={index}
            id={item}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            <Rect
              key={item.user_feature_id}
              isDragging={isDragging}
              top={isDragging ? draggedTop : top}
            >
              {item.ranking}.
              <br></br>
              {item.shop.name} ({item.nickname}),  {item.details},  
              Last Updated: {item.last_updated}
              <button 
                className="edit-button"
                style={{zIndex: 3}} 
                onClick={() => {
                  props.setShowModal(true)
                  props.setIdToEdit(item.user_feature_id)
                }}
              >
                Edit Details
              </button>
            </Rect>
          </Draggable>
        );
      })}
      {unranked.map( (item, index) => {
          return (
            <div key={index} style={{position: "relative"}}>
              <Rect
                key={item.user_feature_id}
                top={(index + state.order.length)* (HEIGHT + 10)}
              >
                {item.ranking}.
                <br></br>
                {item.shop.name} ({item.nickname}),  {item.details},  
                Last Updated: {item.last_updated}
                <button 
                  className="edit-button"
                  style={{zIndex: 3}} 
                  onClick={() => {
                    props.setShowModal(true)
                    props.setIdToEdit(item.user_feature_id)
                  }}
                >
                  Edit Details
                </button>
              </Rect>
            </div>
          )
        })
        }
  </Container>
  );
}

    
const Container = window.styled.div`
  width: 100vw;
  min-height: 100vh;
`;

const Rect = window.styled.div.attrs(props => ({
  style: {
    transition: props.isDragging ? 'none' : 'all 500ms'
  }
}))`
  width: 600px;
  user-select: none;
  height: ${HEIGHT}px;
  background: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: start;
  justify-content: start;
  position: absolute;
  top: ${({top}) => 20 + top}px;
  left: calc(50vw - 350px);
  font-size: 20px;
  color: #777;
`;


const POSITION = {x:0, y:0};


function Draggable(props) {
  const id = props.id
  const children = props.children
  const onDrag = props.onDrag
  const onDragEnd = props.onDragEnd

  const [state, setState] = React.useState({
    isDragging: false,
    origin: POSITION,
    translation: POSITION
  });

  const handleMouseDown = React.useCallback(({clientX, clientY}) => {
    setState(state => ({
      ...state,
      isDragging: true,
      origin: {x: clientX, y: clientY}
    }));
  }, []);

  const handleMouseMove = React.useCallback(({clientX, clientY}) => {
    const translation = {x: clientX - state.origin.x, y: clientY - state.origin.y};
    
    setState( state => ({
      ...state,
      translation
    }));

    onDrag({translation, id});
  }, [state.origin, onDrag, id])

  const handleMouseUp = React.useCallback(() => {
    setState(state => ({
      ...state,
      isDragging: false
    }));

    onDragEnd();
  }, [onDragEnd]);

  React.useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp)

      setState(state => ({...state, translation: {x:0, y:0}}));
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  const styles = React.useMemo(() => ({
    cursor: state.isDragging ? '-webkit-grabbing' : '-webkit-grab',
    transform: `translate(${state.translation.x}px, ${state.translation.y}px)`,
    transition: state.isDragging ? 'none' : 'transform 500ms',
    zIndex: state.isDragging ? 2 : 1,
    position: state.isDragging ? 'absolute' : 'relative'
  }), [state.isDragging, state.translation]);

  return (
    <div className="draggable" style={styles} onMouseDown={handleMouseDown}>
      {children}
    </div>
  )
}


function EditUserFeature(props) {
  const userFeatureId = props.userFeatureId;
  let history = useHistory();
  const [featureName, setFeatureName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [liked, setLiked] = React.useState();
  const [shop, setShop] = React.useState('');
  // Get the specific user feature's info from database
  React.useEffect( () => {
    fetch(`/api/specific-uf-info/${userFeatureId}`)
    .then(response => response.json())
    .then(data => {
      setFeatureName(data.feature)
      setNickname(data.nickname)
      setDetails(data.details)
      setLiked(data.ranking > 0)
      setShop(data.shop)
    })
  }, [])

  const saveToDB = () => {
    const formData = {
      'userFeatureId': userFeatureId,
      'nickname': nickname,
      'details': details,
      'liked': liked,
    }
    fetch('/api/edit-user-feature', {
      method: 'POST',
      body: JSON.stringify(formData),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      props.setChangesMade(props.changesMade + 1);
      alert(data.message);
      props.setShowModal(false);
      if(data.need_to_rerank) {
        const toRank = featureName
        history.push(`/rankings/${toRank}/${userFeatureId}`)
      } 
    })
  }

  const deleteUserFeature = () => {
    fetch('/api/delete-user-feature', {
      method: 'POST',
      body: JSON.stringify({'userFeatureId': userFeatureId}),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      props.setChangesMade(props.changesMade + 1);
      alert(data.message);
      props.setShowModal(false);
    })
  }

  return (
    <div className="form-bin">
      <h1 className="edit-title">{featureName} from {shop}</h1>
      <label htmlFor="nickname-input">Nickname</label>
      <input
        id="nickname-input"
        type="text"
        onChange={(e) => setNickname(e.target.value)}
        value={nickname}
      ></input>
      <label htmlFor="details-input">Details</label>
      <textarea
        id="details-input"
        onChange={(e) => setDetails(e.target.value)}
        value={details}
      ></textarea>
      <label htmlFor="liked-input">Liked</label>
      <input
        id="liked-input"
        type="radio"
        value="liked"
        onChange={(e) => setLiked(e.target.checked)}
        checked={liked}
      ></input>
      <label htmlFor="disliked-input">Disliked</label>
      <input
        id="disliked-input"
        type="radio"
        value="not-liked"
        onChange={(e) => setLiked(!e.target.checked)}
        checked={!liked}
      ></input>
      <button className="save-button" onClick={saveToDB}>Save Changes</button>
      <button className="delete-button" onClick={deleteUserFeature}>Delete This Entry</button>
    </div>
  )
}




function ShopInfo(){
  const {shopName} = useParams();
  const [userFeatures, setUserFeatures] = React.useState([]);
  const [changesMade, setChangesMade] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [idToEdit, setIdToEdit] = React.useState('');
  const [map, setMap] = React.useState([]);
  const [ options, setOptions] = React.useState({
    center: { lat: 39.5296, lng: -119.8138},
    zoom: 13
  });

  const mapDimensions = {
    width: '50%',
    height: '100px'
  }

  const MemoMap = React.useCallback( 
    <MapComponent
      map={map} 
      setMap={setMap} 
      options={options}
      mapDimensions={mapDimensions}
    />, [options])

  React.useEffect( () => {
    fetch(`/api/shop-info/${shopName}`)
    .then(response => response.json())
    .then(data => {
      let rankedItems = data.uf_data
        .filter((item) => item.ranking != 0)
        .sort( (a,b) => a.ranking-b.ranking)
      let unrankedItems = data.uf_data
        .filter((item) => item.ranking == 0)
      setUserFeatures(rankedItems.concat(unrankedItems))
      if (map !== undefined){
      const center = new google.maps.LatLng(data.shop_coords)
      const marker = new google.maps.Marker({position: center, map: map, title: data.name})
      map.panTo(center)
      }
    })
  }, [map, changesMade])

  if (userFeatures.length !== 0 ) {
   
    return (
      <div id="shop-info-page">
        <Container>
          <h1>{shopName}</h1>
          <h2> All drinks and shop aspects from this coffee shop</h2>
          {MemoMap}
          {userFeatures.map( (item, index) => {
              return (
                <div id="shop-info-container" style={{position: "relative"}} key={index}>
                  <Rect
                    key={item.user_feature_id}
                    top={(index )* (HEIGHT + 10)}
                  >
                    {item.ranking}.
                    <br></br>
                    {item.feature} ({item.nickname}),  {item.details},  
                    Last Updated: {item.last_updated}
                    <button 
                      className="edit-button"
                      style={{zIndex: 3}} 
                      onClick={() => {
                        setShowModal(true)
                        setIdToEdit(item.user_feature_id)
                    }}
                    >
                      Edit Details
                    </button>
                  </Rect>
                </div>
              )
            })
            }
        </Container>
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <EditUserFeature 
            userFeatureId={idToEdit}
            setShowModal={setShowModal}
            setChangesMade={setChangesMade}
            changesMade={changesMade}/>
        </Modal>
      </div>
    )
  } else {return null;}
}




function ViewAllButton(props) {
  // console.log(`in view all button, the view is: ${props.view}`)
  let history = useHistory();
  const goToAll = () =>  {
    // console.log(`going to all ${props.view}`)
    history.push(`/all/${props.view}`)
  }
  return (
    <button 
      id="view-all-button"
      onClick={goToAll}
    >View All {props.view}</button>
  )
}


function All() {
  const {view} = useParams();

  const [listItems, setListItems] = React.useState([]);
  const [itemsIsEmpty, setItemsIsEmpty] =  React.useState(null)
  // function that creates list of ListItem components after getting db data
  const makeListItems = (data) => {
    const allListItems = []
    for (const item in data) {
      allListItems.push(
        <ListItem
          key={item}
          view={view}
          title={data[item].name}
          allUserFeatures={data[item].all_user_features}
        />)}
    setListItems(allListItems);
    (allListItems.length == 0) ? setItemsIsEmpty(true) : setItemsIsEmpty(false)
  }
  // gets information about all user features from db
  React.useEffect(() => {
    fetch(`/api/get-user-information/${view}`)
    .then(response => response.json())
    .then(data => makeListItems(data))
  }, [])
  return (
    <div id='all-container'>
      <h1>All {view}</h1>
      {itemsIsEmpty && <p>No {view} yet! Try adding something.</p>}
      <ul id="all-user-featurese">
        {listItems}
      </ul>
    </div>
  )
}


function SelectorAddButton(props) {
  let history = useHistory()
  const [types, setTypes] = React.useState();
  React.useEffect(() => {
    fetch('/api/get-types')
      .then(response => response.json())
      .then(data => {
        const typesList = [];
        for (const a_type of data) {
          typesList.push(<option
            key={a_type.id} id={a_type.name} value={a_type.name}>{a_type.name}</option>);
        }
        setTypes(typesList);
      })
  }, []);

  const goToCreate = (event) => {
    const featureType = event.target.value
    console.log(featureType)
    history.push(`/add-new/${featureType}`)
  }

  if (props.view == 'shops') {
    return (
      <select className="create-button" id="selector-add-button" onChange={goToCreate}>
        <option key='def' value=''>Add Something New</option>
        {types}
      </select>
    )
  } else if(props.view == 'drinks') {
    return (
      <button 
        className="create-button" 
        id="new-drink-button"
        value='drink'
        onClick={goToCreate}
        >Add a New Drink</button>
    )
  } else {
    return (
      <button 
        className="create-button" 
        id="new-drink-button"
        value='shop_aspect'
        onClick={goToCreate}
        >Add a New Shop Aspect</button>
    )
  }
}




function AddNewUserFeature() {
  // Form to add a new user feature to the database

  // Hooks
  const ref = React.useRef();
  let history = useHistory();
  const { featureType} = useParams();
  const [featureName, setFeatureName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [liked, setLiked] = React.useState(true);
  const [shop, setShop] = React.useState('');

  const [showModal, setShowModal] = React.useState(false);
  const [changesMade, setChangesMade] = React.useState(0);

  const [searchBox, setSearchBox] = React.useState();
  const [map, setMap] = React.useState()
  const [ options, setOptions] = React.useState({
    center: { lat: 39.5296, lng: -119.8138},
    zoom: 13
  });
  const mapDimensions = {
    width: '30%',
    height: '200px'
  }

  const MemoMap = React.useCallback( 
    <MapComponent
      map={map} 
      setMap={setMap} 
      options={options} 
      mapDimensions={mapDimensions}
    />, [options])

  React.useEffect( () => {
    if(map !== undefined && shop){
      const center = new google.maps.LatLng(shop.lat, shop.lng);
      const marker = new google.maps.Marker({position: center, map: map, title: shop.name});
      map.panTo(center);
    }
  }, [map, shop])


  const addToDB = () => {
    const formData = {
      'featureName': featureName,
      'nickname': nickname,
      'details': details,
      'liked': liked,
      'shop': shop
    }

    fetch('/api/add-user-feature',
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        if (data.need_to_rank) {
          const toRank = data.feature_name;
          const userFeatureId = data.uf_id;
          history.push(`/rankings/${toRank}/${userFeatureId}`)
        } else { history.push('/homepage')}
      })
  }

  

  return (
    <div className='form-bin'>
      <label htmlFor="shop-input">Choose a Shop</label>
      <ShopFinder shop={shop} setShop={setShop} searchBox={searchBox} setSearchBox={setSearchBox} />
      {MemoMap}
      <FeatureNamePicker
        changesMade={changesMade}
        featureType={featureType}
        featureName={featureName}
        setFeatureName={setFeatureName} />
      {/* <p><Link to={`/add-feature/${featureType}`}>Add A New {featureType}</Link></p> */}
      <button onClick={() => setShowModal(true)}>Add a New {featureType}</button>
      <label htmlFor="nickname-input">Nickname</label>
      <input
        id="nickname-input"
        type="text"
        onChange={(e) => setNickname(e.target.value)}
        value={nickname}
      ></input>
      <label htmlFor="details-input">Details</label>
      <textarea
        id="details-input"
        onChange={(e) => setDetails(e.target.value)}
        value={details}
      ></textarea>
      <label htmlFor="liked-input">Liked</label>
      <input
        id="liked-input"
        type="radio"
        value="liked"
        onChange={(e) => setLiked(e.target.checked)}
        checked={liked}
      ></input>
      <label htmlFor="disliked-input">Disliked</label>
      <input
        id="disliked-input"
        type="radio"
        value="not-liked"
        onChange={(e) => setLiked(!e.target.checked)}
        checked={!liked}
      ></input>
      <button className="add-button" onClick={addToDB}>Add {featureType}</button>
      <Modal showModal={showModal} setShowModal={setShowModal}>
          <NewFeature
            setShowModal={setShowModal}
            setChangesMade={setChangesMade}
            changesMade={changesMade}/>
        </Modal>
    </div>
  )
}

function FeatureNamePicker(props) {
  const [features, setFeatures] = React.useState();
  React.useEffect(() => {
    fetch(`/api/get-features/${props.featureType}`)
      .then(response => response.json())
      .then(data => {
        const all_features = []
        for (const feature of data) {
          all_features.push(<option key={feature.id} id={feature.name}
            value={feature.name}>{feature.name}</option>)
        }
        setFeatures(all_features)
      })
  }, [props.changesMade])

  return (
    <React.Fragment>
      <label htmlFor="feature-name-input">{props.featureType} Name</label>
      <select
        id="feature-name-input"
        onChange={(e) => props.setFeatureName(e.target.value)}
        value={props.featureName}
      >
        <option key='def' value=''>Which {props.featureType} is it?</option>
        {features}
      </select>
    </React.Fragment>
  )
}

function ShopFinder(props) {
  return (
    <div>
      <SearchBox setShop={props.setShop} 
        searchBox={props.searchBox} setSearchBox={props.setSearchBox}/>
      <ShopDisplayer shop={props.shop} />
    </div>
  )
}

function SearchBox(props) {
  const ref = React.useRef();
  // const [searchBox, setSearchBox] = React.useState();
  React.useEffect(() => {
    const createSearchBox = () => props.setSearchBox(new window.google.maps.places.Autocomplete(ref.current));
    if (!window.google) { // Create an html element with a script tag in the DOM
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY&libraries=places';
      document.head.append(script);
      script.addEventListener('load', createSearchBox);
      console.log("made google, then made search bar")
      return () => script.removeEventListener('load', createSearchBox);
    } else { // Initialize the map if a script element with google url IS found
      createSearchBox();
      console.log("made a search bar cause there was google already")
    }
  }, [])

  // Setting the fields that the place will return
  React.useEffect(() => {
    if (props.searchBox !== undefined) {
      props.searchBox.setFields(
        ['formatted_address', 'place_id', 'name', 'geometry']);
      // event listener for when the user picks a shop
      props.searchBox.addListener('place_changed', makePlaceShop);
    }
  }, [props.searchBox])

  // React.useEffect( () => {
  //   if(props.map !== undefined) {
  //     // console.log(`in the Searchbox useEffect, searchbox? ${!! searchBox}, map? ${!! props.map}`)
  //     props.map.addListener('tilesloaded', () => map.controls[google.maps.ControlPosition.TOP_LEFT].push(ref.current) )
  //     // map.controls[google.maps.ControlPosition.TOP_LEFT].push(ref.current);

  //   }
  // }, [props.map])

  const makePlaceShop = () => {
    const place = props.searchBox.getPlace();

    props.setShop({
      'shop_id': place.place_id,
      'name': place.name,
      'address': place.formatted_address,
      'lat': place.geometry.location.lat(),
      'lng': place.geometry.location.lng()
    })
  }

  return (
    <input
      ref={ref}
      id="search-box"
      type="text"
      placeholder="Type in the shop name"
    ></input>
  )
}

function ShopDisplayer(props) {
  const shop = props.shop
  return (
    <div id="shop-displayer">
      <p>{shop.name}</p>
      <p>{shop.address}</p>
    </div>
  )
}


function NewFeature(props) {
  let history = useHistory()
  const {featureType} = useParams();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState();

  const addFeature = () => {
    const formData = {
      'name': name, 
      'description': description,
      'type': featureType}
    fetch('/api/add-new-feature', 
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
    .then(response => response.json())
    .then(data => {
      props.setChangesMade(props.changesMade + 1);
      alert(data.message);
      props.setShowModal(false);
    })
  }

  return (
    <div>
      <h1>New {featureType}</h1>
      <label htmlFor="name-input">Name</label>
      <input
        id="feature-name-input"
        type="text"
        onChange={(e) => setName(e.target.value)}
        value={name}
        ></input>
      <label htmlFor="details-input">Details</label>
      <textarea
        id="description-input"
        onChange={(e) => setDescription(e.target.value)}
        value={description}
      ></textarea>
      <button className="add-button" onClick={addFeature}>Add New Feature</button>
    </div>
  )
}




function About() {
  // Explain what the app is about
  return <div> This app lets you rank your favorite coffee shop drinks </div>
}




function Logout(props) { // Logs you out
  let history = useHistory()
  React.useEffect(() => {
    fetch('/api/logout',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message)
        history.push('/')
      }
      )
  })

  return <div>Bye for now!</div>
}


// Main component that everything is rendered from
function App() {
  return (
    // Creating Navigation
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/"> Landing Page </Link>
            </li>
            <li>
              <Link to="/about"> About </Link>
            </li>
            <li>
              <Link to="/homepage"> Homepage </Link>
            </li>
            <li>
              <Link to="/add-new-drink"> Add New Drink </Link>
            </li>
            <li>
              <Link to="/login"> Login </Link>
            </li>
            <li>
              <Link to="/logout"> Log Out</Link>
            </li>
            <li>
              <Link to="/create-account"> Create Account </Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/homepage">
            <Homepage />
          </Route>
          <Route path="/all/:view">
            <All />
          </Route>
          <Route path="/create-account">
            <CreateAccount />
          </Route>
          <Route path="/add-new/:featureType">
            <AddNewUserFeature />
          </Route>
          <Route path="/rankings/:toRank/:userFeatureId">
            <RankedListContainer />
          </Route>
          <Route path='/edit-user-feature/:userFeatureId'>
            <EditUserFeature />
          </Route>
          <Route path="/add-feature/:featureType">
            <NewFeature />
          </Route>
          <Route path="/shop-info/:shopName">
            <ShopInfo />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/logout">
            <Logout />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/">
            <LandingPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );

}

ReactDOM.render(<App />, document.getElementById('root'))






// function Modal(props) {
//   const [showModal, setShowModal] = React.useState(false)
//   const activator = props.activator;
//   const modalContent =  (
//       <div className="overlay">
//         <div className="modal">
//           <div className="modal-body">
//             {props.children}
//           </div>
//           <button
//             // className="modal-close"
//             type="button"
//             onClick= {() => setShowModal(false)}
//           >
//             Cancel
//           </button>
//         </div>
//      </div>
//     )

//   return (
//     <React.Fragment>
//       {activator({setShowModal})}
//       {createPortal(showModal ? modalContent : null, document.body)}
//       {/* {showModal ? modalContent : null} */}
//     </React.Fragment>
//   )
// }







function UserFeatureItem(props) {
  // Display a user feature and its assoociated properties

  return (
    <li>
      <p>{props.feature}</p>
      <p>{props.shop}</p>
      <p>{props.nickname}</p>
      <p>{props.details}</p>
      <p>{props.ranking}</p>
      <p>{props.last_updated}</p>
    </li>
  )
}


function ListOfUserFeatures(props) {
  // A list of features, usually of a certain type

  const all_features = [];
  for (const userFeature of props.listOfUserFeatures) {
    // prop.featureList is a list of user feature objects
    // Add the information from the feature to the all_features list
    all_features.push(
      <UserFeatureItem
        key={userFeature.user_feature_id}
        feature={userFeature.feature}
        shop={userFeature.shop}
        nickname={userFeature.nickname}
        details={userFeature.details}
        ranking={userFeature.ranking}
        last_updated={userFeature.last_updated}
      />
    );
  }

  return (
    <div>
      <ul>{all_features}</ul>
    </div>
  )
}


function ShopWithUserFeatures(props) {
  // Display a shop and list of associated user features

  return (
    <div>
      {props.shopName}
      <ul>{props.ufsHtmlList}</ul>
    </div>
  )
}


function ListOfShops(props) {
  // Renders aggregate of drinks and shopAspects based on shops
  // props.listOfUserFeatures includes both drinks and shop aspects

  // object with key being a shop name, value a list of ufs of the shop
  const featuredShops = {}
  // Go through list of user features and add each to its corresponding shop key
  for (const userFeature of props.listOfUserFeatures) {
    if (userFeature.shop in featuredShops) {
      featuredShops[userFeature.shop].push(userFeature);
    }
    else {
      featuredShops[userFeature.shop] = [userFeature];
    }
  }

  //Go through featured_shops object to get the shops.
  //create a ShopWithUserFeatures component, add to list of shops
  const all_shops = [];
  for (const shop in featuredShops) {
    const ufsHtmlList = [];
    for (const uf of featuredShops[shop]) {
      // featuredShops.shop is a list of userFeatures
      ufsHtmlList.push(<li>{uf.feature}</li>)
    }
    all_shops.push(
      <ShopWithUserFeatures
        key={featuredShops[shop][0].user_feature_id}
        shopName={shop}
        ufsHtmlList={ufsHtmlList}
      /> // Need a key for the above list items
    );
  }

  return (
    <div>
      <ul>{all_shops}</ul>
    </div>
  )
}



// function AddUserFeatureButton(props) {
//   // Button that allows you to add a feature and has label based on the view
//   let buttonLabel = null
//   for (const view in props.view) {
//     if (view === 'viewShops' && props.view[view] === true) {
//        buttonLabel = "Add Something New";
//     } else if (view === 'viewDrinks' && props.view[view] === true) {
//        buttonLabel = "Add a New Drink";
//     } else if (view === 'viewShopAspects' && props.view[view] === true) {
//        buttonLabel = "Add a New Shop Aspect"
//     }
//   }
//   if (!buttonLabel) {
//     return null;
//   }

//   return (
//     <button>
//       {buttonLabel}
//     </button>
//   )
// }



// function MapComponent(props) {
//   // Create a map component

//   const options = props.options;

//   // Hooks
//   // creates a reference object we can use when mounting our map
//   const ref = React.useRef();
//   const [theMap, setTheMap] = React.useState();
//   // Upon component render, create the map itself
//   React.useEffect( () => {
//     // Initialize a map by updating the state of theMap to a new map object.
//     const createMap = () => setTheMap(new window.google.maps.Map(ref.current, options));
//     //Create a script element with google url as src if none is found
//     if (!window.google) { // Create an html element with a script tag in the DOM
//       const script = document.createElement('script');
//       // Set the script tag's src attribute to the API URL
//       script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY&libraries=places';
//       // Mount the script tag at the document's head
//       document.head.append(script);
//       // Listen for it to load, then do createMap when it does
//       script.addEventListener('load', createMap);
//       //remove the event listener (we don't need it anymore)
//       return () => script.removeEventListener('load', createMap);
//     } else { // Initialize the map if a script element with google url IS found
//       createMap();
//     }
//   }, [options.center.lat]); //Need the value of the lat of options because it does not change

//   // A way to have a function affect the map right after it's been mounted
//   // if (theMap && typeof onMount === 'function') onMount(theMap, onMountProps);

//   // Return a div with the reference we made earlier, MAKE SURE IT HAS HEIGHT.
//   return (
//     <div 
//       style = {{ height: `60vh`, margin: `1em 0`, borderRadius: `0.5em` }}
//       ref = {ref}
//     ></div>
//   )
// }





// Landing page with conditional rendering:
// function LandingPage() {
//   // First page anyone lands on, can login or create account
//   let history = useHistory()

//   const [wantsToLogin, setWantsToLogin] = React.useState(false)

//   const handleClick = () => {
//     setWantsToLogin(true)
//   }

//   return (
//     <div> Dranks
//       <Login />
//       <h3>OR</h3>
//       <button id="create-account" onClick={handleClick}>
//         Create a New Account
//       </button>
//       {wantsToLogin && <CreateAccount />}
//     </div>
//     )
// }