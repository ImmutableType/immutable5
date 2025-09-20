export interface BookmarkItem {
    title: string
    source: string
    description?: string
    url: string
  }
  
  export interface BookmarkCollection {
    id: string
    title: string
    date: string
    items: BookmarkItem[]
    createdAt: number
  }
  
  export interface ParsedExtensionData {
    title: string
    date: string
    items: BookmarkItem[]
  }
  
  export interface TabData {
    id: string
    label: string
    content: React.ReactNode
    icon?: string
  }