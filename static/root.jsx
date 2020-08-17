const Router = ReactRouterDOM.BrowserRouter;
const Route =  ReactRouterDOM.Route;
const Link =  ReactRouterDOM.Link;
const Prompt =  ReactRouterDOM.Prompt;
const Switch = ReactRouterDOM.Switch;
const Redirect = ReactRouterDOM.Redirect;
const useHistory = ReactRouterDOM.useHistory;


function CreateAccount() {
  // A form to create a new user account

  let history = useHistory()

  // Hooks for states, used for values of input fields
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
      <label htmlFor="email">Email:</label>
      <input 
        id="email" 
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      ></input>
      <label htmlFor="password">Password:</label>
      <input 
        id="password" 
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      ></input>
      <label htmlFor="home-zipcode">Home Zipcode:</label>
      (we'll find coffee near you)
      <input 
        id="home-zipcode" 
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
      <label htmlFor="email">Email:</label>
      <input 
        id="email" 
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      ></input>
      <label htmlFor="password">Password:</label>
      <input
        id="password" 
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
  let history = useHistory()

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
  // A list of features of a certain type

  const all_features = []

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


function ShopsAggregate(props) {
  // Renders aggregate of drinks and shopAspects based on shops
  // props.listOfUserFeatures includes drinks and shop aspects

  return <p>shops will go here</p>
}


function Homepage(props) {
  //Homepage for registered users, appears upon successful login

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
      console.log(data.drink)
      console.log(data.shop_aspect)
      setShopAspects(data.shop_aspect)
    })
  }, [])


  return (
    <div>
      <h1>Honey, you're home!</h1>
      <p>Searching in {zipcode}</p>
      <ShopsAggregate listOfUserFeatures={drinks.concat(shopAspects)} />
      <ListOfUserFeatures listOfUserFeatures={drinks} />
      <ListOfUserFeatures listOfUserFeatures={shopAspects} />
    </div>
    )
}


function About() {
  // Explain what the app is about
  return <div> This app lets you rank your favorite coffee shop drinks </div>
}


function Logout(props) { 
  // Logs you out

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