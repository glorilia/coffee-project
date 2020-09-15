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
    <section id="landing-page" className="section">
      <div className="container has-text-centered">
        <div className="columns is-centered">
          <div className="column is-half">
            <div className="content">
              <h1 className="title is-1 mb-0" id="app-title">{APPNAME}</h1>
            </div>
          </div>
        </div>
        <div className="columns is-centered">
          <div className="column is-half">
            <div className="content">
              <h2 className="subtitle is-4" id="app-subtitle">{SUBTITLE}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="columns is-vcentered">
          <div className="column">
            <Login />
          </div>
          <div className="column is-one-fifth">
            <div className="content">
              <h3 id="landing-page-or" className="has-text-centered">OR</h3>
            </div>
          </div>
          <div className="column has-text-centered">
            <button 
              className='create-button button is-centered is-rounded is-primary is-outlined is-large' 
              id="create-account" onClick={handleClick}
            >
              Create a New Account
            </button>
          </div>
        </div>
      </div>
    </section>
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
    <div className="form-bin " id="login-form">
      <form>
        <div className="field">
          <label htmlFor="email-input" className="label">Email:</label>
          <div className="control has-icons-left">
            <input
              className="input is-primary is-rounded"
              id="email-input"
              type="text"
              placeholder="e.g. perk@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            ></input>
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="password-input" className="label">Password:</label>
          <div className="control has-icons-left">
            <input
              className="input is-primary is-rounded"
              id="password-input"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            ></input>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </div>
        </div>
        <div className="field">
          <div className="control has-text-centered">
            <button 
              className="button is-primary is-medium is-rounded"
              onClick={logIn}
            >
             Log In 
            </button>
          </div>
        </div>
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
    <section className="section pt-4" id="homepage">
      <div className="content mb-4 has-text-centered">
        <h1 
          id="info-container-title"
          className="title is-uppercase has-text-primary-dark has-text-weight-bold">
          Top {view}
        </h1>
      </div>
      <div className="container mb-2 pb-5">
        <ButtonBar setView={setView} />
      </div>
      <div className="container">
        <div className="columns has-background-primary-light" id="map-and-info-columns">
          <div className="column is-half" id="map-container-column">
            <MapContainer view={view} setLocationBounds={setLocationBounds} locationBounds={locationBounds}/>
          </div>
          <div id="info-container-column" className="column is-half has-background-primary-dark">
            <InfoContainer view={view} locationBounds={locationBounds}/>
          </div>
        </div>
      </div>
    </section>
  )
}


