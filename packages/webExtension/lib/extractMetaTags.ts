export interface MetaTag {
    name?: string;
    content: string;
}

/**
 * Extracts all meta tags from document.head
 * @returns Array of meta tag information
 */
export function extractMetaTags(head: HTMLHeadElement): MetaTag[] {
    const metaTags = head.getElementsByTagName('meta');
    const result: MetaTag[] = [];

    Array.from(metaTags).forEach(meta => {
        const tag: MetaTag = {
            content: meta.getAttribute('content') || ''
        };

        // Handle different types of meta tags
        if (meta.hasAttribute('name')) {
            tag.name = meta.getAttribute('name') || undefined;
        }
        if (meta.hasAttribute('property')) {
            tag.name = meta.getAttribute('property') || undefined;
        }

        // Only add if we have a content
        if (tag.content) {
            result.push(tag);
        }
    });

    return result;
}

/**
 * Example usage:
 * const metaTags = extractMetaTags();
 * console.log(metaTags);
 * // Output example:
 * // [
 * //   { name: 'description', content: 'Page description' },
 * //   { property: 'og:title', content: 'Page title' },
 * //   { httpEquiv: 'Content-Type', content: 'text/html; charset=utf-8' },
 * //   { charset: 'utf-8' }
 * // ]
 */ 