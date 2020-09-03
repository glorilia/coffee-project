const Router = ReactRouterDOM.BrowserRouter;
const { useHistory, useParams, Redirect, Switch, Prompt, Link, Route } = ReactRouterDOM;
const createPortal = ReactDOM.createPortal
// const {range, inRange} = lodash;


function LandingPage() { // First page anyone lands on, can login or create account
  let history = useHistory()
  // Callback for create account button click
  const handleClick = () => {
    history.push('/create-account')
  }

  return (
    <div id="landing-page"> 
      <h1>Dranks</h1>
      <Login />
      <h3>OR</h3>
      <button id="create-account" onClick={handleClick}>
        Create a New Account
      </button>
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
    <div>
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
      (we'll find coffee near you)
      <input
        id="home-create-home-zipcode-input"
        type="text"
        onChange={(e) => setHomeZipcode(e.target.value)}
        value={homeZipcode}
      ></input>
      <button onClick={logIn}> Create Account </button>
    </div>
  )
}


function Login() { // a form to gather login info from a user
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
        alert(data.message)
        if (data.status == 'success') {
          history.push('/homepage')
        }
      })
  };

  return (
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
  )
}




const HOMEPAGE_VIEWS = {
  'Top Shops': 'shops',
  'Top Drinks': 'drinks',
  'Top Shop Aspects': 'shopAspects'
};


function Homepage() {
  const [view, setView] = React.useState('shops');
  const [locationBounds, setLocationBounds] = React.useState()

  return (
    <div id="homepage">
      <ButtonBar setView={setView} />
      <MapContainer view={view} setLocationBounds={setLocationBounds}/>
      <InfoContainer view={view} locationBounds={locationBounds}/>
      <SelectorAddButton view={view} />
    </div>
  )
}


function ButtonBar(props) {
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
  const [ options, setOptions] = React.useState({
    center: { lat: 39.5296, lng: -119.8138},
    zoom: 13
  });
  // Have the options state initialize at the coordinates of the user's zipcode

  return (
    <div id="map-container">
      <LocationSetter />
      <MapComponent setMap={setMap} options={options} />
      {/* <ShopMarkers map={map}/> */}
    </div>
  )
}

// LocationSetter
function LocationSetter(props) {
  return <input id="location-setter" type="text"></input>
}

// Map Component
function MapComponent(props) {
  const options = props.options;
  const ref = React.useRef();
  React.useEffect(() => {
    const createMap = () => props.setMap(new window.google.maps.Map(ref.current, options));
    if (!window.google) { // Create an html element with a script tag in the DOM
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY&libraries=places';
      document.head.append(script);
      script.addEventListener('load', createMap);
      return () => script.removeEventListener('load', createMap);
    } else { // Initialize the map if a script element with google url IS found
      createMap();
    }
  }, [options.center.lat]); //Need the value of the lat of options because it does not change

  return (
    <div id="map-div"
      style={{ height: `60vh`, margin: `1em 0`, borderRadius: `0.5em`, width: '50%' }}
      ref={ref}
    ></div>
  )
}


function ShopMarkers(props) {

}


// InfoContainer
function InfoContainer(props) { //get the user's user features' information according to the view
  const [listItems, setListItems] = React.useState([]);
  // function that creates list of ListItem components after getting db data
  const makeListItems = (data) => {
    const allListItems = []
    for (const item in data) {
      allListItems.push(
        <ListItem
          key={item}
          view={props.view}
          title={data[item].name}
          allUserFeatures={data[item].all_user_features}
        />)}
    setListItems(allListItems);
  }
  // gets information about user features from db according to view
  React.useEffect(() => {
    fetch(`/api/get-user-information/${props.view}`)
    .then(response => response.json())
    .then(data => makeListItems(data))
  }, [props.view])

  return (
    <div id="info-container">
      <h1>Top {props.view}</h1>
      <ul id="list-of-user-features">
        {(listItems.length > 0 ) ? listItems : <i className="fas fa-spin fa-coffee"></i>}
      </ul>
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
    <li onClick={handleListItemClick}>
      <p>{props.title}</p>
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
      <ul>{listElements}</ul>
      { needNumLikesLeft && <span>+{numLikesLeft} more <i className="fas fa-thumbs-up"></i></span>} 
      { (needNumLikesLeft && needNumDislikes) && <span>, </span>}
      { needNumDislikes && <span> {numDislikes} {numDislikes==1 ? 'dislike' : 'dislikes'} <i className="fas fa-thumbs-down"></i></span>}
    </React.Fragment>
  )
}


