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
    <div> Dranks
      <Login />
      <h3>OR</h3>
      <button id="create-account" onClick={handleClick}>
        Create a New Account
      </button>
    </div>
  )
}


function CreateAccount() {
  // A form to create a new user account

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


function Login() {
  // a form to gather login info from a user

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

// Homepage
function Homepage() {
  const [view, setView] = React.useState('shops');

  return (
    <div id="homepage">
      <ButtonBar setView={setView} />
      {/* <MapContainer view={view} /> */}
      <InfoContainer view={view} />
      <SelectorAddButton view={view} />
    </div>
  )
}

// ButtonBar
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
  
  return (
    <div id="map-container">
      <LocationSetter />
      <MapComponent options={{ center: { lat: 37.601773, lng: -122.202870 }, zoom: 11 }} />
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
  const [theMap, setTheMap] = React.useState();
  React.useEffect(() => {
    const createMap = () => setTheMap(new window.google.maps.Map(ref.current, options));
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

// InfoContainer
function InfoContainer(props) { //get the user's user features' information (all of it at the same time)
  const [userFeatureData, setUserFeatureData] = React.useState({});
  React.useEffect(() => {
    fetch('/api/get-user-information')
      .then(response => response.json())
      .then(data => {
        setUserFeatureData({
          drinks: data.drink,
          shopAspects: data.shop_aspect,
          shops: data.drink.concat(data.shop_aspect)
        })
      })
  }, [])

  return (
    <div id="info-container">
      <ListContainer view={props.view} dataToDisplay={userFeatureData[props.view]} />
      {/* <ViewAllButton /> */}
    </div>
  )
}

// ListContainer
function ListContainer(props) {
  // const  [toRank, setToRank] = React.useState();
  // const [showModal, setShowModal] = React.useState(false);
  // const [modalContent, setModalContent] = React.useState();
  const [allData, setAllData] = React.useState([]);
  const dataList = [];
  React.useEffect(() => {
    if (props.dataToDisplay) {
      // 1. Depending on view, set what to organize the data by & what to add to its list
      let orgBy = 'feature';
      let toAdd = 'shop'
      if (props.view === 'shops') {
        orgBy = 'shop';
        toAdd = 'feature'
      }

      // 2. Make new array that has no zero ranked uf's and is sorted in asc order 
      let rankedData = props.dataToDisplay
        .filter(arrayElement =>
          //only keeps stuff that meets its condition
          arrayElement.ranking != 0
        )
        .sort((a, b) => {
          return a.ranking - b.ranking
        })
      
      //2b. Make new array with disliked items aka unranked (has ranking of 0)
      let unrankedItems = props.dataToDisplay
          .filter(arrayElement =>
            //only keeps stuff that has a zero rank
            arrayElement.ranking == 0
          )
      
      
      // 3. Organize data by orgBy and make value obj have a liked a list of toAdd's
      // and a disliked list to add to later
      const organizedData = {};
      rankedData.forEach((userFeature) => {
        if (userFeature[orgBy] in organizedData) {
          organizedData[userFeature[orgBy]].liked.push(userFeature[toAdd])
        } else {
          organizedData[userFeature[orgBy]] = {'liked':[userFeature[toAdd]], 'disliked':0} 
        }        
      })

      //4. Add a count of dislikes for each orgBy key in organized data.
      unrankedItems.forEach((userFeature) => {
        if (userFeature[orgBy] in organizedData) {
          organizedData[userFeature[orgBy]].disliked += 1
        } else {
          organizedData[userFeature[orgBy]] = {'liked': null, 'disliked': 1}
        }
      })

      for (const dataKey in organizedData) {
        // Add a ListItem with the information from organizedData
        dataList.push(
          <ListItem
            // setShowModal={setShowModal}
            // setModalContent = {setModalContent}
            // setToRank={setToRank}
            title={dataKey}
            bodyList={organizedData[dataKey].liked}
            dislikedCount={organizedData[dataKey].disliked}
          />
        );
      }
      setAllData(dataList)
    }
  }, [props.dataToDisplay])

  return (
    <div id="list-container">
      <h1>Top {props.view}</h1>
      <ul>
        {allData}
      </ul>
      {/* <Modal showModal={showModal} setShowModal={setShowModal}>
        <RankedListContainer modalContent={modalContent}/>
      </Modal> */}
    </div>
  )
}

// ListItem
function ListItem(props) {
  let history = useHistory();
  return (
    <li>
      <div 
        onClick={ (e) => {
        // props.setShowModal(true) 
        // props.setModalContent(props.title)
          const toRank = props.title;
          console.log(`going to rank all: ${toRank}`)
          history.push(`/rankings/${toRank}/none`)
        }}
      >
        <p>{props.title}</p>
        <ItemBodyList bodyList={props.bodyList} dislikedCount={props.dislikedCount} />
      </div>
    </li>
  )
}


function ItemBodyList(props) {
  let needNumLeft = false;
  let numLeft = 0
  const allBodyListElements = [];
  const numItemsToShow = 3;
  if (props.bodyList != null) {
    for (const bodyListElement of props.bodyList.slice(0, numItemsToShow)) {
      allBodyListElements.push(<BodyListElement
        bodyListElement={bodyListElement} />)
    }
    numLeft = (props.bodyList).length - numItemsToShow
    needNumLeft = numLeft > 0;
  }
  // console.log(`For the body list ${props.bodyList}`)
  // console.log(`needNumLeft looks like it's: ${needNumLeft}`)
  // console.log(`numLeft, ${(props.bodyList) ? (props.bodyList).length : null} - ${numItemsToShow}, looks like it's: ${numLeft}`)
  return (
    <React.Fragment>
      <ul>{allBodyListElements}</ul>
      {
        needNumLeft && <span>+{numLeft} more <i className="fas fa-thumbs-up"></i></span>
        
      // needNumLeft ? 
      //   (<p> +{numLeft} more <i className="fas fa-thumbs-up"></i> , 
      //   {props.dislikedCount} disliked <i className="fas fa-thumbs-down"></i></p>
      //   ): 
      //   (<p>{props.dislikedCount} {props.dislikedCount==1 ? 'dislike' : 'dislikes'} <i className="fas fa-thumbs-down"></i></p>
      //   )
      } 
      {(needNumLeft && (props.dislikedCount > 0)) && <span>, </span>}
      { (props.dislikedCount > 0) && <span> {props.dislikedCount} {props.dislikedCount==1 ? 'dislike' : 'dislikes'} <i className="fas fa-thumbs-down"></i></span>}
      
    </React.Fragment>
  )
}


function BodyListElement(props) {
  return <li>{props.bodyListElement}</li>
}





function RankedListContainer(props) {
  const { toRank, userFeatureId} = useParams();
  console.log(`in rankedListContainer, ranking: ${toRank}`)

  const [rankings, setRankings] = React.useState([]);
  const [unranked, setUnranked] = React.useState([])
  React.useEffect( () => {
    if (toRank) {
      fetch(`/api/rankings/${toRank}`)
      .then(response => response.json())
      .then(data => {
        // filter data by having a 0 ranking
        let unrankedItems = data
          .filter(arrayElement =>
            //only keeps stuff that has a zero rank
            arrayElement.ranking == 0
          )

        let newItem = data
          .filter(element => element.user_feature_id == userFeatureId)
        
        let rankedItems = data 
          .filter(arrayElement =>  arrayElement.ranking != 0)
          .sort((a,b) => {
            return a.ranking - b.ranking
          })
        
        // let unrankedItems = data
        // .filter(arrayElement =>
        //   //only keeps stuff that has a zero rank
        //   arrayElement.ranking == 0
        // )
        
        // setRankings(rankedItems.concat(unrankedItems));
        setRankings(newItem.concat(rankedItems))
        setUnranked(unrankedItems)
      })
    }
  }, [
    toRank
  ]);

  console.log(`in RankedListContainer, unranked items: ${unranked}`)

  if (rankings.length !== 0) {
    console.log(`the rankings ${rankings}`)
    return (
      <React.Fragment>
        <h1>Top {toRank}s</h1>
        <AreaForDragging 
          toRank={toRank}
          items={rankings} 
          unranked={unranked} />
      </React.Fragment>
    )
  } else return null;
  

  // const itemsToDisplay = []
  // if (rankings) {
  //   for (const item of rankings) {
  //     itemsToDisplay.push(
  //       <RankedListItem 
  //         key ={item.user_feature_id}
  //         shop={item.shop}
  //         nickname={item.nickname}
  //         details={item.details}
  //         lastUpdated={item.last_updated}
  //         ranking={item.ranking}
  //       />
  //     )
  //   }
  // }


  // return (
  //   <div>
  //     <h2>Top {props.modalContent}</h2>
  //     <ul>{itemsToDisplay}</ul>
  //   </div>
  // )
}


// function RankedListItem(props) {
  
// }


const MAX = 5;
const HEIGHT = 80;

function AreaForDragging(props) {
  let history = useHistory()
  const unranked=props.unranked;
  const items = props.items;
  // console.log(`items in the area for draggin: ${items}`)
  const [state, setState] = React.useState({
    order: items,
    dragOrder: items,
    draggedIndex: null
  })

  const handleDrag = React.useCallback(({translation, id}) => {
    const delta = Math.round(translation.y / HEIGHT);
    const index = state.order.indexOf(id);
    const dragOrder = state.order.filter(item => item !== id);
    // console.log(`drag order after filter, before splice: ${dragOrder[0].shop}, ${dragOrder[1].shop}`)
    if (!_.inRange(index + delta, 0, items.length)){
      return;
    }

    dragOrder.splice(index + delta, 0, id);
    // console.log(`drag order after splice: ${dragOrder[0].shop}, ${dragOrder[1].shop}, ${dragOrder[2].shop}`)

    setState(state => ({
      ...state,
      draggedIndex: id,
      dragOrder
    }));
    // console.log(`now the dragorder of the state is ${state.dragOrder[0].shop}, ${state.dragOrder[1].shop}, ${state.dragOrder[2].shop}`)
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
      alert(data.message)
      history.push(`/redirect-rankings/${props.toRank}/none`)
    })
  }, [state.order])





  // console.log(`This is the official order: ${state.order[0].shop}, ${state.order[1].shop}, ${state.order[2].shop}`)
  if (items){
    return(
      <Container> 
        <button 
          id="save-rankings-button" 
          onClick={saveRankings}
          >
            Save
        </button>
      {items.map((item, index) => {
        const isDragging = state.draggedIndex === index;
        const top = state.dragOrder.indexOf(item) * (HEIGHT + 10);
        const draggedTop = state.order.indexOf(item) * (HEIGHT + 10);
        // console.log(`start of dragorder, item, dragorderindexof, orderindexof`)
        // console.log(state.dragOrder)
        // console.log(item)
        // console.log(state.dragOrder.indexOf(item))
        // console.log(state.order.indexOf(item))
        // const top = index * (HEIGHT + 10);
        // const draggedTop = index * (HEIGHT + 10);
        
        return (
          <Draggable
            key={index}
            id={item}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            <Rect
              isDragging={isDragging}
              top={isDragging ? draggedTop : top}
            >
              {item.ranking}.
              <br></br>
              {item.shop} ({item.nickname}),  {item.details},  
              Last Updated: {item.last_updated}
              <Modal
                activator={({setShowModal}) => (
                  <button style={{zIndex: 3}} onClick={() => setShowModal(true)}>Edit Details</button>)}
                >
                  <EditUserFeature 
                    userFeatureId={item.user_feature_id}/>
              </Modal>
            </Rect>
          </Draggable>
        );
      })}
      {unranked.map( (item, index) => {
          return (
            <div style={{position: "relative"}}>
              <Rect
                key={index}
                top={(index + state.order.length)* (HEIGHT + 10)}
              >
                {item.ranking}.
                <br></br>
                {item.shop} ({item.nickname}),  {item.details},  
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
    );
  } else return null;
}


function EditButton(props) {
  let history = useHistory();

  const editDetails = () => {
    const userFeatureId = props.userFeatureId;
    history.push(`/edit-user-feature/${userFeatureId}`)
  }

  return <button onClick={editDetails}>Edit Details</button>
}

function EditUserFeature(props) {
  // const {userFeatureId} = useParams();
  const userFeatureId = props.userFeatureId;
  let history = useHistory();
  // const [info, setInfo] = React.useState({});
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
      alert(data.message);
      const toRank = featureName
      if(data.need_to_rerank) {
        history.push(`/redirect-rankings/${toRank}/${userFeatureId}`)
      } else { history.push(`/redirect-rankings/${toRank}/none`)}
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






//   const modalContent =  showModal && (
//     <div className="overlay">
//       <div className="modal">
//         <div className="modal-body">{children}</div>
//         <button
//           // className="modal-close"
//           type="button"
//           onClick= {() => setShowModal(false)}
//         >
//           X
//         </button>
//       </div>
//    </div>
//   )

// return (modalContent)









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






function Modal(props) {
  const [showModal, setShowModal] = React.useState(false)
  const activator = props.activator;
  const modalContent =  (
      <div className="overlay">
        <div className="modal">
          <div className="modal-body">
            {props.children}
          </div>
          <button
            // className="modal-close"
            type="button"
            onClick= {() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
     </div>
    )

  return (
    <React.Fragment>
      {activator({setShowModal})}
      {createPortal(showModal ? modalContent : null, document.body)}
      {/* {showModal ? modalContent : null} */}
    </React.Fragment>
  )
}







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