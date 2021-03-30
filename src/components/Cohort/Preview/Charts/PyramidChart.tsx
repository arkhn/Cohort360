//@ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react'
import * as d3 from 'd3'
import legend from './Legend'

type PyramidProps = {
  data?: Map<number, { male: number; female: number }>
  width?: number
  height?: number
}

const PyramidChart: React.FC<PyramidProps> = memo(({ data, width = 400, height = 250 }) => {
  const node = useRef<SVGSVGElement | null>(null)
  const [legendHtml, setLegend] = useState()

  useEffect(() => {
    if (!data || (data && !data.size)) {
      return
    }
    let valueMax = 0
    const valuesPos = []
    const sortedData: { age: number; male: number; female: number }[] = []
    for (const entry of data.entries()) {
      const [age, ageGenderValues] = entry
      const maleValue = ageGenderValues.male
      const femaleValue = ageGenderValues.female
      sortedData.push({
        age,
        male: maleValue,
        female: femaleValue
      })

      if (valueMax < maleValue || valueMax < femaleValue) {
        valueMax = Math.max(femaleValue, maleValue)
      }
      if (femaleValue !== 0 || maleValue !== 0) {
        valuesPos.push(age)
      }
    }
    sortedData.sort((d1, d2) => d1.age - d2.age)
    const yValueMin = sortedData[0].age === 0 ? sortedData[0].age : sortedData[0].age - 1
    const yValueMax = sortedData[sortedData.length - 1].age + 1

    // We need to fill all the ages not referred in the sortedData array
    const customData: { age: number; male: number; female: number }[] = []
    for (let index = 0; index < yValueMax - yValueMin - 1; index++) {
      const age = yValueMin + index + 1
      const item = sortedData.find((item) => item.age === age)
      customData.push(
        item ?? {
          age,
          male: 0,
          female: 0
        }
      )
    }
    const svg = d3.select(node.current)
    svg.selectAll('*').remove()
    svg.attr('height', height).attr('width', width)

    const margin = { top: 20, right: 20, bottom: 35, left: 30 }

    const femaleValue = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([width / 2, width - margin.right])

    const maleValue = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([width / 2, margin.left])

    const y = d3
      .scaleLinear()
      .domain([yValueMin, yValueMax])
      .nice()
      .range([height - margin.bottom, margin.top])

    const femaleAreaGenerator = d3
      .area()
      .curve(d3.curveLinear)
      .x0(width / 2)
      .x1((d) => femaleValue(d.female))
      .y((d) => y(d.age))

    const maleAreaGenerator = d3
      .area()
      .curve(d3.curveLinear)
      .x0(width / 2)
      .x1((d) => maleValue(d.male))
      .y((d) => y(d.age))

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('Ans')
        )

    const femaleAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(femaleValue)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )

    const maleAxis = (g) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(maleValue)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )
    svg.append('path').attr('d', femaleAreaGenerator(customData)).style('fill', '#FC568F')

    svg.append('path').attr('d', maleAreaGenerator(customData)).style('fill', '#78D4FA')

    svg.append('g').call(femaleAxis)

    svg.append('g').call(maleAxis)

    svg.append('g').call(yAxis)

    setLegend(
      legend({
        color: d3.scaleOrdinal().domain(['Hommes', 'Femmes']).range(['#78D4FA', '#FC568F']),
        columns: '70px'
      })
    )
  }, [node, data, height, width])

  return (
    <div style={{ display: 'flex' }}>
      <svg ref={node}></svg>
      <div style={{ display: 'flex' }} dangerouslySetInnerHTML={{ __html: legendHtml }} />
    </div>
  )
})
export default PyramidChart
