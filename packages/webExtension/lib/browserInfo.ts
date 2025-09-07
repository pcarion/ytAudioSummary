/**
 * Get browser and extension information
 */
export interface BrowserInfo {
    extensionName: string;
    extensionVersion: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    userAgent: string;
}

/**
 * Retrieves information about the browser and extension
 * @returns BrowserInfo object containing browser and extension details
 */
export async function getBrowserInfo(): Promise<BrowserInfo> {
    // Get extension info from manifest
    const manifest = browser.runtime.getManifest();

    // Parse user agent
    const userAgent = navigator.userAgent;
    const browserName = getBrowserName(userAgent);
    const browserVersion = getBrowserVersion(userAgent);
    const osName = getOSName(userAgent);

    return {
        extensionName: manifest.name,
        extensionVersion: manifest.version,
        browserName,
        browserVersion,
        osName,
        userAgent
    };
}

/**
 * Extract browser name from user agent string
 */
function getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        return 'Chrome';
    }
    if (userAgent.includes('Firefox')) {
        return 'Firefox';
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return 'Safari';
    }
    if (userAgent.includes('Edg')) {
        return 'Edge';
    }
    return 'Unknown';
}

/**
 * Extract browser version from user agent string
 */
function getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edg)\/(\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : 'Unknown';
}

/**
 * Extract OS name from user agent string
 */
function getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) {
        return 'Windows';
    }
    if (userAgent.includes('Mac')) {
        return 'macOS';
    }
    if (userAgent.includes('Linux')) {
        return 'Linux';
    }
    if (userAgent.includes('Android')) {
        return 'Android';
    }
    if (userAgent.includes('iOS')) {
        return 'iOS';
    }
    return 'Unknown';
}

/**
 * Example usage:
 * const info = await getBrowserInfo();
 * console.log(info);
 * // Output example:
 * // {
 * //   extensionName: "Snipwave",
 * //   extensionVersion: "1.0.0",
 * //   browserName: "Chrome",
 * //   browserVersion: "120.0.6099.130",
 * //   osName: "macOS",
 * //   userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ..."
 * // }
 */
