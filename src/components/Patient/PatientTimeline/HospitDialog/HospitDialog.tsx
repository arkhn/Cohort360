import React, { useState } from 'react'

import { Dialog, DialogActions, DialogTitle } from '@material-ui/core'
import DocumentTable from '../../PatientDocs/DocumentTable/DocumentTable'

import Pagination from '@material-ui/lab/Pagination'

import {
  IDocumentReference,
  IEncounter
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition } from 'types'

import useStyles from './styles'

type HospitDialogTypes = {
  open: boolean
  onClose: () => void
  documents?: (CohortComposition | IDocumentReference)[]
  currentEncounter?: IEncounter | null
}
const HospitDialog: React.FC<HospitDialogTypes> = ({
  open,
  onClose,
  documents,
  currentEncounter
}) => {
  const classes = useStyles()
  const documentLines = 4 // Number of desired lines in the document array
  const [page, setPage] = useState(1)

  const handleChange = (_event: any, value: React.SetStateAction<number>) => {
    setPage(value)
  }

  //This filters the documents only if a patient's encounter is given by props
  //Should work for Composition AND DocumentReference FHIR resources
  const documentsToDisplay = currentEncounter
    ? documents?.filter((doc) => {
        if (doc.resourceType === 'DocumentReference') {
          return (
            doc.context?.encounter?.[0].reference?.split('/')[1] ===
            currentEncounter.id
          )
        } else {
          return doc.encounter?.id === currentEncounter.id
        }
      })
    : documents

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth={'lg'}
    >
      <DialogTitle id="simple-dialog-title">Hospitalisation</DialogTitle>
      {documentsToDisplay && (
        <DocumentTable
          documentLines={documentLines}
          documents={documentsToDisplay}
          page={page}
        />
      )}
      <DialogActions>
        <Pagination
          className={classes.pagination}
          count={Math.ceil((documentsToDisplay?.length ?? 0) / documentLines)}
          variant="outlined"
          shape="rounded"
          onChange={handleChange}
        />
      </DialogActions>
    </Dialog>
  )
}
export default HospitDialog