function BodyListElement(props) {
  return <li>{props.bodyListElement}</li>
}


const MAX = 5;
const HEIGHT = 80;


function RankedListContainer() {
  const { toRank, userFeatureId} = useParams();
  const [changesMade, setChangesMade] = React.useState(0);
  const [allUserFeatures, setAllUserFeatures] = React.useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [idToEdit, setIdToEdit] = React.useState('');

  React.useEffect( () => {
      fetch(`/api/rankings/${toRank}/${userFeatureId}`)
      .then(response => response.json())
      .then(data => setAllUserFeatures(data))
  }, [
    // userFeatureId,
    changesMade
  ]);

  console.log(`1. In RankedListContainer, allUserFeatures liked is ${allUserFeatures.liked}`)
  console.log(`2. In RankedListContainer, allUserFeatures disliked is ${allUserFeatures.disliked}`)

  if (Object.keys(allUserFeatures).length > 0) {
    return (
      <div id="ranked-list-container">
        <h1>Top {toRank}s</h1>
        <AreaForDragging 
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

  console.log(`3. In AreaForDragging, items is:`)
  console.table(items)
  console.log(`4. In AreaForDragging, unranked is: ${unranked}`)
  console.log(`4. state.dragOrder is:`)
  console.table(state.dragOrder)
  console.log(`5. is state.dragOrder == items? ${_.isEqual(items, state.dragOrder)}`)

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
    })
  }, [state.order])


  return(
    <Container> 
      <button 
        id="save-rankings-button" 
        onClick={saveRankings}
        >
          Save Rankings
      </button>
      {items.map((item, index) => {
        const isDragging = state.draggedIndex === index;
        const top = state.dragOrder.indexOf(item) * (HEIGHT + 10);
        console.log(`OG index${index}-> state.dragOrder.indexOf(item->${item.shop.name}): ${state.dragOrder.indexOf(item)}`)
        console.log(`OG index${index}-> top: ${top}`)
        const draggedTop = state.order.indexOf(item) * (HEIGHT + 10);
        console.log(`OG index${index}-> draggedTop: ${draggedTop}`)

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


function OGAreaForDragging(props) {
  let history = useHistory()
  const unranked=props.allUserFeatures.disliked;
  const items = props.allUserFeatures.liked;
  const [state, setState] = React.useState({
    order: items,
    dragOrder: items,
    draggedIndex: null
  })

  console.log(`3. In AreaForDragging, items is: ${items}`)
  console.log(`4. In AreaForDragging, unranked is: ${unranked}`)

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
    })
  }, [state.order])


  return(
    <Container> 
      <button 
        id="save-rankings-button" 
        onClick={saveRankings}
        >
          Save Rankings
      </button>
      {items.map((item, index) => {
        const isDragging = state.draggedIndex === index;
        const top = state.dragOrder.indexOf(item) * (HEIGHT + 10);
        console.log(`top: ${top}`)
        const draggedTop = state.order.indexOf(item) * (HEIGHT + 10);
        
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


// return <p>The user feature's info is {info.feature} {info.details}</p>
  return (
    <div>
      <h1>{featureName} from {shop}</h1>
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
      <button onClick={saveToDB}>Save Changes</button>
    </div>
  )
}


function BackToRankings() {
  const {toRank, userFeatureId} = useParams();
  let history = useHistory();
  React.useEffect(() => {
    history.push(`/rankings/${toRank}/${userFeatureId}`)
  }, [])
  return <p>reloading rankings...</p>
}


// {(unranked !== undefined) && <AreaOfDislikes items={unranked} />}
// function AreaOfDislikes (props) {
//   console.log(`in props, unranked items are ${props.items}`)
//   const items = props.items;
//   console.log(`The unranked items are ${items}`)
//   if (items !== undefined) {
//     return (
//       <Container>
//         {items.map( (item, index) => {
//           return (
//             <Rect
//               key={index}
//               top={index * (HEIGHT + 10)}
//             >
//               {item.ranking}.
//               <br></br>
//               {item.shop} ({item.nickname}),  {item.details},  
//               Last Updated: {item.last_updated}
//               <button>Edit Details</button>
//             </Rect>
//           )
//         })
//         }
//       </Container>
//     )
//   } else return null;
// }

    
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
    <div style={styles} onMouseDown={handleMouseDown}>
      {children}
    </div>
  )
}






function ShopInfo(){
  const {shopName} = useParams();
  const [userFeatures, setUserFeatures] = React.useState();
  React.useEffect( () => {
    fetch(`/api/shop-info/${shopName}`)
    .then(response => response.json())
    .then(data => {
      let rankedItems = data
        .filter((item) => item.ranking != 0)
        .sort( (a,b) => a.ranking-b.ranking)
      
      let unrankedItems = data
        .filter((item) => item.ranking == 0)

      setUserFeatures(rankedItems.concat(unrankedItems))
    })
  }, [])
  if (userFeatures != undefined) {
    return (
      <Container>
        Info about {shopName}
        {userFeatures.map( (item, index) => {
            return (
              <div style={{position: "relative"}}>
                <Rect
                  key={index}
                  top={(index )* (HEIGHT + 10)}
                >
                  {item.ranking}.
                  <br></br>
                  {item.feature} ({item.nickname}),  {item.details},  
                  Last Updated: {item.last_updated}
                  <Modal
                  activator={({setShowModal}) => (
                    <button style={{zIndex: 3}} onClick={() => setShowModal(true)}>Edit Details</button>)}
                  >
                    <EditUserFeature 
                      userFeatureId={item.user_feature_id}/>
                  </Modal>
                </Rect>
              </div>
            )
          })
          }
      </Container>
    )
  } else {return null;}
}










// ViewAllButton
function ViewAllButton() {
  return (
    <button id="view-all-button">View All</button>
  )
}
// SelectorAddButton
function SelectorAddButton() {
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
    history.push(`/add-new/${featureType}`)
  }

  return (
    <select id="selector-add-button" onChange={goToCreate}>
      <option key='def' value=''>Add Something New</option>
      {types}
    </select>
  )
}




function AddNewUserFeature() {
  // Form to add a new user feature to the database

  // Hooks
  let history = useHistory();
  const { featureType} = useParams();
  const [featureName, setFeatureName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [liked, setLiked] = React.useState(true);
  const [shop, setShop] = React.useState('');

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
    <div>
      <label htmlFor="shop-input">Choose a Shop</label>
      <ShopFinder shop={shop} setShop={setShop} />
      <FeatureNamePicker
        featureType={featureType}
        featureName={featureName}
        setFeatureName={setFeatureName} />
      <p><Link to={`/add-feature/${featureType}`}>Add A New {featureType}</Link></p>
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
      <button onClick={addToDB}>Add {featureType}</button>
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
  }, [])

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
      <SearchBox setShop={props.setShop} />
      <ShopDisplayer shop={props.shop} />
    </div>
  )
}


