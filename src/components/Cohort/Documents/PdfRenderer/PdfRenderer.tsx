import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: { flexDirection: 'column' },
  section: {
    display: 'flex',
    flexDirection: 'column',
    margin: 4,
    padding: 5,
    flexGrow: 1
  },
  header: {
    marginBottom: 40,
    padding: 30,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottom: '2px solid #153D8A',
    borderTop: '2px solid #153D8A',
    fontSize: '1.3rem'
  }
})

type PdfRendererProps = {
  content: string
}

const PdfRenderer: React.FC<PdfRendererProps> = ({ content }) => {
  // FIXME: for now we assume that each section of the document is
  // splitted by a double line break but this is not always the case.
  const sections = content.split('\n\n').filter(Boolean)
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, ...styles.header }}>
          <Text>Ce document a été automatiquement généré à partir du contenu texte d'un compte-rendu médical</Text>
        </View>
        {sections.map((t, index) => (
          <View style={styles.section} key={index}>
            <Text>{t}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default PdfRenderer
