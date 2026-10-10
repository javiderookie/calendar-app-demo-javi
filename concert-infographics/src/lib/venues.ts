// Approximate coordinates of Madrid live-music venues (street address level).
// Keys are normalised names; see normaliseVenue().
const MADRID_VENUES: Record<string, [number, number]> = {
  'el sol': [40.4198, -3.702], // C/ Jardines 3
  siroco: [40.4253, -3.7068], // C/ San Dimas 3
  'el sotano': [40.4117, -3.7081], // C/ Maldonadas 6
  copernico: [40.4337, -3.7156], // C/ Fernández de los Ríos 67
  'la riviera': [40.414, -3.7232], // Paseo Bajo de la Virgen del Puerto
  villanos: [40.4037, -3.7012], // C/ Bernardino Obregón 18
  uni: [40.4389, -3.705], // C/ Cea Bermúdez 21
  'uni madrid': [40.4389, -3.705],
  clamores: [40.4307, -3.7011], // C/ Alburquerque 14
  'cafe central': [40.4141, -3.701], // Plaza del Ángel 10
  'bogui jazz': [40.4228, -3.696], // C/ Barquillo 29
  'galileo galilei': [40.4405, -3.7108], // C/ Galileo 100
  galileo: [40.4405, -3.7108],
  'joy eslava': [40.4172, -3.7068], // C/ Arenal 11
  'teatro eslava': [40.4172, -3.7068],
  'teatro barcelo': [40.4271, -3.7006], // C/ Barceló 11
  'cafe berlin': [40.42, -3.708], // Costanilla de los Ángeles 20
  costello: [40.4195, -3.7007], // C/ Caballero de Gracia 10
  wurlitzer: [40.4194, -3.703], // C/ Tres Cruces 12
  maravillas: [40.4262, -3.7046], // C/ San Vicente Ferrer 33
  'teatro pavon': [40.41, -3.7075], // C/ Embajadores 9
}

export const normaliseVenue = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^(sala|club)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Parses "40.42, -3.70" style coordinates. */
export const parseCoords = (s: string): [number, number] | undefined => {
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : undefined
}

export const locateVenue = (name: string, override = ''): [number, number] | undefined =>
  parseCoords(override) ?? MADRID_VENUES[normaliseVenue(name)]
