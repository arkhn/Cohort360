import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Button, Chip, Grid, IconButton, InputAdornment, InputBase, Typography } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import ClearIcon from '@material-ui/icons/Clear'
import InfoIcon from '@material-ui/icons/Info'
import SortIcon from '@material-ui/icons/Sort'

import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from '../../Cohort/Documents/DocumentList/DocumentList'
import SortDialog from '../../Filters/SortDialog/SortDialog'

import { fetchDocuments } from '../../../services/patient'
import { IDocumentReference } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition } from 'types'

import useStyles from './styles'

type PatientDocsTypes = {
  groupId?: string
  patientId: string
  documents?: (CohortComposition | IDocumentReference)[]
  total: number
  deidentifiedBoolean: boolean
  sortBy: string
  sortDirection: 'asc' | 'desc'
}
const PatientDocs: React.FC<PatientDocsTypes> = ({
  groupId,
  patientId,
  documents,
  total,
  deidentifiedBoolean,
  sortBy,
  sortDirection
}) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalDocs, setTotalDocs] = useState(total)
  const [docs, setDocs] = useState(documents)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [openSort, setOpenSort] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState(sortDirection)
  const [showFilterChip, setShowFilterChip] = useState(false)

  const documentLines = 20 // Number of desired lines in the document array

  const sortOptions = [
    { label: 'Date', code: 'date' },
    { label: 'Type de document', code: 'type' }
  ]

  const fetchDocumentsList = (newSortBy: string, newSortDirection: string, input = searchInput, page = 1) => {
    setLoadingStatus(true)

    const selectedDocTypesCodes = selectedDocTypes.map((docType) => docType.code)

    fetchDocuments(
      deidentifiedBoolean,
      newSortBy,
      newSortDirection,
      page,
      patientId,
      input,
      selectedDocTypesCodes,
      nda,
      startDate,
      endDate,
      groupId
    )
      .then((docResp) => {
        setDocs(docResp?.docsList ?? [])
        setTotalDocs(docResp?.docsTotal ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
  }

  const handleClearInput = () => {
    setSearchInput('')
    fetchDocumentsList(_sortBy, _sortDirection, '')
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleOpenSortDialog = () => {
    setOpenSort(true)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchDocumentsList(_sortBy, _sortDirection, searchInput, value || 1)
  }

  useEffect(() => {
    handleChangePage()
  }, [nda, selectedDocTypes, startDate, endDate]) // eslint-disable-line

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    if (submit) {
      setShowFilterChip(true)
    }
  }

  const handleChangeInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const onSearchDocument = () => {
    if (searchInput !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    handleChangePage()
  }

  const onKeyDown = (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument()
    }
  }

  const handleCloseSortDialog = (submitSort: boolean) => {
    setOpenSort(false)
    submitSort && onSearchDocument()
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        value &&
          setNda(
            nda
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'selectedDocTypes':
        value && setSelectedDocTypes(selectedDocTypes.filter((item) => item !== value))
        break
      case 'startDate':
        setStartDate(null)
        break
      case 'endDate':
        setEndDate(null)
        break
    }
  }

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid container justify="space-between" alignItems="center">
        <Typography variant="button">{totalDocs} document(s)</Typography>
        <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
          <div className={classes.documentButtons}>
            <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
              <InputBase
                placeholder="Rechercher dans les documents"
                className={classes.input}
                value={searchInput}
                onChange={handleChangeInput}
                onKeyDown={onKeyDown}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearInput}>{searchInput && <ClearIcon />}</IconButton>
                  </InputAdornment>
                }
              />
              <IconButton type="submit" aria-label="search" onClick={onSearchDocument}>
                <SearchIcon fill="#ED6D91" height="15px" />
              </IconButton>
            </Grid>
            <IconButton type="submit" onClick={() => setHelpOpen(true)}>
              <InfoIcon />
            </IconButton>
            <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
            <Button
              variant="contained"
              disableElevation
              onClick={handleOpenDialog}
              startIcon={<FilterList height="15px" fill="#FFF" />}
              className={classes.searchButton}
            >
              Filtrer
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={handleOpenSortDialog}
              startIcon={<SortIcon height="15px" fill="#FFF" />}
              className={classes.searchButton}
            >
              Trier
            </Button>
            <SortDialog
              open={openSort}
              onClose={() => handleCloseSortDialog(false)}
              onSubmit={() => handleCloseSortDialog(true)}
              sortOptions={sortOptions}
              sortBy={_sortBy}
              onChangeSortBy={setSortBy}
              sortDirection={_sortDirection}
              onChangeSortDirection={setSortDirection}
            />
          </div>
        </Grid>
      </Grid>
      <Grid>
        {showFilterChip &&
          nda !== '' &&
          nda
            .split(',')
            .map((value) => (
              <Chip
                className={classes.chips}
                key={value}
                label={value}
                onDelete={() => handleDeleteChip('nda', value)}
                color="primary"
                variant="outlined"
              />
            ))}
        {showFilterChip &&
          selectedDocTypes.length > 0 &&
          selectedDocTypes.map((docType) => (
            <Chip
              className={classes.chips}
              key={docType.code}
              label={docType.label}
              onDelete={() => handleDeleteChip('selectedDocTypes', docType)}
              color="primary"
              variant="outlined"
            />
          ))}
        {showFilterChip && startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>
      <DocumentList
        loading={loadingStatus}
        documents={docs}
        searchMode={searchMode}
        showIpp={false}
        deidentified={deidentifiedBoolean}
      />
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalDocs / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
      <DocumentFilters
        open={open}
        onClose={handleCloseDialog(false)}
        onSubmit={handleCloseDialog(true)}
        nda={nda}
        onChangeNda={setNda}
        selectedDocTypes={selectedDocTypes}
        onChangeSelectedDocTypes={setSelectedDocTypes}
        startDate={startDate}
        onChangeStartDate={setStartDate}
        endDate={endDate}
        onChangeEndDate={setEndDate}
        deidentified={deidentifiedBoolean}
      />
    </Grid>
  )
}

export default PatientDocs
