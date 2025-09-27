/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Button,
  Input,
  PageHeader,
  Typography,
} from '@catena-x/portal-shared-components'
import { useBrandingAssets, useLogo, useFooter } from 'hooks/useBrandingAssets'
import brandingAssetsService, {
  type BrandingAssetType,
} from 'services/BrandingAssetsService'

export default function BrandingAssetsManagement() {
  const { logoUrl } = useLogo()
  const { footerText } = useFooter()
  const { refreshAssets } = useBrandingAssets()

  // State management
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<BrandingAssetType | null>(null)
  const [editingFooter, setEditingFooter] = useState(false)
  const [footerTextEdit, setFooterTextEdit] = useState('')
  const [message, setMessage] = useState<string>('')

  // File input refs
  const logoFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFooterTextEdit(footerText)
  }, [footerText])

  // Logo upload handler
  const handleLogoUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        await brandingAssetsService.uploadAsset({
          assetType: 'logo',
          file,
        })
        await refreshAssets()
        setMessage('Logo uploaded successfully!')
      } catch (error) {
        console.error('Error uploading logo:', error)
        setMessage('Failed to upload logo. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [refreshAssets]
  )

  // Footer text update handler
  const handleFooterUpdate = useCallback(async () => {
    setIsUpdating(true)
    try {
      await brandingAssetsService.updateAsset({
        assetType: 'footer',
        text: footerTextEdit,
      })
      await refreshAssets()
      setEditingFooter(false)
      setMessage('Footer text updated successfully!')
    } catch (error) {
      console.error('Error updating footer text:', error)
      setMessage('Failed to update footer text. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }, [footerTextEdit, refreshAssets])

  // Delete asset handler
  const handleDeleteAsset = useCallback(
    async (assetType: BrandingAssetType) => {
      setIsDeleting(assetType)
      try {
        await brandingAssetsService.deleteAsset(assetType)
        await refreshAssets()
        setMessage(`${assetType} deleted successfully!`)
      } catch (error) {
        console.error(`Error deleting ${assetType}:`, error)
        setMessage(`Failed to delete ${assetType}. Please try again.`)
      } finally {
        setIsDeleting(null)
      }
    },
    [refreshAssets]
  )

  // File input handlers
  const handleLogoFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setMessage('Please select a valid image file.')
          return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          setMessage('File size must be less than 2MB.')
          return
        }

        handleLogoUpload(file)
      }
    },
    [handleLogoUpload]
  )

  return (
    <main className="branding-assets-management">
      <PageHeader title="Branding Assets Management" topPage />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {message && (
          <div
            style={{
              padding: '16px',
              marginBottom: '24px',
              backgroundColor: message.includes('Failed')
                ? '#ffebee'
                : '#e8f5e8',
              border: `1px solid ${message.includes('Failed') ? '#f44336' : '#4caf50'}`,
              borderRadius: '4px',
            }}
          >
            <Typography variant="body2">{message}</Typography>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Logo Management Section */}
          <div
            style={{
              flex: '1',
              minWidth: '300px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <Typography variant="h4" style={{ marginBottom: '16px' }}>
              Logo Management
            </Typography>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <Typography variant="h6" style={{ marginBottom: '16px' }}>
                Current Logo
              </Typography>
              <img
                src={logoUrl}
                alt="Current Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80px',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <input
                type="file"
                ref={logoFileInputRef}
                onChange={handleLogoFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <Button
                variant="contained"
                disabled={isUploading}
                onClick={() => logoFileInputRef.current?.click()}
              >
                {isUploading ? 'Uploading...' : 'Upload New Logo'}
              </Button>

              <Button
                variant="outlined"
                color="error"
                disabled={isDeleting === 'logo'}
                onClick={() => handleDeleteAsset('logo')}
              >
                {isDeleting === 'logo' ? 'Deleting...' : 'Delete Logo'}
              </Button>
            </div>

            <Typography
              variant="caption1"
              style={{ marginTop: '16px', display: 'block' }}
            >
              Supported formats: PNG, JPG, SVG. Max size: 2MB
            </Typography>
          </div>

          {/* Footer Management Section */}
          <div
            style={{
              flex: '1',
              minWidth: '300px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <Typography variant="h4" style={{ marginBottom: '16px' }}>
              Footer Text Management
            </Typography>

            <div style={{ marginBottom: '24px' }}>
              <Typography variant="h6" style={{ marginBottom: '16px' }}>
                Current Footer Text
              </Typography>
              <div
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  minHeight: '60px',
                }}
              >
                {editingFooter ? (
                  <Input
                    value={footerTextEdit}
                    onChange={(e) => { setFooterTextEdit(e.target.value) }}
                    placeholder="Enter footer text..."
                    multiline
                    style={{ width: '100%' }}
                  />
                ) : (
                  <Typography variant="body2">{footerText}</Typography>
                )}
              </div>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {editingFooter ? (
                <>
                  <Button
                    variant="contained"
                    disabled={isUpdating}
                    onClick={handleFooterUpdate}
                  >
                    {isUpdating ? 'Saving...' : 'Save Footer Text'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingFooter(false)
                      setFooterTextEdit(footerText)
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => { setEditingFooter(true) }}
                  >
                    Edit Footer Text
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isDeleting === 'footer'}
                    onClick={() => handleDeleteAsset('footer')}
                  >
                    {isDeleting === 'footer'
                      ? 'Deleting...'
                      : 'Delete Footer Text'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div
          style={{
            marginTop: '24px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <Typography variant="h4" style={{ marginBottom: '16px' }}>
            Actions
          </Typography>
          <Button variant="outlined" onClick={() => refreshAssets()}>
            Refresh Assets
          </Button>
        </div>
      </div>
    </main>
  )
}
