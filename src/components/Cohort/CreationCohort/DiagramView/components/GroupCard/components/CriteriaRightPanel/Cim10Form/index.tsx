import React from 'react'
// import { Tabs, Tab } from '@material-ui/core'

import Cim10Form from './components/Form/Cim10Form'
// import Cim10Hierarchy from './components/Hierarchy/Cim10Hierarchy'
//
// import useStyles from './styles'

const defaultCondition = {
  title: 'Critère de diagnostic',
  code: [],
  diagnosticType: [],
  encounter: 0,
  comparator: { id: 'e', label: '=' },
  startOccurrence: '',
  endOccurrence: '',
  type: 'Condition'
}

const Index = (props: any) => {
  // FIXME: hierarchy of diagnostics has been disabled
  // const classes = useStyles()

  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  // const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>('hierarchy')
  // const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultCondition)

  const isEdition = selectedCriteria !== null

  // const _onChangeSelectedHierarchy = (code: any) => {
  //   onChangeDefaultValues({
  //     ...defaultValues,
  //     code
  //   })
  //   onChangeTab('form')
  // }

  return (
    <>
      <Cim10Form
        isEdition={isEdition}
        criteria={criteria}
        selectedCriteria={selectedCriteria || defaultCondition}
        onChangeSelectedCriteria={onChangeSelectedCriteria}
        goBack={goBack}
      />
      {/*<div>*/}
      {/*  <Tabs className={classes.tabs} value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>*/}
      {/*    <Tab label="Hierarchie" value="hierarchy" />*/}
      {/*    <Tab label="Formulaire" value="form" />*/}
      {/*  </Tabs>*/}
      {/*</div>*/}
      {/*{seletedTab === 'form' ? (*/}
      {/*  <Cim10Form*/}
      {/*    isEdition={isEdition}*/}
      {/*    criteria={criteria}*/}
      {/*    selectedCriteria={defaultValues}*/}
      {/*    onChangeSelectedCriteria={onChangeSelectedCriteria}*/}
      {/*    goBack={goBack}*/}
      {/*  />*/}
      {/*) : (*/}
      {/*  <Cim10Hierarchy*/}
      {/*    isEdition={isEdition}*/}
      {/*    criteria={criteria}*/}
      {/*    selectedCriteria={selectedCriteria}*/}
      {/*    onChangeSelectedHierarchy={_onChangeSelectedHierarchy}*/}
      {/*    goBack={goBack}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  )
}
export default Index
