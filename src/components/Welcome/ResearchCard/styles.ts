import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      marginTop: '16px'
    },
    link: {
      color: '#5BC5F2',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  })
)

export default useStyles
