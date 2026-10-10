import type { Component } from 'solid-js'
import type { Format, Infographic } from '../types'
import Bold from './Bold'
import Minimal from './Minimal'

export interface TemplateProps {
  doc: Infographic
  format: Format
}

export interface Template {
  id: string
  label: string
  component: Component<TemplateProps>
}

export const TEMPLATES: Template[] = [
  { id: 'bold', label: 'Bold (cartel)', component: Bold },
  { id: 'minimal', label: 'Minimal (agenda)', component: Minimal },
]

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
