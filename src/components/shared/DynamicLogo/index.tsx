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

import React from 'react'
import { Image } from '@catena-x/portal-shared-components'
import { useLogo } from 'hooks/useBrandingAssets'
import { getAssetBase } from 'services/EnvironmentService'

interface DynamicLogoProps {
  alt?: string
  className?: string
  style?: React.CSSProperties
  fallbackSrc?: string
  width?: number | string
  height?: number | string
  onClick?: () => void
}

/**
 * Reusable component that renders a dynamic logo with fallback support
 */
export const DynamicLogo: React.FC<DynamicLogoProps> = ({
  alt = 'Company Logo',
  className,
  style,
  fallbackSrc,
  width,
  height,
  onClick,
}) => {
  const { logoUrl } = useLogo()

  const defaultFallback =
    typeof fallbackSrc === 'string' && fallbackSrc.trim() !== ''
      ? fallbackSrc
      : `${getAssetBase()}/images/logos/cx-text.svg`

  const logoStyle = {
    ...style,
    ...(width && { width }),
    ...(height && { height }),
  }

  return (
    <div className={className} onClick={onClick} style={logoStyle}>
      <Image
        src={
          typeof logoUrl === 'string' && logoUrl.trim() !== ''
            ? logoUrl
            : defaultFallback
        }
        alt={alt}
      />
    </div>
  )
}

/**
 * Simple img element version with error handling for cases where Image component can't be used
 */
export const DynamicLogoImg: React.FC<DynamicLogoProps> = ({
  alt = 'Company Logo',
  className,
  style,
  fallbackSrc,
  width,
  height,
  onClick,
}) => {
  const { logoUrl } = useLogo()

  const defaultFallback =
    typeof fallbackSrc === 'string' && fallbackSrc.trim() !== ''
      ? fallbackSrc
      : `${getAssetBase()}/images/logos/cx-text.svg`

  const logoStyle = {
    ...style,
    ...(width && { width }),
    ...(height && { height }),
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = defaultFallback
  }

  return (
    <img
      src={
        typeof logoUrl === 'string' && logoUrl.trim() !== ''
          ? logoUrl
          : defaultFallback
      }
      alt={alt}
      className={className}
      style={logoStyle}
      onClick={onClick}
      onError={handleError}
    />
  )
}

export default DynamicLogo