function SearchBox(props) {
  const ref = React.useRef();
  const [searchBox, setSearchBox] = React.useState();
  React.useEffect(() => {
    const createSearchBox = () => setSearchBox(new window.google.maps.places.Autocomplete(ref.current));
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
    if (searchBox) {
      searchBox.setFields(
        ['formatted_address', 'place_id', 'name', 'geometry']);
      // event listener for when the user picks a shop
      searchBox.addListener('place_changed', makePlaceShop);
    }
  }, [searchBox])

  const makePlaceShop = () => {
    const place = searchBox.getPlace();

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


function NewFeature() {
  //should eventually go back to where we came from
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
      alert(data.message)
      history.goBack()
    })
  }

  return (
    <div>
      <p>What's the new {featureType}?</p>
      <label htmlFor="name-input">Name</label>
      <input
        id="name-input"
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
      <button onClick={addFeature}>Add New Feature</button>
    </div>
  )
}





function About() {
  // Explain what the app is about
  return <div> This app lets you rank your favorite coffee shop drinks </div>
}


function Logout(props) {
  // Logs you out

  // Hooks
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
          <Route path="/create-account">
            <CreateAccount />
          </Route>
          <Route path="/add-new/:featureType">
            <AddNewUserFeature />
          </Route>
          <Route path="/rankings/:toRank/:userFeatureId">
            <RankedListContainer />
          </Route>
          <Route path="/redirect-rankings/:toRank/:userFeatureId">
            <BackToRankings />
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