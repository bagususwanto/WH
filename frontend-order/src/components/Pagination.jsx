import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
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

      {/* Nomor Halaman */}
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1
        return (
          <CPaginationItem
            key={page}
            active={page === currentPage}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </CPaginationItem>
        )
      })}

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