function ButtonBar(props) { // 
  // Callback for a button's click event
  const changeView = (event) => {
    const newView = event.target.textContent; // want to get the inner contents of the event.target
    props.setView(HOMEPAGE_VIEWS[newView]);  // setview to that view according to the HOMEPAGE_VIEWS obj
  }

  return (
    <div id="button-bar" className="buttons is-centered">
      <button className="button is-primary is-rounded" onClick={changeView} >Top Shops</button>
      <button className="button is-primary is-rounded" onClick={changeView} >Top Drinks</button>
      <button className="button is-primary is-rounded" onClick={changeView} >Top Shop Aspects</button>
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
    width: '100%',
    height: '60vh'
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
    <div id="map-container" className="container">
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
    <div className="field">
      <div className="control">
        <input
          ref={ref}
          className="search-box input is-primary"
          id="location-setter"
          type="text"
          placeholder="Wanna search somewhere else?"
        ></input>
      </div>
    </div>
    
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
    <div id="info-container" className="container">
      <div className="field has-addons has-addons-centered">
        <p className="control">
          <ViewAllButton view={props.view} />
        </p>
        <p className="control has-text-centered">
          <SelectorAddButton view={props.view} />
        </p>
      </div>
      <div id="top-user-features-container">
        <ul id="top-user-features" className="columns is-multiline is-variable is-1">
          {itemsIsEmpty && <p className="empty-list has-text-white has-text-centered mt-4 px-6">You haven't tried shops in this area. Try moving around the map (or adding something new!).</p>}
          {(listItems.length > 0 ) ? listItems : null}
          {/* {(listItems.length > 0 ) ? listItems : <p className="has-text-centered icon"><i className="fas fa-3xfa-spin fa-coffee has-text-white"></i></p>} */}
        </ul>
      </div>
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
    <div className="column is-half">
      <li className="list-item" onClick={handleListItemClick} className="card">
        <header className="card-header">
          <h2 className="list-item-title card-header-title is-capitalized pl-5">{props.title}</h2>
        </header>
        <div className="content ">
          <ItemBodyList 
          label={label} 
          likedList={props.allUserFeatures.liked}
          dislikedList={props.allUserFeatures.disliked}/>
        </div>
      </li>
    </div>
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
      <div className="card-content py-3 item-body-list">
        {listElements}
        <div className="tags">
          { needNumLikesLeft &&
              <span className="additional-items tag">
                +{numLikesLeft} more 
                <span className="icon has-text-primary">  <i className="fas fa-thumbs-up"></i></span>
              </span>
          }
          { needNumDislikes && 
            <span className="additional-items tag"> 
              +{numDislikes} {numDislikes==1 ? 'dislike' : 'dislikes'} 
              <span className="icon has-text-danger-dark">  <i className="fas fa-thumbs-down"></i></span>
            </span>}

        </div>
      </div>      
    </React.Fragment>
  )
}


function BodyListElement(props) {
  return (
    <p className="is-capitalized">
      <span className="icon has-text-primary"><i className="fas fa-thumbs-up"></i></span>
      {props.bodyListElement}
    </p>
    )
}


const HEIGHT = 150;
const WIDTH = 400;


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
      <section className="section mx-0 px-0" id="ranked-list-container">
        <div className="content has-text-centered">
          <h1 className="title is-1 is-capitalized has-text-primary-dark" id="rankings-title">{toRank}</h1>
          <h2 className="subtitle is-4 has-weight-bold">{description}</h2>
        </div>
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
      </section>
    )
  } else return null;
}


function Modal(props) {
  // const [showModal, setShowModal] = React.useState(false)
  // const activator = props.activator;
  const modalContent =  (
      <div className="modal is-active">
        <div className="modal-background"></div>
        {/* <div className="modal-card"> */}
          {props.children}
        {/* </div> */}
        <button
          className="cancel-button"
          // className="modal-close"
          type="button"
          onClick= {() => props.setShowModal(false)}
        >
          Cancel
        </button>
      </div>
    )

  return createPortal(props.showModal ? modalContent : null, document.body)
}


