import React, { useEffect, useState } from 'react'


import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
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
                Selamat datang di TWIIS (Toyota Warehouse Inventory integrated System). Silakan pesan barang dan item di gudang.
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
export default Dashboard

