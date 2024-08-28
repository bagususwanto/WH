// src/assets/pictureDashboard.js
export const PhotoService = {
    getImages: async () => {
        return [
            {
                imageSrc: '/images/1.jpg',
                thumbnailImageSrc: '/images/1.jpg',
                alt: 'Gambar 1'
            },
            {
                imageSrc: '/images/2.jpg',
                thumbnailImageSrc: '/images/1.jpg',
                alt: 'Gambar 2'
            },
            {
                imageSrc: '/images/3.jpg',
                thumbnailImageSrc: '/images/3.jpg',
                alt: 'Gambar 3'
            }
        ];
    }
};
