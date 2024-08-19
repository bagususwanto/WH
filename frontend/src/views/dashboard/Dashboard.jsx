import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
// import { Galleria } from 'primereact/galleria';
// import { PhotoService } from './assets/PictureDashboard';

const Dashboard = () => {
    // const [images, setImages] = useState([]);
    // const [error, setError] = useState(null);
    // const responsiveOptions = [
    //     {
    //         breakpoint: '991px',
    //         numVisible: 4
    //     },
    //     {
    //         breakpoint: '767px',
    //         numVisible: 3
    //     },
    //     {
    //         breakpoint: '575px',
    //         numVisible: 1
    //     }
    // ];

    // useEffect(() => {
    //     const fetchImages = async () => {
    //         try {
    //             const data = await PhotoService.getImages();
    //             setImages(data);
    //         } catch (error) {
    //             setError("Gagal mengambil gambar. Silakan coba lagi nanti.");
    //         }
    //     };
    //     fetchImages();
    // }, []);

    // const itemTemplate = (item) => {
    //     return <img src='https://primefaces.org/cdn/primereact/images/galleria/galleria1.jpg' alt={item.alt} style={{ width: '100%' }} />;
    // };

    // const thumbnailTemplate = (item) => {
    //     return <img src={item.thumbnailImageSrc} alt={item.alt} />;
    // };

    return (
        <Card title="Halo!!">
            <p className="m-0">
                Selamat datang di Winner (Warehouse Inventory Order). Silakan pesan barang dan item di gudang.
            </p>
         {/* <CRow className='mb-3'></CRow>
            <div className="card">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <Galleria
                        value={images}
                        responsiveOptions={responsiveOptions}
                        numVisible={5}
                        style={{ maxWidth: '640px' }}
                        item={itemTemplate}
                        thumbnail={thumbnailTemplate}
                    />
                )}
            </div>  */}
        </Card>
    );
};

export default Dashboard;
