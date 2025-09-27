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

import { useState, useEffect, useCallback } from 'react'
import brandingAssetsService, {
  type BrandingAsset,
  type BrandingAssetType,
} from 'services/BrandingAssetsService'
import { getAssetBase } from 'services/EnvironmentService'

interface UseBrandingAssetsReturn {
  logoUrl: string
  footerText: string
  loading: boolean
  error: string | null
  refreshAssets: () => Promise<void>
}

/**
 * Custom hook for managing branding assets with fallback support
 */
export const useBrandingAssets = (): UseBrandingAssetsReturn => {
  const [logoUrl, setLogoUrl] = useState<string>(
    `${getAssetBase()}/images/logos/cx-text.svg`
  )
  const [footerText, setFooterText] = useState<string>(
    '© 2024 Eclipse Tractus-X. All rights reserved.'
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refreshAssets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both logo and footer assets
      const [logoAsset, footerAsset] = await Promise.allSettled([
        brandingAssetsService.getAssetByType('logo'),
        brandingAssetsService.getAssetByType('footer'),
      ])

      // Handle logo asset
      if (logoAsset.status === 'fulfilled' && logoAsset.value?.url) {
        setLogoUrl(logoAsset.value.url)
      } else {
        // Use fallback logo
        setLogoUrl(`${getAssetBase()}/images/logos/cx-text.svg`)
        if (logoAsset.status === 'rejected') {
          console.warn(
            'Failed to load custom logo, using fallback:',
            logoAsset.reason
          )
        }
      }

      // Handle footer asset
      if (footerAsset.status === 'fulfilled' && footerAsset.value?.text) {
        console.log('Main hook - Footer text loaded:', footerAsset.value.text)
        setFooterText(footerAsset.value.text)
      } else {
        // Use fallback footer text
        console.log('Main hook - Using fallback footer text')
        setFooterText('© 2024 Eclipse Tractus-X. All rights reserved.')
        if (footerAsset.status === 'rejected') {
          console.warn(
            'Failed to load custom footer text, using fallback:',
            footerAsset.reason
          )
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load branding assets'
      setError(errorMessage)
      console.error('Error loading branding assets:', err)

      // Ensure fallbacks are set on error
      setLogoUrl(`${getAssetBase()}/images/logos/cx-text.svg`)
      setFooterText('© 2024 Eclipse Tractus-X. All rights reserved.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load assets on mount
  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  return {
    logoUrl,
    footerText,
    loading,
    error,
    refreshAssets,
  }
}

interface UseSpecificAssetReturn {
  asset: BrandingAsset | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Custom hook for managing a specific branding asset type
 */
export const useSpecificAsset = (
  assetType: BrandingAssetType
): UseSpecificAssetReturn => {
  const [asset, setAsset] = useState<BrandingAsset | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fetchedAsset = await brandingAssetsService.getAssetByType(assetType)
      setAsset(fetchedAsset)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to load ${assetType} asset`
      setError(errorMessage)
      console.error(`Error loading ${assetType} asset:`, err)
    } finally {
      setLoading(false)
    }
  }, [assetType])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    asset,
    loading,
    error,
    refresh,
  }
}

/**
 * Hook for logo URL with fallback
 */
export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>(
    `${getAssetBase()}/images/logos/cx-text.svg`
  )
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadLogo = async () => {
      setLoading(true)
      try {
        const url = await brandingAssetsService.getLogoUrl()
        setLogoUrl(url)
      } catch (error) {
        console.warn('Failed to load logo, using fallback')
        setLogoUrl(`${getAssetBase()}/images/logos/cx-text.svg`)
      } finally {
        setLoading(false)
      }
    }

    loadLogo()
  }, [])

  return { logoUrl, loading }
}

/**
 * Hook for footer text with fallback
 */
export const useFooter = () => {
  const [footerText, setFooterText] = useState<string>(
    '© 2024 Eclipse Tractus-X. All rights reserved.'
  )
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadFooter = async () => {
      setLoading(true)
      try {
        const text = await brandingAssetsService.getFooterText()
        console.log('Footer text loaded from API:', text)
        if (text) {
          setFooterText(text)
        } else {
          console.warn('API returned empty footer text, using fallback')
          setFooterText('© 2024 Eclipse Tractus-X. All rights reserved.')
        }
      } catch (error) {
        console.warn('Failed to load footer text, using fallback:', error)
        setFooterText('© 2024 Eclipse Tractus-X. All rights reserved.')
      } finally {
        setLoading(false)
      }
    }

    loadFooter()
  }, [])

  return { footerText, loading }
}
