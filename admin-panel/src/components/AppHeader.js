import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import classes from './AppHeader.module.css'
import AdminChat from './AdminChat/AdminChat'

import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CButton,
  CFooter,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useTranslation } from 'react-i18next'


const AppHeader = () => {
  // Hooks must be inside the functional component
  
  const { i18n, t } = useTranslation();
  const [state, setState] = useState([])
  const [loggedInUsers, setLoggedInUsers] = useState([])
  const [selectedUserEmail, setSelectedUserEmail] = useState(null); // State for selected user email
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

   // Toggle dropdown visibility when chat button is clicked
   const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
    setIsAdminChatOpen(false)
  };
   // Language change handler
   const handleLanguageChange = (event) => {
    const selectedLang = event.target.value;
    i18n.changeLanguage(selectedLang);
  };
  
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    console.log('useEffect triggered'); // Check if the useEffect is being triggered
  
    const fetchLoggedInUsers = async () => {
      const token = localStorage.getItem('authToken'); // Get token from local storage
      console.log('Token:', token); // Log the token to see if it's available
  
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/api-auth/logged-in-users/", {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
  
          console.log('Response status:', response.status); // Log the response status
  
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
  
          const data = await response.json();
          setLoggedInUsers(data.logged_in_users); // Set the fetched users in state
          console.log(loggedInUsers);
        } catch (error) {
          console.error('Error fetching logged-in users:', error);
        }
      }
    };
  
    // Fetch the data immediately and set up an interval for every 30 seconds
    fetchLoggedInUsers(); // Initial fetch
  
    const intervalId = setInterval(fetchLoggedInUsers, 5000); // Fetch every 30 seconds
  
    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // The empty dependency array ensures the effect runs once and sets up the interval
  
  
  useEffect(() => {
    console.log('Updated loggedInUsers:', loggedInUsers); // Check the latest data after it’s set
  }, [loggedInUsers]);

const handleAdminClick = (email) => {
  setSelectedUserEmail(email); // Set the selected user email
  // Toggle the chat open/close state based on current state
  setIsAdminChatOpen((prev) => !prev);
};

  return (
    <>
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
            {t('dashboard')}
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
        <CNavItem>
        <select defaultValue={"ar"} onChange={handleLanguageChange}>
        
          <option key='ar' value="ar">
            ar
          </option>
          <option key='en' value="en">
          en
        </option>
       
      </select>
        </CNavItem>
        <CNavItem>
            <CButton className={classes.chatButton} onClick={toggleDropdown}>
              {t("chat")}
            </CButton>
            {isDropdownVisible && (
              <div className={classes.loggedInUsers}>
                <ul>
                  {loggedInUsers.map((loggedInUser, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        console.log(`Clicked on: ${loggedInUser}`); // Log clicked user
                        handleAdminClick(loggedInUser); // Call the function to open chat
                      }}
                      className={classes.loggedInUser}
                    >
                      {loggedInUser}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
   
    {isAdminChatOpen && selectedUserEmail && (
      <AdminChat
        onClose={() => setIsAdminChatOpen(false)} // Correctly handle closing
        selectedChat={selectedUserEmail} // Pass the selected user's email
      />
    )}
    </>
  )
}

export default AppHeader
