declare module 'dxf-parser' {
  export type DxfEntity = Record<string, unknown> & { type: string }

  export type DxfDocument = Record<string, unknown> & {
    entities?: DxfEntity[]
    tables?: unknown
    blocks?: unknown
  }

  export default class DxfParser {
    parseSync(contents: string): DxfDocument
  }
}

