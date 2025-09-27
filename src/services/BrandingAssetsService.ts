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

import { getApiBase } from './EnvironmentService'
import UserService from './UserService'

// Types for Branding Assets
export type BrandingAssetType = 'logo' | 'footer'

export interface BrandingAsset {
  assetType: BrandingAssetType
  contentType?: string
  fileName?: string
  text?: string
  url?: string
}

export interface BrandingAssetsResponse {
  assets: BrandingAsset[]
}

export interface UploadAssetRequest {
  assetType: BrandingAssetType
  file?: File
  text?: string
}

export interface UpdateAssetRequest {
  assetType: BrandingAssetType
  file?: File
  text?: string
}

// API Service Class
class BrandingAssetsService {
  private readonly baseUrl = `${getApiBase()}/api/administration/branding/assets`

  /**
   * Get all branding assets (public endpoint - no authentication required)
   */
  async getAllAssets(): Promise<BrandingAssetsResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch branding assets: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching branding assets:', error)
      throw error
    }
  }

  /**
   * Get branding asset by type (public endpoint - no authentication required)
   */
  async getAssetByType(
    assetType: BrandingAssetType
  ): Promise<BrandingAsset | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${assetType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 404) {
        return null // Asset not found
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${assetType} asset: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${assetType} asset:`, error)
      throw error
    }
  }

  /**
   * Upload a new branding asset (requires authentication and proper permissions)
   */
  async uploadAsset(request: UploadAssetRequest): Promise<BrandingAsset> {
    try {
      const formData = new FormData()
      formData.append('AssetType', request.assetType)

      if (request.file) {
        formData.append('File', request.file)
      }

      if (request.text) {
        formData.append('Text', request.text)
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${UserService.getToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to upload asset: ${response.statusText} - ${errorText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading branding asset:', error)
      throw error
    }
  }

  /**
   * Update an existing branding asset (requires authentication and proper permissions)
   */
  async updateAsset(request: UpdateAssetRequest): Promise<BrandingAsset> {
    try {
      const formData = new FormData()
      formData.append('AssetType', request.assetType)

      if (request.file) {
        formData.append('File', request.file)
      }

      if (request.text) {
        formData.append('Text', request.text)
      }

      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${UserService.getToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to update asset: ${response.statusText} - ${errorText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating branding asset:', error)
      throw error
    }
  }

  /**
   * Delete a branding asset by type (requires authentication and proper permissions)
   */
  async deleteAsset(assetType: BrandingAssetType): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${assetType}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${UserService.getToken()}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to delete asset: ${response.statusText} - ${errorText}`
        )
      }
    } catch (error) {
      console.error(`Error deleting ${assetType} asset:`, error)
      throw error
    }
  }

  /**
   * Helper method to get logo URL with fallback
   */
  async getLogoUrl(): Promise<string> {
    try {
      const logoAsset = await this.getAssetByType('logo')
      const url = logoAsset?.url
      return typeof url === 'string' && url.trim() !== ''
        ? url
        : '/assets/logo/cx-logo.svg' // fallback to static asset
    } catch (error) {
      console.warn('Failed to fetch logo asset, using fallback:', error)
      return '/assets/logo/cx-logo.svg' // fallback to static asset
    }
  }

  /**
   * Helper method to get footer text with fallback
   */
  async getFooterText(): Promise<string> {
    try {
      const footerAsset = await this.getAssetByType('footer')
      const text = footerAsset?.text
      return typeof text === 'string' && text.trim() !== ''
        ? text
        : '© 2024 Eclipse Tractus-X. All rights reserved.' // fallback text
    } catch (error) {
      console.warn('Failed to fetch footer asset, using fallback:', error)
      return '© 2024 Eclipse Tractus-X. All rights reserved.' // fallback text
    }
  }

  /**
   * Check if user has permission to manage branding assets
   */
  hasManagementPermission(): boolean {
    try {
      // This would depend on how the frontend handles role checking
      // For now, we'll check if the user has a token (is authenticated)
      const token = UserService.getToken()
      return !!token

      // In a real implementation, you might want to check specific roles:
      // return UserService.hasRole('manage_branding_assets') || UserService.hasRole('CX Admin')
    } catch (error) {
      console.error('Error checking branding assets permission:', error)
      return false
    }
  }
}

// Export singleton instance
const brandingAssetsService = new BrandingAssetsService()
export default brandingAssetsService
