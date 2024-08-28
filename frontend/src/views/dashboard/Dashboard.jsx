import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Galleria } from 'primereact/galleria';
import { PhotoService } from '../../assets/pictureDashboard';
import { CRow } from '@coreui/react';
import '../../assets/galleria.scss'; // Pastikan path ini sesuai dengan lokasi file SCSS

const Dashboard = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    const responsiveOptions = [
        {
            breakpoint: '1199px',
            numVisible: 5
        },
        {
            breakpoint: '991px',
            numVisible: 4
        },
        {
            breakpoint: '767px',
            numVisible: 3
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await PhotoService.getImages();
                console.log('Fetched images:', data); // Debugging
                setImages(data);
            } catch (error) {
                console.error('Error fetching images:', error); // Debugging
                setError("Gagal mengambil gambar. Silakan coba lagi nanti.");
            }
        };
        fetchImages();
    }, []);

    const itemTemplate = (item) => {
        return (
            <img
                src={item.imageSrc} // Pastikan ini adalah sumber gambar yang benar
                alt={item.alt}
                style={{ width: '100%' }}
            />
        );
    };

    const thumbnailTemplate = (item) => {
        return (
            <img
                src={item.thumbnailImageSrc}
                alt={item.alt}
                style={{ width: '20%' }}
            />
        );
    };

    return (
        <Card title="Halo!!">
            <p className="m-0">
                Selamat datang di TWIIS (Toyota Warehouse Inventory Integrated System). Silakan pesan barang dan item di gudang.
            </p>
            <CRow className="mb-2"></CRow>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="galleria-container">
                    <div className="galleria-wrapper">
                        <Galleria
                            value={images}
                            responsiveOptions={responsiveOptions}
                            numVisible={5}
                            style={{ width: '100%' }}
                            item={itemTemplate}
                            
                            showItemNavigators={true}
                            showThumbnails={true}
                            circular={true}
                            autoPlayInterval={2800}
                            autoPlay={true}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default Dashboard;
