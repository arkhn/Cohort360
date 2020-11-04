import { makeStyles } from '@material-ui/core/styles'

export default makeStyles(() => ({
  formContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  submitButton: {
    padding: '1em',
    backgroundColor: '#327EAA',
    color: 'white',
    border: '1px solid #D7DAE3',
    textTransform: 'none'
  },
  cancelButton: {
    padding: '1em',
    backgroundColor: '#F7F7F7',
    color: '#707070',
    border: '1px solid #D7DAE3',
    textTransform: 'none',
    fontWeight: 'bold'
  },
  formInput: {
    border: '1px solid #D7DAE3',
    borderRadius: '5px',
    padding: '0.5em'
  },
  formControl: {
    margin: '1em'
  },
  iconButtonRoot: {
    padding: '0px'
  }
}))
