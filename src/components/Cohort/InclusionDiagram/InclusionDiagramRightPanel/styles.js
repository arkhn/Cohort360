import { makeStyles } from '@material-ui/core/styles'

export default makeStyles(() => ({
  headerRoot: {
    display: 'flex',
    height: '72px',
    backgroundColor: '#317EAA',
    alignItems: 'center',
    color: 'white',
    padding: '20px'
  },
  icon: {
    color: 'white'
  },
  searchIcon: {
    color: '#9F9F9F'
  },
  buttonRoot: {
    width: '100%',
    marginBottom: '1em',
    textTransform: 'none',
    justifyContent: 'flex-start'
  },
  criteriaButtonRoot: {
    width: '100%',
    marginBottom: '0.2em',
    textTransform: 'none',
    justifyContent: 'flex-start',
    color: '#707070'
  },
  subContainerRoot: {
    padding: '2em',
    color: '#707070'
  },
  dividerRoot: {
    backgroundColor: 'white'
  },
  searchBar: {
    border: '1px solid #9F9F9F',
    borderRadius: '5px',
    paddingLeft: '9px'
  },
  panelSubTitle: {
    marginTop: '1em',
    paddingLeft: '9px'
  }
}))
