import { toPng } from 'html-to-image'

export async function exportPng(node: HTMLElement, width: number, height: number, name: string) {
  await document.fonts.ready
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    style: { transform: 'none' },
  })
  const link = document.createElement('a')
  link.download = `${name || 'infografia'}.png`
  link.href = dataUrl
  link.click()
}
