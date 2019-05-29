/**
 * Not in use for the replacement of headerFC
 * @2019/05/24 
 */
import React from 'react'
import { Link } from 'gatsby'
import PropTypes from 'prop-types'

import avatar from '../images/avatar.png'
import styles from '../style/header.module.css'

import { getUser } from '../utils/cache'
import * as minibus from '../utils/minibus'


const ListLink = props => (
  <li className={`nav-menu-item ${props.active?'active':''}`}>
    <Link to={props.to} className={'menu-link-close'} >
      {props.children}
    </Link>
  </li>
)
// fixed version of link for N-ormal height @2019/01/29
const NLink = props => (
  <Link 
    to={props.to} 
    className={props.className}
    style={{textDecoration: `none`, lineHeight: .9}}
    >
    {props.children}
  </Link>
)


export default class Header extends React.Component {

  constructor(props) {
    super(props)
  
    this.state = {
       name: '', // username
       path: '/', // current page path
       menuclose: true,
    };
  };

  // got the current page, active the menu style
  locationChangeHandler = pathObj => {
    this.setState({path: pathObj.path})
  }

  menulistCloseHandler = () => {
    this.setState({menuclose: !this.state.menuclose})
  }

  componentDidMount() {
    minibus.addEventListener(minibus.EVT_LOCATION_CHANGE, this.locationChangeHandler)

    let user = getUser()
    if(user) this.setState({name : user.userName})
  }

  componentWillUnmount() {
    minibus.removeEventListener(minibus.EVT_LOCATION_CHANGE, this.locationChangeHandler)
  }

  render() {

    const { siteTitle, siteLogo, menus } = this.props

    return (
      <header className={styles.headerFixed}>
        <div className={styles.headerBar}>
          {/** left logo */}
          {siteTitle && siteLogo ?
            (<NLink to="/" >
              <img src={siteLogo} alt="Logo" className={styles.siteLogo}/>
            </NLink>):
            (<h1 style={{ margin: 0, display: `block` }}>
              <Link to="/" className={styles.siteTitle+` ultron-txt-color`}>
                {siteTitle}
              </Link>
            </h1>)
          }
          {/** right menu */}
          <div className={styles.rightMenu} >
            <ul className={`main-menus ${this.state.menuclose?'close':'open'}`}>
              {
                menus &&
                menus.map(
                  (m, i) => <ListLink 
                              to={m.url} 
                              key={i} 
                              active={m.url==this.state.path}                              
                              >
                              {m.name}
                            </ListLink>
                )
              }
              <ListLink to='/profile'>PROFILE</ListLink>
            </ul>
            <div className={`${styles.avatarImg} main-avatar-margin`}>
              <NLink to="/profile" className={`main-menu-avatar`}>
                {this.state.name?
                  <span className="circle">
                    {this.state.name.substr(0,1).toUpperCase()}
                  </span>:
                  <img src={avatar} alt="avatar"/>
                }
              </NLink>
              <button className={`main-menu-expander`} onClick={this.menulistCloseHandler}>
                <span className={`icon-bar`}></span>
                <span className={`icon-bar`}></span>
                <span className={`icon-bar`}></span>
              </button>
            </div>
          </div>

        </div>
      </header>
    )
  }
  
}