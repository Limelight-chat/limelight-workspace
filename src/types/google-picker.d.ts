/**
 * TypeScript declarations for Google Picker API
 * https://developers.google.com/picker/docs
 */

declare namespace google {
  namespace picker {
    enum ViewId {
      DOCS = 'all',
      DOCS_IMAGES = 'docs-images',
      DOCS_IMAGES_AND_VIDEOS = 'docs-images-and-videos',
      DOCS_VIDEOS = 'docs-videos',
      DOCUMENTS = 'documents',
      DRAWINGS = 'drawings',
      FOLDERS = 'folders',
      FORMS = 'forms',
      IMAGE_SEARCH = 'image-search',
      MAPS = 'maps',
      PDFS = 'pdfs',
      PHOTOS = 'photos',
      PHOTO_ALBUMS = 'photo-albums',
      PHOTO_UPLOAD = 'photo-upload',
      PRESENTATIONS = 'presentations',
      RECENTLY_PICKED = 'recently-picked',
      SPREADSHEETS = 'spreadsheets',
      VIDEO_SEARCH = 'video-search',
      WEBCAM = 'webcam',
      YOUTUBE = 'youtube',
    }

    enum Feature {
      MINE_ONLY = 'MINE_ONLY',
      MULTISELECT_ENABLED = 'MULTISELECT_ENABLED',
      NAV_HIDDEN = 'NAV_HIDDEN',
      SIMPLE_UPLOAD_ENABLED = 'SIMPLE_UPLOAD_ENABLED',
      SUPPORT_DRIVES = 'SUPPORT_DRIVES',
    }

    enum Action {
      CANCEL = 'cancel',
      PICKED = 'picked',
    }

    interface PickerCallback {
      (data: ResponseObject): void
    }

    interface ResponseObject {
      action: string
      docs?: DocumentObject[]
      viewToken?: string[]
    }

    interface DocumentObject {
      id: string
      name: string
      description?: string
      type?: string
      mimeType: string
      lastEditedUtc?: number
      iconUrl?: string
      url?: string
      embedUrl?: string
      sizeBytes?: number
      parentId?: string
      isShared?: boolean
      uploadState?: string
      serviceId?: string
    }

    class PickerBuilder {
      addView(view: ViewId | View): PickerBuilder
      addViewGroup(viewGroup: ViewGroup): PickerBuilder
      disableFeature(feature: Feature): PickerBuilder
      enableFeature(feature: Feature): PickerBuilder
      getRelayUrl(): string
      getTitle(): string
      isFeatureEnabled(feature: Feature): boolean
      setAppId(appId: string): PickerBuilder
      setCallback(callback: PickerCallback): PickerBuilder
      setDeveloperKey(key: string): PickerBuilder
      setDocument(document: string): PickerBuilder
      setLocale(locale: string): PickerBuilder
      setMaxItems(max: number): PickerBuilder
      setOAuthToken(token: string): PickerBuilder
      setOrigin(origin: string): PickerBuilder
      setRelayUrl(url: string): PickerBuilder
      setSelectableMimeTypes(types: string): PickerBuilder
      setSize(width: number, height: number): PickerBuilder
      setTitle(title: string): PickerBuilder
      toUri(): string
      build(): Picker
    }

    interface Picker {
      isVisible(): boolean
      setVisible(visible: boolean): Picker
      setCallback(callback: PickerCallback): Picker
      setRelayUrl(url: string): Picker
      dispose(): void
    }

    class DocsView {
      constructor(viewId?: ViewId)
      setIncludeFolders(include: boolean): DocsView
      setMimeTypes(mimeTypes: string): DocsView
      setMode(mode: 'LIST' | 'GRID'): DocsView
      setOwnedByMe(ownedByMe: boolean): DocsView
      setParent(parent: string): DocsView
      setQuery(query: string): DocsView
      setSelectFolderEnabled(enabled: boolean): DocsView
      setStarred(starred: boolean): DocsView
    }

    class DocsViewBuilder {
      build(): DocsView
      setIncludeFolders(include: boolean): DocsViewBuilder
      setMimeTypes(mimeTypes: string): DocsViewBuilder
      setMode(mode: 'LIST' | 'GRID'): DocsViewBuilder
      setOwnedByMe(ownedByMe: boolean): DocsViewBuilder
      setParent(parent: string): DocsViewBuilder
      setQuery(query: string): DocsViewBuilder
      setSelectFolderEnabled(enabled: boolean): DocsViewBuilder
      setStarred(starred: boolean): DocsViewBuilder
    }

    type View = DocsView

    interface ViewGroup {
      addView(view: ViewId | View): ViewGroup
      addLabel(label: string): ViewGroup
      addViewGroup(viewGroup: ViewGroup): ViewGroup
    }
  }

  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string
        expires_in: number
        scope: string
        token_type: string
      }

      interface TokenClient {
        requestAccessToken(overrideConfig?: OverridableTokenClientConfig): void
        callback?: (response: TokenResponse) => void
      }

      interface OverridableTokenClientConfig {
        hint?: string
        scope?: string
      }

      function initTokenClient(config: {
        client_id: string
        scope: string
        callback: (response: TokenResponse) => void
      }): TokenClient
    }
  }
}

interface Window {
  gapi?: {
    load: (api: string, callback: () => void) => void
  }
  google?: typeof google
}
