let n = 0
/** Unique SVG id per component instance, so thumbnails and the preview never share defs. */
export const uid = (prefix: string) => `${prefix}-${++n}`
