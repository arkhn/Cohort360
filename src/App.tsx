import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'
import ApolloClient from 'apollo-boost'

import { PersistGate } from 'redux-persist/integration/react'

import Connexion from './views/Connexion/Connexion'
import Accueil from './views/Accueil/Accueil'
import RechercherPatient from './views/RechercherPatient/RechercherPatient'
import RechercheSauvegarde from './views/RechercheSauvegarde/RechercheSauvegarde'
import Patient from './views/Patient/Patient'
import Scope from './views/Scope/Scope'
import Perimetre from './views/Perimetre/Perimetre'
import Cohort from './views/Cohort/Cohort'
import MyPatients from './views/MyPatients/MyPatients'
import PrivateRoute from './components/Routes/Private'
import LeftSideBar from './components/LeftSideBar/LeftSideBar'
import CreationCohorte from './views/CreationCohorte/CreationCohorte'

import { Provider } from 'react-redux'
import { store, persistor } from './state/store'
import { AUTH_API_URL } from './constants'

const authClient = new ApolloClient({
  uri: AUTH_API_URL
})

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ApolloProvider client={authClient}>
        <BrowserRouter>
          <CssBaseline />
          <Switch>
            {/* <Route path="/*" render={() => '404 not found'} /> */}
            {/* TODO: Change connexion to /login */}
            <Route exact path="/" component={Connexion} />
            {/* TODO: Change home to / */}
            <PrivateRoute
              exact
              path="/accueil"
              render={() => (
                <>
                  <LeftSideBar open={true} />
                  <Accueil />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/perimetre"
              render={() => (
                <>
                  <LeftSideBar />
                  <Scope />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/rechercher_patient"
              render={() => (
                <>
                  <LeftSideBar />
                  <RechercherPatient />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/rechercher_patient/:search"
              render={() => (
                <React.Fragment>
                  <LeftSideBar />
                  <RechercherPatient />
                </React.Fragment>
              )}
            />
            <PrivateRoute
              exact
              path="/mes_patients/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <MyPatients />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/mes_patients"
              render={() => (
                <>
                  <LeftSideBar />
                  <MyPatients />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/recherche_sauvegarde"
              render={() => (
                <>
                  <LeftSideBar />
                  <RechercheSauvegarde />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/new/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <CreationCohorte />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/new"
              render={() => (
                <>
                  <LeftSideBar />
                  <CreationCohorte />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/:cohortId/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Cohort />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/:cohortId"
              render={() => (
                <>
                  <LeftSideBar />
                  <Cohort />
                </>
              )}
            />
            <PrivateRoute
              path="/perimetres/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Perimetre />
                </>
              )}
            />
            <PrivateRoute
              path="/perimetres"
              render={() => (
                <>
                  <LeftSideBar />
                  <Perimetre />
                </>
              )}
            />
            <PrivateRoute
              path="/patients/:patientId/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Patient />
                </>
              )}
            />
            <PrivateRoute
              path="/patients/:patientId"
              render={() => (
                <>
                  <LeftSideBar />
                  <Patient />
                </>
              )}
            />
            <PrivateRoute
              exact
              render={() => (
                <>
                  <LeftSideBar open={true} />
                  <Accueil />
                </>
              )}
            />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    </PersistGate>
  </Provider>
)

export default App
