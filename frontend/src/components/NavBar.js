import "../static/css/HomePage.scss"
import HomePage from "./HomePage"
import Login from "./Login";
import CreateAccount from "./CreateAccount"
import Dashboard from "./Dashboard"
import {BrowserRouter as Router, Switch, Link, Route} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector, useDispatch } from 'react-redux'
import {logout} from '../actions';
import { Nav, Navbar, NavItem} from "react-bootstrap"


function NavBar() {
      const isLogged = useSelector(state => state.isLogged)
      const dispatch = useDispatch();

      function deleteCookies() {
        var now = new Date();
        now.setMinutes(now.getMinutes() - 15)
        document.cookie = ("timelimit = Set; expires=" + now.toUTCString())
        document.cookie = ("userexists=; expires=" + now.toUTCString())
        document.cookie = ("LeagueInfo=; expires=" + now.toUTCString())
      }

      function logoutUser() {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        deleteCookies()
        dispatch(logout())
        
      }

      return (
        <Router>
          <Navbar collapseOnSelect expand="lg">
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">
              <ul className="navbar-nav w-100">
              <NavItem>
                  <li className="nav-item px-4">
                    <Link to="/" className="link" style={{ textDecoration: 'none' }}>Home</Link>
                  </li>
              </NavItem>
              <NavItem to="/dashboard" >
                  <li className="nav-item item1 px-4">
                    <Link to="/dashboard" style={{ textDecoration: 'none' }} className="link">League of Legends</Link>
                  </li>
              </NavItem>
                </ul>
              </Nav>
              <Nav>
              <NavItem>
              <li className="nav-item signLogin px-4">
                {isLogged ? <Link to ="/" className="link" style={{ textDecoration: 'none' }}><button className="btn btn-outline-light" onClick={logoutUser}>Logout</button></Link> : <Link to="/login" className="link" style={{ textDecoration: 'none' }}><button className="btn btn-outline-light">Login</button></Link>}
              </li>
              </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/dashboard' component={Dashboard}/>
        <Route path='/login' component={Login}/>
        <Route path='/createAccount' component={CreateAccount} />
      </Switch>

      </Router>
    );
}
  export default NavBar;



