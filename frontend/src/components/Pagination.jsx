import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  // Hitung rentang halaman yang ditampilkan
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)
  const pages = []

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page)
  }

  return (
    <CPagination aria-label="Page navigation">
      {/* Tombol Previous */}
      <CPaginationItem
        aria-label="Previous"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
      >
        <span aria-hidden="true">&laquo;</span>
      </CPaginationItem>

      {/* Tombol Halaman Awal */}
      {startPage > 1 && (
        <>
          <CPaginationItem onClick={() => handlePageClick(1)}>1</CPaginationItem>
          {startPage > 2 && <CPaginationItem disabled>...</CPaginationItem>}
        </>
      )}

      {/* Nomor Halaman */}
      {pages.map((page) => (
        <CPaginationItem
          key={page}
          active={page === currentPage}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </CPaginationItem>
      ))}

      {/* Tombol Halaman Akhir */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <CPaginationItem disabled>...</CPaginationItem>}
          <CPaginationItem onClick={() => handlePageClick(totalPages)}>
            {totalPages}
          </CPaginationItem>
        </>
      )}

      {/* Tombol Next */}
      <CPaginationItem
        aria-label="Next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
      >
        <span aria-hidden="true">&raquo;</span>
      </CPaginationItem>
    </CPagination>
  )
}

export default Pagination
