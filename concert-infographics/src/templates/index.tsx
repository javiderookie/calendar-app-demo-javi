import type { Component } from 'solid-js'
import type { Format, Infographic, Palette } from '../types'
import Bold from './Bold'
import Minimal from './Minimal'
import Analog from './Analog'

export interface TemplateProps {
  doc: Infographic
  format: Format
}

export interface Template {
  id: string
  label: string
  component: Component<TemplateProps>
  /** Default colors applied when the template is selected. */
  palette: Palette
}

export const TEMPLATES: Template[] = [
  {
    id: 'analog',
    label: 'Analógico (riso retro)',
    component: Analog,
    palette: { bg: '#f3ecdc', fg: '#232d6b', accent: '#e78db3', accent2: '#4fd88a' },
  },
  {
    id: 'bold',
    label: 'Bold (cartel)',
    component: Bold,
    palette: { bg: '#111111', fg: '#f5f1e8', accent: '#ff5a36', accent2: '#ffd23f' },
  },
  {
    id: 'minimal',
    label: 'Minimal (agenda)',
    component: Minimal,
    palette: { bg: '#111111', fg: '#f5f1e8', accent: '#ff5a36', accent2: '#2b59c3' },
  },
]

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
