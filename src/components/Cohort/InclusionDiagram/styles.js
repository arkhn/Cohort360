import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0px',
    alignItems: 'center'
  },
  rootCard: {
    maxWidth: '25rem',
    border: '1px solid #C4C3C4',
    borderRadius: '10px'
  },
  rootCardHeader: {
    textAlign: 'center',
    backgroundColor: '#EAF0F6',
    borderBottom: '1px solid #C4C3C4'
  },
  rootCardContent: {
    justifyContent: 'center',
    textAlign: 'center'
  },
  rootButton: {
    backgroundColor: '#4263B3',
    textTransform: 'none',
    color: 'white'
  }
}))

export default useStyles
