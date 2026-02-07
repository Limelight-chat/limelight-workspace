'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface GooglePickerProps {
  onFilesPicked: (files: Array<{ file_id: string; mime_type: string; name: string }>) => void
  onCancel?: () => void
}

export function GooglePicker({ onFilesPicked, onCancel }: GooglePickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  useEffect(() => {
    // Load Google Picker API scripts
    const loadScripts = async () => {
      try {
        // Load gapi script
        if (!window.gapi) {
          const gapiScript = document.createElement('script')
          gapiScript.src = 'https://apis.google.com/js/api.js'
          gapiScript.async = true
          gapiScript.defer = true

          await new Promise((resolve, reject) => {
            gapiScript.onload = resolve
            gapiScript.onerror = reject
            document.body.appendChild(gapiScript)
          })
        }

        // Load GSI client script
        if (!window.google?.accounts) {
          const gsiScript = document.createElement('script')
          gsiScript.src = 'https://accounts.google.com/gsi/client'
          gsiScript.async = true
          gsiScript.defer = true

          await new Promise((resolve, reject) => {
            gsiScript.onload = resolve
            gsiScript.onerror = reject
            document.body.appendChild(gsiScript)
          })
        }

        // Load Picker API library
        if (!window.google?.picker) {
          await new Promise((resolve, reject) => {
            window.gapi.load('picker', {
              callback: resolve,
              onerror: reject,
            })
          })
        }

        setScriptsLoaded(true)
      } catch (err) {
        console.error('Failed to load Google scripts:', err)
        setError('Failed to load Google Picker')
      }
    }

    loadScripts()
  }, [])

  const openPicker = async () => {
    if (!scriptsLoaded) {
      setError('Google Picker is still loading...')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get picker configuration and access token from backend
      const config = await api.getGooglePickerConfig()

      if (!config.client_id) {
        throw new Error('Google Picker not configured')
      }

      if (!config.access_token) {
        throw new Error('Not authenticated with Google. Please reconnect.')
      }

      // Use the existing access token to create picker
      createPicker(config.access_token, config)
    } catch (err: any) {
      console.error('Failed to open picker:', err)
      setError(err.message || 'Failed to open Google Picker')
      setIsLoading(false)
    }
  }

  const createPicker = (accessToken: string, config: any) => {
    const picker = new window.google!.picker.PickerBuilder()
      .setAppId(config.app_id || config.client_id.split('.')[0])
      .setOAuthToken(accessToken)
      .addView(
        new window.google!.picker.DocsView(window.google!.picker.ViewId.SPREADSHEETS)
          .setIncludeFolders(false)
          .setOwnedByMe(true)
      )
      .addView(
        new window.google!.picker.DocsView(window.google!.picker.ViewId.DOCUMENTS)
          .setIncludeFolders(false)
          .setOwnedByMe(true)
      )
      .enableFeature(window.google!.picker.Feature.MULTISELECT_ENABLED)
      .setCallback((data: google.picker.ResponseObject) => {
        handlePickerCallback(data)
      })

    if (config.api_key) {
      picker.setDeveloperKey(config.api_key)
    }

    picker.build().setVisible(true)
    setIsLoading(false)
  }

  const handlePickerCallback = (data: google.picker.ResponseObject) => {
    if (data.action === window.google!.picker.Action.PICKED) {
      const files = data.docs?.map(doc => ({
        file_id: doc.id,
        mime_type: doc.mimeType,
        name: doc.name,
      })) || []

      onFilesPicked(files)
    } else if (data.action === window.google!.picker.Action.CANCEL) {
      onCancel?.()
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={openPicker}
        disabled={isLoading || !scriptsLoaded}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Opening...' : !scriptsLoaded ? 'Loading...' : 'Choose Files'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
