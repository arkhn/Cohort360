import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
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
  }
}))

export default useStyles
