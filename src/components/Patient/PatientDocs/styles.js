import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  pagination: {
    margin: '10px 0',
    float: 'right',
    '& button': {
      backgroundColor: '#fff',
      color: '#5BC5F2'
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      color: '#0063AF',
      backgroundColor: '#FFF'
    }
  },
  documentTable: {
    margin: '0 auto'
  },
  documentButtons: {
    display: 'none',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  searchBar: {
    width: '180px',
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: '20px'
  },
  autocomplete: {
    width: 200,
    margin: '0 16px'
  },
  filterAndSort: {
    width: 'auto'
  },
  radioGroup: {
    flexDirection: 'row',
    margin: '6px 6px 0 6px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    width: '150px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    borderRadius: '25px',
    margin: '0 4px'
  },
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))

export default useStyles
