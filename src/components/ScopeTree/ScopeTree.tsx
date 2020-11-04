import React, { useEffect, useState } from 'react'
import MaterialTable from 'material-table'
import useStyles, { itemStyles } from './styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

import { getScopeRows } from '../../services/scopeService'
import { ScopeTreeRow } from 'types'
import { useAppSelector } from 'state'

type ScopeTreeProps = {
  title: string
  submit: (selectedItems: ScopeTreeRow[]) => void
}

const ScopeTree: React.FC<ScopeTreeProps> = ({ title, submit }) => {
  const classes = useStyles()
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>([])

  const practitioner = useAppSelector((state) => state.me)

  useEffect(() => {
    setLoading(true)
    fetchData()
      .then((rows) => {
        rows && setRootRows(rows)
      })
      .then(() => setLoading(false))
  }, []) // eslint-disable-line

  const fetchData = async () => {
    if (practitioner) {
      const rootRows = await getScopeRows(practitioner.id)
      return rootRows
    }
  }

  return (
    <div className={classes.container}>
      {loading ? (
        <Grid container justify="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <MaterialTable
          columns={[
            { title: 'Nom', field: 'name' },
            {
              title: 'Nombre de patients',
              field: 'quantity',
              searchable: false
            }
          ]}
          data={rootRows}
          parentChildData={(child, items) =>
            items.find((item) => item.id === child.parentId)
          }
          options={{
            showTitle: false,
            draggable: false,
            paging: false,
            actionsColumnIndex: -1,
            selection: true,
            toolbar: false,
            headerStyle: {
              height: '42px',
              backgroundColor: '#D1E2F4',
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#0063af'
            },
            // rowStyle: (rowData, index, level) => {
            //   switch (level) {
            //     case 0:
            //       return itemStyles.level0
            //     case 1:
            //       return itemStyles.level1
            //     case 2:
            //       return itemStyles.level2
            //     default:
            //       return itemStyles.level3
            //   }
            // }
          }}
          onSelectionChange={(rows) => setSelectedItems(rows)}
        />
      )}
      <div className={classes.buttons}>
        <Button
          variant="contained"
          disableElevation
          disabled={!selectedItems.length}
          // onClick={fetchData}
          className={classes.cancelButton}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!selectedItems.length}
          onClick={() => {
            submit(selectedItems)
          }}
          className={classes.validateButton}
        >
          Valider
        </Button>
      </div>
    </div>
  )
}

export default ScopeTree
