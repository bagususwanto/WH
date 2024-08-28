// src/assets/pictureDashboard.js
export const PhotoService = {
    getImages: async () => {
        return [
            {
                imageSrc: '/images/E-INVENTORY.jpg',
                thumbnailImageSrc: '/images/E-INVENTORY.jpg',
                alt: 'Gambar 1'
            },
            {
                imageSrc: '/images/Order.jpg',
                thumbnailImageSrc: '/images/Order.jpg',
                alt: 'Gambar 2'
            },
            {
                imageSrc: '/images/Warehouse.jpg',
                thumbnailImageSrc: '/images/Warehouse.jpg',
                alt: 'Gambar 3'
            }
        ];
    }
};
