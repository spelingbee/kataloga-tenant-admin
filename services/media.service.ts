import { useNuxtApp } from '#app'
import type { UploadResponseDto } from '~/types/upload'

export class MediaService {
    private static instance: MediaService
    
    constructor() {}

    static getInstance(): MediaService {
        if (!MediaService.instance) {
            MediaService.instance = new MediaService()
        }
        return MediaService.instance
    }

    /**
     * Upload an image to the backend
     * @param file The file to upload
     * @param folder The target folder (e.g. 'menu-items')
     * @returns The relative path to the image
     */
    async uploadImage(file: File, folder: string = 'menu-items'): Promise<string> {
        const { $api } = useNuxtApp()
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        try {
            const response = await ($api as any).post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                showProgress: true
            })

            // Extract only the path from the URL returned by the backend
            // Example: 'http://localhost:3000/uploads/menu-items/abc.png' -> '/uploads/menu-items/abc.png'
            let imageUrl = response.url
            if (imageUrl && imageUrl.startsWith('http')) {
                try {
                    const urlObj = new URL(imageUrl)
                    imageUrl = urlObj.pathname
                } catch (e) {
                    console.warn('[MediaService] Failed to parse URL, using fallback:', imageUrl)
                }
            }

            return imageUrl
        } catch (error: any) {
            console.error('[MediaService] Upload failed:', error)
            throw error
        }
    }

    /**
     * Resolve a raw image path/URL to a full URL for display
     * @param url Raw path or absolute URL
     */
    resolveImageUrl(url: string | undefined): string | undefined {
        if (!url) return undefined
        if (url.startsWith('http') || url.startsWith('data:')) return url
        
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBaseUrl as string
        
        try {
            const origin = new URL(apiBase).origin
            // Ensure path starts with /
            const path = url.startsWith('/') ? url : `/${url}`
            return `${origin}${path}`
        } catch (e) {
            return url
        }
    }
}

export const useMediaService = () => MediaService.getInstance()
