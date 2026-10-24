import type { Component } from 'solid-js'
import type { Format, Infographic, Palette } from '../types'
import Bold from './Bold'
import Minimal from './Minimal'
import Analog from './Analog'
import MapRoute from './MapRoute'
import Iso from './Iso'
import Panal from './Panal'
import MadridMap from './MadridMap'
import Disc from './Disc'
import Bubbles from './Bubbles'
import Cables from './Cables'
import Chronicle from './Chronicle'
import Mix from './Mix'

export interface TemplateProps {
  doc: Infographic
  format: Format
  /** Set by the editor preview so templates can offer drag-to-place interactions. */
  onPinMove?: (id: string, x: number, y: number) => void
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
    id: 'map',
    label: 'Mapa (ruta por salas)',
    component: MapRoute,
    palette: { bg: '#f4ead8', fg: '#1f4e79', accent: '#c4513a', accent2: '#3f8f5a' },
  },
  {
    id: 'iso',
    label: 'Isométrico (recorrido 3D)',
    component: Iso,
    palette: { bg: '#4a55a0', fg: '#ffffff', accent: '#ef6f6c', accent2: '#f6d55c' },
  },
  {
    id: 'bee',
    label: 'Panal (festival primavera)',
    component: Panal,
    palette: { bg: '#f7c936', fg: '#1d2a4d', accent: '#4f9be6', accent2: '#e8524a' },
  },
  {
    id: 'madrid',
    label: 'Mapa de Madrid (salas reales)',
    component: MadridMap,
    palette: { bg: '#fbf1d3', fg: '#1d2a4d', accent: '#d9881c', accent2: '#4f9be6' },
  },
  {
    id: 'disc',
    label: 'Disco (vinilo y cifras)',
    component: Disc,
    palette: { bg: '#f2efe8', fg: '#161616', accent: '#c8102e', accent2: '#8c8c8c' },
  },
  {
    id: 'bubbles',
    label: 'Burbujas (gira por semanas)',
    component: Bubbles,
    palette: { bg: '#ffffff', fg: '#1c4587', accent: '#e21f26', accent2: '#9aa3ad' },
  },
  {
    id: 'cables',
    label: 'Cables (historia en pestañas)',
    component: Cables,
    palette: { bg: '#dde1e4', fg: '#2b2f33', accent: '#2f8fb3', accent2: '#e0703a' },
  },
  {
    id: 'chronicle',
    label: 'Crónica (espina cronológica)',
    component: Chronicle,
    palette: { bg: '#ece9df', fg: '#1f1f1f', accent: '#1f7a45', accent2: '#a9a9a9' },
  },
  {
    id: 'mix',
    label: 'Mezcla (manual de DJ)',
    component: Mix,
    palette: { bg: '#c3cfd9', fg: '#1d1d1f', accent: '#f1e6d6', accent2: '#c99a90' },
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
