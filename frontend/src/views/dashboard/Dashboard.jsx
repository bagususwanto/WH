import React, { useEffect, useState } from 'react'
import { Card } from 'primereact/card'
import { Galleria } from 'primereact/galleria'
import { PhotoService } from '../../assets/pictureDashboard'
import { CRow } from '@coreui/react'
import '../../assets/galleria.scss' // Pastikan path ini sesuai dengan lokasi file SCSS

const Dashboard = () => {
  const [images, setImages] = useState([])
  const [error, setError] = useState(null)

  const responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 5,
    },
    {
      breakpoint: '991px',
      numVisible: 4,
    },
    {
      breakpoint: '767px',
      numVisible: 3,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
    },
  ]

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await PhotoService.getImages()
        setImages(data)
      } catch (error) {
        console.error('Error fetching images:', error) // Debugging
        setError('Gagal mengambil gambar. Silakan coba lagi nanti.')
      }
    }
    fetchImages()
  }, [])

  const itemTemplate = (item) => {
    return (
      <img
        src={item.imageSrc}
        alt={item.alt}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} // Sesuaikan gambar dengan kontainer
      />
    )
  }

  const thumbnailTemplate = (item) => {
    return (
      <img
        src={item.thumbnailImageSrc}
        alt={item.alt}
        style={{ width: '100%', height: 'auto' }} // Sesuaikan thumbnail dengan kontainer
      />
    )
  }

  return <h5>Dashboard</h5>
}

export default Dashboard