function AreaForDragging(props) {
  let history = useHistory();
  const unranked=props.allUserFeatures.disliked;
  const items = props.allUserFeatures.liked;
  // const [ogOrder, setOgOrder] = React.useState(items)
  const [state, setState] = React.useState({
    order: items,
    dragOrder: items,
    draggedIndex: null
  }) 

  React.useEffect( () => {
    setState({
      order: items,
      dragOrder: items,
      draggedIndex: null,
      ogOrder: items
    });
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
    <div>
      { (items.length > 1 || props.userFeatureId != 'none') && <div className="content has-text-centered">
          <button
            // disabled={ props.userFeatureId=="none" && (state.order == state.ogOrder ? true: false)}
            title="Disabled button"
            className="save-button button is-primary"
            id="save-rankings-button" 
            onClick={saveRankings}
            >
              Save Rankings
          </button>
        </div>  
      }
      <Container> 
        {items.map((item, index) => {
          const isDragging = state.draggedIndex === index;
          const top = state.dragOrder.indexOf(item) * (HEIGHT + 10);
          // console.log(`OG index${index}-> state.dragOrder.indexOf(item->${item.shop.name}): ${state.dragOrder.indexOf(item)}`)
          // console.log(`OG index${index}-> top: ${top}`)
          const draggedTop = state.order.indexOf(item) * (HEIGHT + 10);

          //dealing with the date
          const d = new Date(item.last_updated)
          const lastUpdated = `${d.getMonth()}/${d.getDate()} @ ${d.getHours()}:${d.getMinutes()}`
          
          //dealing with nickname
          let nickname = ''
          if (item.nickname != null) {
            nickname = `(${item.nickname})`
          }

          return (
            <Draggable
              key={index}
              id={item}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            >
              <Rect
                className={item.user_feature_id==props.userFeatureId ? "is-warning": "is-primary" }
                key={item.user_feature_id}
                isDragging={isDragging}
                top={isDragging ? draggedTop : top}
              >
                <div className="message-header">
                  <p className="is-size-6">
                    <span className="icon"><i className="fas fa-thumbs-up"></i> </span>
                      {item.shop.name} 
                    <span className="is-italic"> {nickname}</span>
                  </p>
                  <button 
                    className="edit-button button is-small is-primary"
                    style={{zIndex: 3}} 
                    onClick={() => {
                      props.setShowModal(true)
                      props.setIdToEdit(item.user_feature_id)
                    }}
                    >
                    Edit Details
                  </button>
                </div>
                <div className="message-body px-3 py-2">
                  <p className="is-size-6">{item.details}
                    <br /><span className="is-italic is-size-7" style={{color:"silver"}}>
                      Updated: {lastUpdated}
                    </span>
                  </p>
                </div>
              </Rect>
            </Draggable>
          );
        })}
        {unranked.map( (item, index) => {
            //dealing with the date
            const d = new Date(item.last_updated)
            const lastUpdated = `${d.getMonth()}/${d.getDate()} @ ${d.getHours()}:${d.getMinutes()}`
            
            //dealing with nickname
            let nickname = ''
            if (item.nickname != null) {
              nickname = `(${item.nickname})`
            }

            return (
              <div key={index} style={{position: "relative"}}>
                <Rect
                  className="message is-danger"
                  key={item.user_feature_id}
                  top={(index + state.order.length)* (HEIGHT + 10)}
                >
                  <div className="message-header">
                    <p className="is-size-6">
                      <span className="icon"><i className="fas fa-thumbs-down"></i> </span>
                      {item.shop.name} 
                      <span className="is-italic"> {nickname}</span>
                    </p>
                    <button 
                      className="edit-button button is-small is-danger"
                      style={{zIndex: 3}} 
                      onClick={() => {
                        props.setShowModal(true)
                        props.setIdToEdit(item.user_feature_id)
                      }}
                      >
                      Edit Details
                    </button> 
                  </div> 
                  <div className="message-body px-3 py-2">
                    <p className="is-size-6">{item.details}
                      <br /><span className="is-italic is-size-7" style={{color:"silver"}}>
                        Updated: {lastUpdated}
                      </span>
                    </p>
                  </div>
                </Rect>
              </div>
            )
          })
          }
    </Container>
    </div>
  )
}

    
const Container = window.styled.div`
  width: 100vw;
  min-height: 100vh;
`;

const Rect = window.styled.div.attrs(props => ({
  className: "message is-small is-primary",
  style: {
    transition: props.isDragging ? 'none' : 'all 500ms'
  }
}))`
  width: ${WIDTH}px;
  user-select: none;
  height: ${HEIGHT}px;
  
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  
  align-items: start;
  justify-content: start;
  position: absolute;
  top: ${({top}) => 20 + top}px;
  left: calc(50vw - ${WIDTH / 2}px);
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

  const cancelEdit = () => {
    props.setShowModal(false)
  }

  return (
    <div className="modal-card">
      <header className="modal-card-head">
        <h1 className="edit-title modal-card-title is-capitalized">{featureName} from {shop}</h1>
        <button className="delete" aria-label="close" onClick={cancelEdit}></button>
      </header>
      <section className="modal-card-body">
        <div className="field">
          <label className="label" htmlFor="nickname-input">Nickname</label>
          <div className="control">
            <input
              className="input"
              id="nickname-input"
              type="text"
              onChange={(e) => setNickname(e.target.value)}
              value={nickname}
            ></input>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="details-input">Details</label>
          <div className="control">
            <textarea
              className="textarea"
              id="details-input"
              onChange={(e) => setDetails(e.target.value)}
              value={details}
            ></textarea>
          </div>
        </div>
        <div className="field is-grouped is-grouped-centered">
          <div className="control">
            <label className="radio is-size-5" htmlFor="liked-input">
              Liked 
              <input
                id="liked-input"
                name="answer"
                type="radio"
                value="liked"
                onChange={(e) => setLiked(e.target.checked)}
                checked={liked}
              ></input>
            </label>
            <label className="radio is-size-5" htmlFor="disliked-input">
              Disliked 
              <input
                id="disliked-input"
                name="answer"
                type="radio"
                value="not-liked"
                onChange={(e) => setLiked(!e.target.checked)}
                checked={!liked}
              ></input>
            </label>
          </div>
        </div> 
        </section>
        <footer className="modal-card-foot">
          <button className="save-button" onClick={saveToDB}>Save Changes</button>
          <button className="delete-button" onClick={deleteUserFeature}>Delete This Entry</button>
        </footer>
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
    width: '100%',
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
      <section className="section mx-0 px-0" id="shop-info-page">
        <div className="content has-text-centered">
          <h1 className="title is-1 is-capitalized has-text-primary-dark" id="rankings-title">{shopName}</h1>
        </div>
        <div className="columns is-centered" id="shop-map-columns">
          <div className="column is-half" id="shop-map-column">
            {MemoMap}
          </div>
        </div>
        <div className="content has-text-centered">
          <h2 className="subtitle is-4 has-weight-bold">All drinks and shop aspects from this coffee shop</h2>
        </div>
        <Container>
          {userFeatures.map( (item, index) => {
            //dealing with the date
            const d = new Date(item.last_updated)
            const lastUpdated = `${d.getMonth()}/${d.getDate()} @ ${d.getHours()}:${d.getMinutes()}`
            
            //dealing with nickname
            let nickname = ''
            if (item.nickname != null) {
              nickname = `(${item.nickname})`
            }

            //deal with 0 rankings (dislikes)
            const isLiked = item.ranking > 0;


            return (
              <div id="shop-info-container" style={{position: "relative"}} key={index}>
                <Rect
                  // className={`${item.ranking=0? "message is-danger":"message is-primary"}`}
                  className={`${isLiked? "is-primary" : "is-danger"}`}
                  key={item.user_feature_id}
                  top={(index )* (HEIGHT + 10)}
                >
                  <div className="message-header">
                    <p className="is-size-6 is-capitalized">
                      <span className="icon"><i className={`fas fa-thumbs-${isLiked? "up": "down"}`}></i> </span>
                      {item.feature} 
                      <span className="is-italic"> {nickname}</span>
                    </p>
                    
                    <button 
                      className={`edit-button button is-small ${isLiked? "is-primary" : "is-danger"}`}
                      style={{zIndex: 3}} 
                      onClick={() => {
                        setShowModal(true)
                        setIdToEdit(item.user_feature_id)
                      }}
                      >
                      Edit Details
                    </button>
                  </div>
                  <div className="message-body px-3 py-2">
                    <p className="is-size-6">{item.details}
                      <br /><span className="is-italic is-size-7" style={{color:"silver"}}>
                        Updated: {lastUpdated}
                      </span>
                    </p>
                  </div>
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
      </section>
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
      className="button is-primary is-light"
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
  }, [view])
  return (
    <section className="section pt-4" id="all-page">
      <div className="content mb-4 has-text-centered">
        <h1 
          id="info-container-title"
          className="title is-uppercase has-text-primary-dark has-text-weight-bold">
          All {view}
        </h1>
      </div>
      <div className="container has-text-centered mb-5">
        <SelectorAddButton view={view} />
      </div>
      {itemsIsEmpty && <p>No {view} yet! Try adding something.</p>}
      <div className="columns is-centered">
        <div className="column is-two-thirds has-background-primary-dark" id="all-background-column">
          <ul id="all-user-features" className="columns is-multiline is-variable is-1"> 
            {listItems}
          </ul>
        </div>
      </div>
      
    </section>
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
      <div className="select is-primary is-light">
        <select className="create-button has-text-centered has-text-primary has-text-weight-semibold is-capitalized" id="new-user-feature-button" onChange={goToCreate}>
        <option key='def' value=''>Add Something New</option>
        {types}
      </select>
      </div>
    )
  } else if(props.view == 'drinks') {
    return (
      <button 
        className="button is-primary is-inverted is-focused has-text-weight-semibold create-button" 
        id="new-user-feature-button"
        value='drink'
        onClick={goToCreate}
        >Add a New Drink</button>
    )
  } else {
    return (
      <button 
        className="button is-primary has-text-weight-semibold is-inverted is-focused create-button" 
        id="new-user-feature-button"
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
    width: '100%',
    height: '50vh'
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
    <section className='section px-6'>
      <div className="content">
        <h1 className="title has-text-centered has-text-primary-dark is-capitalized">Add New {featureType}</h1>
      </div>
      <div className="columns" id="parent-for-add-new-form">

        <div className="column" id="shop-finder-column">
          <div className="field">
            <label className="label" htmlFor="shop-input">Find a Shop</label>
            {/* <ShopFinder shop={shop} setShop={setShop} searchBox={searchBox} setSearchBox={setSearchBox} /> */}
            <SearchBox 
              setShop={setShop} 
              searchBox={searchBox} 
              setSearchBox={setSearchBox}/>
            {MemoMap}
          </div>
        </div>

        <div className="column" id="user-feature-details-inputs">
          <ShopDisplayer shop={shop} />

          <div className="columns" id="name-and-nickname-columns">
            <div className="column" id="drink-name-column">
              <div className="field ">
                <label className="label is-capitalized" htmlFor="feature-name-input">{featureType} Name</label>
                <FeatureNamePicker
                  changesMade={changesMade}
                  featureType={featureType}
                  featureName={featureName}
                  setFeatureName={setFeatureName} />
                <p className="help is-primary">Can't find it? Add a new kind of {featureType}</p>
                <div className="control">
                  <button
                    className="button is-small is-primary is-dark is-capitalized"
                    onClick={() => setShowModal(true)}
                    >
                      New Type of {featureType}
                  </button>
                </div>
              </div>
            </div>
            <div className="column" id="nickname-column">
              <div className="field">
                <label className="label" htmlFor="nickname-input">Nickname</label>
                <div className="control">
                  <input
                    className="input"
                    id="nickname-input"
                    type="text"
                    onChange={(e) => setNickname(e.target.value)}
                    value={nickname}
                  ></input>
                </div>
              </div>
            </div>
          </div>

          <div className="columns" id="rest-of-fields-columns">
            <div className="column" id="rest-of-fields-column">
              <div className="field">
                <label className="label" htmlFor="details-input">Details</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    id="details-input"
                    placeholder="What'd you think?"
                    onChange={(e) => setDetails(e.target.value)}
                    value={details}
                  ></textarea>
                </div>
              </div>
              <div className="field is-grouped is-grouped-centered">
                <div className="control">
                  <label className="radio is-size-5" htmlFor="liked-input">
                    Liked 
                    <input
                      id="liked-input"
                      name="answer"
                      type="radio"
                      value="liked"
                      onChange={(e) => setLiked(e.target.checked)}
                      checked={liked}
                    ></input>
                  </label>
                  <label className="radio is-size-5" htmlFor="disliked-input">
                    Disliked 
                    <input
                      id="disliked-input"
                      name="answer"
                      type="radio"
                      value="not-liked"
                      onChange={(e) => setLiked(!e.target.checked)}
                      checked={!liked}
                    ></input>
                  </label>
                </div>
              </div>
              <div className="field">
                <div className="control has-text-centered">
                  <button className="add-button button is-primary is-medium" onClick={addToDB}>Add {featureType}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal showModal={showModal} setShowModal={setShowModal}>
          <NewFeature
            setShowModal={setShowModal}
            setChangesMade={setChangesMade}
            changesMade={changesMade}/>
      </Modal>
    </section>
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
      <div className="control">
        <div className="select">
          <select
            id="feature-name-input"
            onChange={(e) => props.setFeatureName(e.target.value)}
            value={props.featureName}
          >
            <option key='def' value=''>Which {props.featureType} is it?</option>
            {features}
          </select>
        </div>
      </div>
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
    <div className="control">
      <input
        ref={ref}
        className="input"
        id="search-box"
        type="text"
        placeholder="Type in the shop name"
      ></input>
    </div>
    
  )
}

function ShopDisplayer(props) {
  const shop = props.shop
  return (
    <div className="field">
      <label className="label">
        Chosen Shop
      </label>
      <div id="shop-displayer" className="notification is-primary is-light">
        {shop=== '' && <div><p>No shop has been chosen.</p><br></br></div>}
        <p>{shop.name}</p>
        <p>{shop.address}</p>
      </div> 
    </div>
    
  )
}


function NewFeature(props) {
  let history = useHistory()
  const {featureType} = useParams();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState();

  const cancelAdd = () => props.setShowModal(false)

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
    <div className="modal-card">
      <header className="modal-card-head">
        <h1 className="edit-title modal-card-title is-capitalized">New Kind of {featureType}</h1>
        <button className="delete" aria-label="close" onClick={cancelAdd}></button>
      </header>
      <section className="modal-card-body">
        <div className="field">
          <label className="label" htmlFor="name-input">Name</label>
          <div className="control">
            <input
              className="input"
              id="feature-name-input"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></input>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="details-input">Details</label>
          <div className="control">
            <textarea
              className="textarea"
              id="description-input"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </div>
        </div>
      </section>
      <footer className="modal-card-foot" id="modal-foot-new-drink">
        <div className="field has-text-centered">
          <div className="control">
            <button className="add-button button is-primary is-capitalized" onClick={addFeature}>Add New Kind of {featureType}</button>
          </div>
        </div>
      </footer>
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
        <nav className="navbar is-light is-spaced py-0" role="navigation" aria-label="main-navigation">
          <div className="navbar-brand">
            <a className="navbar-item">
              <Link to="/homepage"><p id="app-title" className="title">{APPNAME}</p> </Link>
            </a>
            <a role="button" className="navbar-burger burger" aria-label="menu" 
            aria-expanded="false" data-target="navbarMain"
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div id="navbarMain" className="navbar-menu">
            <div className="navbar-start">
              <a className="navbar-item">
                <Link to="/homepage">Home</Link>
              </a>
              <a className="navbar-item">
                <Link to="/all/shops"> All Shops </Link>
              </a>
              <a className="navbar-item">
                <Link to="/all/drinks"> All Drinks </Link>
              </a>
              <a className="navbar-item">
                <Link to="/all/shopAspects"> All Shop Aspects </Link>
              </a>
            </div>
            <div className="navbar-end">
              <a className="navbar-item button is-primary is-outlined">
                <Link to="/logout"> Log Out</Link>
              </a>
            </div>
          </div>      
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



// function LandingPage() { // First page anyone lands on, can login or create account
//   let history = useHistory()
//   // Callback for create account button click
//   const handleClick = () => {
//     history.push('/create-account')
//   }

//   return (
//     <div id="landing-page" className="container">
//       <h1 className="app-title text-center">{APPNAME}</h1>
//       <h2 className="app-subtitle text-center">{SUBTITLE}</h2>
//       <Login />
//       <h3 id="landing-page-or" className="text-center">OR</h3>
//       <div className="d-flex justify-content-center">
//         <button className='create-button btn btn-outline-primary' id="create-account" onClick={handleClick}>
//           Create a New Account
//         </button>
//       </div>
//     </div>
//   )
// }


// function Login() { // A form to gather login info from a user
//   let history = useHistory()
//   const [email, setEmail] = React.useState('')
//   const [password, setPassword] = React.useState('')
//   // Callback for login event
//   const logIn = (event) => {
//     event.preventDefault();
//     const formData = { 'email': email, 'password': password };
//     fetch('/api/login',
//       {
//         method: 'POST',
//         body: JSON.stringify(formData),
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' }
//       })
//       .then(response => response.json())
//       .then(data => {
//         if (data.status == 'success') {
//           history.push('/homepage')
//         } else {
//           alert(data.message);
//         }
//       })
//   };

//   return (
//     <div className="form-bin " id="login-form">
//       <form>

//           <div className="form-group row">
//             <label 
//               htmlFor="email-input"
//               className="col-sm-2 col-form-label">Email:</label>
//             <div className="col-sm-10">
//               <input
//                 className="form-control"
//                 id="email-input"
//                 type="text"
//                 onChange={(e) => setEmail(e.target.value)}
//                 value={email}
//               ></input>
//             </div>
//           </div>

//           <div className="form-group row">
//             <label 
//               htmlFor="password-input"
//               className="col-sm-2 col-form-label">Password:</label>
//             <div className="col-sm-10">
//               <input
//                 className="form-control"
//                 id="password-input"
//                 type="password"
//                 onChange={(e) => setPassword(e.target.value)}
//                 value={password}
//               ></input>
//             </div>
//           </div>
//           <div className="d-flex justify-content-center">
//             <button 
//               className="btn btn-primary"
//               onClick={logIn}> Log In </button>
//           </div>
//       </form>
//     </div>
//   )
// }