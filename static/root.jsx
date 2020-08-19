const Router = ReactRouterDOM.BrowserRouter;
const {useHistory, Redirect, Switch, Prompt, Link, Route} = ReactRouterDOM;


function CreateAccount() {
  // A form to create a new user account

  // HOOKS
  let history = useHistory()
  // States for values of input fields
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [homeZipcode, setHomeZipcode] = React.useState('')

  // Callback for create account event
  const logIn = (event) => { 
    event.preventDefault();
    const formData = {'email': email, 
                      'password': password,
                      'homeZipcode': homeZipcode};
    fetch('/api/create-account', 
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: {'Content-Type' : 'application/json'}
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

  // HOOKS
  let history = useHistory()
  // State hooks for the input fields
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Callback for login event
  const logIn = (event) => { 
    event.preventDefault();
    const formData = {'email': email, 'password': password};
    fetch('/api/login', 
      {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: 'include',
        headers: {'Content-Type' : 'application/json'}
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


function LandingPage() {
  // First page anyone lands on, can login or create account

  // HOOKS
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
        key = {featuredShops[shop][0].user_feature_id}
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


function MapComponent(props) {
  // Create a map component

  const options = props.options;

  // Hooks
  // creates a reference object we can use when mounting our map
  const ref = React.useRef();
  const [theMap, setTheMap] = React.useState();
  // Upon component render, create the map itself
  React.useEffect( () => {
    // Initialize a map by updating the state of theMap to a new map object.
    const createMap = () => setTheMap(new window.google.maps.Map(ref.current, options));
    //Create a script element with google url as src if none is found
    if (!window.google) { // Create an html element with a script tag in the DOM
      const script = document.createElement('script');
      // Set the script tag's src attribute to the API URL
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBtYZMS7aWpKxyZ20XLWWNEMKb3eo6iOkY';
      // Mount the script tag at the document's head
      document.head.append(script);
      // Listen for it to load, then do createMap when it does
      script.addEventListener('load', createMap);
      //remove the event listener (we don't need it anymore)
      return () => script.removeEventListener('load', createMap);
    } else { // Initialize the map if a script element with google url IS found
      createMap();
    }
  }, [options.center.lat]); //Need the value of the lat of options because it does not change

  // A way to have a function affect the map right after it's been mounted
  // if (theMap && typeof onMount === 'function') onMount(theMap, onMountProps);

  // Return a div with the reference we made earlier, MAKE SURE IT HAS HEIGHT.
  return (
    <div 
      style = {{ height: `60vh`, margin: `1em 0`, borderRadius: `0.5em` }}
      ref = {ref}
    ></div>
  )
}


function AddNewUserFeature(props){
  // Form to add a new user feature to the database

  // Hooks
  const [drinkType, setDrinkType] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [liked, setLiked] = React.useState(true);
  const [shop, setShop] = React.useState('');

  const feature1 = {name: 'latte'};
  const feature2 = {name: 'iced latte'};

  return (
    <div>
      <label htmlFor="shop-input">Choose a Shop</label>
      <input
        id="shop-input"
        type="text"
        onChange={(e) => setShop(e.target.value)}
        value={shop}
        ></input>
      <label htmlFor="drink-type-input">Drink Type</label>
      <select
        id="drink-type-input"
        onChange={(e) => setDrinkType(e.target.value)}
        value={drinkType}
        >
        <option value="{feature1.name}">{feature1.name}</option>
        <option value="{feature2.name}">{feature2.name}</option>
      </select>
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
    </div>
  )
}


function Homepage(props) {
  //Homepage for registered users, appears upon successful login

  // HOOKS
  // State to determine conditional rendering
  const [viewShops, setViewShops] = React.useState(true)
  const [viewDrinks, setViewDrinks] = React.useState(false)
  const [viewShopAspects, setViewShopAspects] = React.useState(false)
  //State for zipcode
  const [zipcode, setZipcode] = React.useState('')
  const [drinks, setDrinks] = React.useState([])
  const [shopAspects, setShopAspects] = React.useState([])
  //Get info about a user upon rendering
  React.useEffect( () => {
    //send GET request to the get user information endpoint
    fetch('/api/get-user-information')
    .then(response => response.json())
    .then(data => {
      setZipcode(data.zipcode);
      setDrinks(data.drink);
      setShopAspects(data.shop_aspect)
    })
  }, [])

  // Callback that changes what is viewed on the page
  // Causes the component itself to rerender, since we are affecting its state(s)
  const changeView = (event) => {
    if (event.target.id === 'shops-view') {
      setViewShops(true);
      setViewDrinks(false);
      setViewShopAspects(false);
    }
    if (event.target.id === 'drinks-view') {
      setViewShops(false);
      setViewDrinks(true);
      setViewShopAspects(false);
    }
    if (event.target.id === 'shop-aspects-view') {
      setViewShops(false);
      setViewDrinks(false);
      setViewShopAspects(true);
    }
  }

  // Options for the mapcomponent to test it out
  const options = {
          center: { lat: 37.601773, lng: -122.202870},
          zoom: 11
        }
  
  return (
    <div>
      <h1>Honey, you're home!</h1>
      <p>Searching in {zipcode}</p>
      <MapComponent options={options} />
      <button id="shops-view" onClick={changeView} >
        Top Shops
      </button>
      <button id="drinks-view" onClick={changeView} >
        Top Drinks
      </button>
      <button id="shop-aspects-view" onClick={changeView} >
        Top Shop Aspects
      </button>
      {viewShops && <ListOfShops listOfUserFeatures={drinks.concat(shopAspects)} />}
      {viewDrinks && <ListOfUserFeatures listOfUserFeatures={drinks} />}
      {viewShopAspects && <ListOfUserFeatures listOfUserFeatures={shopAspects} />}
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
  React.useEffect( () => {
    fetch('/api/logout', 
      {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type' : 'application/json'}
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
            <Route path="/add-new-drink">
              <AddNewUserFeature />
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