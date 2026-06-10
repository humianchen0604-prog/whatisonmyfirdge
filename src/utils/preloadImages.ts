/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const imageCache = new Map<string, Promise<void>>();

export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();

  const cached = imageCache.get(url);
  if (cached) return cached;

  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });

  imageCache.set(url, promise);
  return promise;
}

export function preloadImages(urls: string[]): Promise<void[]> {
  const unique = [...new Set(urls.filter(Boolean))];
  return Promise.all(unique.map(preloadImage));
}

export function isImagePreloaded(url: string): boolean {
  return imageCache.has(url);
}
