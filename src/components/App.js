import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Logo from '../images/logo.svg';
import Accepted from '../images/accepted.svg';
import Rejected from '../images/rejected.svg';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import DeleteCardPopup from './DeleteCardPopup';
import ImagePopup from './ImagePopup';
import InfoTooltip from './InfoTooltip';
import { authorize, getToken, register } from './apiAuth';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import api from '../utils/Api';

function App() {

  const [isAddPlacePopupOpen, setisAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setisEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setisEditProfilePopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setisDeleteCardPopupOpen] = useState(false);
  const [isInfoTooltipOpen, setisInfoTooltipOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({name: '', about: ''});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [idDeletedCard, setIdDeletedCard] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useHistory();
  const [headerState, setHeaderState] = useState({name: '', link: ''});
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
    .then(([ userData, cards ]) => {
      setCurrentUser(userData);
      const arr = cards.map((item) => {
        return {
          link: item.link,
          name: item.name,
          likes: item.likes,
          likesAmount: item.likes.length,
          id: item._id,
          owner: item.owner._id
        }
      });
      setCards(arr);
      setIsLoading(false);
    })
    .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      getToken(jwt)
      .then((res) => {
          setLoggedIn(true);
          console.log(res)
          setUserEmail(res.data.email);
          history.push('/');
        })
    }
  }, []);

  useEffect(() => {
    if (loggedIn) history.push('/');
  }, [loggedIn]);

  function handleCardLike(likes, id) {

    const isLiked = likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(id, isLiked)
    .then((Card) => {
      const newCard = {
        link: Card.link,
        name: Card.name,
        likes: Card.likes,
        likesAmount: Card.likes.length,
        id: Card._id,
        owner: Card.owner._id
      }
        setCards((state) => state.map((c) => c.id === id ? newCard : c));
        return true;
    })
    .catch(err => console.log(err))
  }

  function handleCardDelete() {
    api.deleteCard(idDeletedCard)
    .then(() => {
      setCards(cards.filter(card => card.id !== idDeletedCard));
      closeAllPopups();
    })
    .catch(err => console.log(err))
  }

  function handleAddPlaceClick() {
    setisAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setisEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setisEditProfilePopupOpen(true);
  }

  function handleDeleteCardConfirmClick(id) {
    setIdDeletedCard(id);
    setisDeleteCardPopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleInfoTooltipClick() {
    setisInfoTooltipOpen(true);
  }

  function closeAllPopups() {
    setisAddPlacePopupOpen(false);
    setisEditAvatarPopupOpen(false);
    setisEditProfilePopupOpen(false);
    setisDeleteCardPopupOpen(false);
    setSelectedCard(false);
    setisInfoTooltipOpen(false);
  } 

  function handleUpdateUser(info) {
    api.editUserInfo(info.name, info.about)
    .then((res) => {
      setCurrentUser(res);
      closeAllPopups();
    })
    .catch(err => console.log(err))
  }

  function handleUpdateAvatar(info) {
    api.editUserAvatar(info.avatar)
    .then((res) => {
      setCurrentUser(res);
      closeAllPopups();
    })
    .catch(err => console.log(err))
  }

  function handleAddPlaceSubmit(name, link) {
    api.postNewCard(name, link)
    .then((res) => {
      const newCard = {
        link: res.link,
        name: res.name,
        likes: res.likes,
        likesAmount: res.likes.length,
        id: res._id,
        owner: res.owner._id
      }
      setCards([newCard, ...cards]);
      closeAllPopups();
    })
    .catch(err => console.log(err))
  }

  function handleLoginSubmit(email, password) {
    return authorize({ email, password })
    .then(res => {
      localStorage.setItem('jwt', res.token);
      setUserEmail(email);
      setLoggedIn(true);
    })
    .catch((res) => {
      console.log(res);
      setInfoTooltip({icon: Rejected, description: 'Что-то пошло не так! Попробуйте ещё раз.'});
      setisInfoTooltipOpen(true);
    })
  }

  function handleRegisterSubmit(email, password) {
    register({ email, password })
    .then(() => {
      setInfoTooltip({icon: Accepted, description: 'Вы успешно зарегистрировались!'});
      setisInfoTooltipOpen(true);
      history.push('/sign-in');
    })
    .catch((res) => {
      console.log(res);
      setInfoTooltip({icon: Rejected, description: 'Что-то пошло не так! Попробуйте ещё раз.'});
      setisInfoTooltipOpen(true);
    })
  }

  function handleSignOut () {
    if (loggedIn) {
      localStorage.removeItem('jwt');
      setUserEmail('');
      setLoggedIn(false);
    }
  }

  const [infoTooltip, setInfoTooltip] = useState({icon: '', description: ''});

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__content">
          
          
          <Header logo={Logo} userEmail={userEmail} loggedIn={loggedIn} headerState={headerState} handleSignOut={handleSignOut} />
            <Switch>
              <Route exact path="/sign-up">
                {loggedIn ? <Redirect to="/" /> : <Register onSubmitRegister={handleRegisterSubmit} setHeaderState={setHeaderState} /> }
              </Route>
              <Route exact path="/sign-in">
                {loggedIn ? <Redirect to="/" /> : <Login onSubmitLogin={handleLoginSubmit} setHeaderState={setHeaderState} /> }
              </Route>
              <ProtectedRoute
                exact
                path="/"
                component={Main}
                onAddPlace={handleAddPlaceClick} 
                onEditAvatar={handleEditAvatarClick} 
                onEditProfile={handleEditProfileClick}
                onDeleteCofirm={handleDeleteCardConfirmClick}
                onCardClick={handleCardClick} 
                onCardLike={handleCardLike} 
                onCardDelete={handleCardDelete}
                onLogin={handleInfoTooltipClick}
                setHeaderState={setHeaderState}
                isLoading={isLoading}
                loggedIn={loggedIn}
                cards={cards} />
                <Route>
                  {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-up" />}
                </Route>
            </Switch>
          <Footer name={"\u00A9 2021 Mesto Russia"}/>
          <AddPlacePopup 
          isOpen={isAddPlacePopupOpen} 
          onClose={closeAllPopups} 
          onSubmitPlace={handleAddPlaceSubmit} />
          <EditAvatarPopup 
          isOpen={isEditAvatarPopupOpen} 
          onClose={closeAllPopups} 
          onUpdateAvatar={handleUpdateAvatar} />
          <EditProfilePopup 
          isOpen={isEditProfilePopupOpen} 
          onClose={closeAllPopups} 
          onUpdateUser={handleUpdateUser} />
          <DeleteCardPopup 
          isOpen={isDeleteCardPopupOpen}
          onClose={closeAllPopups}
          onClick={handleCardDelete} />
          <ImagePopup 
          isOpen={selectedCard} 
          onClose={closeAllPopups} />
          <InfoTooltip
          isOpen={isInfoTooltipOpen}
          onClose={closeAllPopups}
          icon={infoTooltip.icon}
          description={infoTooltip.description}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;