import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow, CFormTextarea } from '@coreui/react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import 'primeicons/primeicons.css'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/nano/theme.css'
import 'primereact/resources/primereact.min.css'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CButton,
} from '@coreui/react'

const MySwal = withReactContent(Swal)

const InputInventory = () => {
  return (
    <CRow>
      <CCol>
        <CCard className="mb-3">
          <CCardHeader>Filter</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear Filter"
                  outlined
                  onClick={clearFilter}
                  className="mb-2"
                  style={{ borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['Address_Rack.Storage.Plant.plantName'].value}
                  options={plant}
                  onChange={handlePlantChange}
                  placeholder="Select Plant"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
              <CCol xs={12} sm={6} md={4}>
                <Dropdown
                  value={filters['Address_Rack.Storage.storageName'].value}
                  options={storage}
                  onChange={handleStorageChange}
                  placeholder="Select Storage"
                  className="p-column-filter mb-2"
                  showClear
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>InputInventory Table</CCardHeader>
          <CCardBody>
            <CRow className="mb-2">
              <CCol xs={12} sm={12} md={8} lg={8} xl={8}>
                <div className="d-flex flex-wrap justify-content-start">
                  <Button
                    type="button"
                    label="Excel"
                    icon="pi pi-file-excel"
                    severity="success"
                    className="rounded-5 me-2 mb-2"
                    onClick={exportExcel}
                    data-pr-tooltip="XLS"
                  />
                  <Button
                    type="button"
                    label="Execute"
                    icon="pi pi-play"
                    severity="warning"
                    className="rounded-5 mb-2"
                    onClick={handleExecute}
                  />
                </div>
              </CCol>
              <CCol xs={12} sm={12} md={4} lg={4} xl={4}>
                <div className="d-flex flex-wrap justify-content-end">{renderHeader()}</div>
              </CCol>
            </CRow>
            <DataTable
              value={visibleData}
              tableStyle={{ minWidth: '50rem' }}
              className="p-datatable-gridlines p-datatable-sm custom-datatable text-nowrap"
              paginator
              rowsPerPageOptions={[10, 50, 100, 500]}
              rows={10}
              dataKey="id"
              filters={filters}
              loading={loading}
              emptyMessage="No inventory found."
              size="small"
              scrollable
              removableSort
              header={header}
            >
              <Column
                field="Material.materialNo"
                header="Material"
                frozen={true}
                alignFrozen="left"
                sortable
              ></Column>
              <Column
                field="Material.description"
                header="Description"
                frozen={true}
                alignFrozen="left"
                sortable
              ></Column>
              <Column field="Address_Rack.addressRackName" header="Address" sortable></Column>
              <Column field="Material.uom" header="UoM" sortable></Column>
              <Column field="Material.minStock" header="Min" sortable></Column>
              <Column field="Material.maxStock" header="Max" sortable></Column>
              <Column field="quantityActualCheck" header="SoH" sortable></Column>
              <Column
                field="evaluation"
                header="Eval."
                body={statusBodyTemplate} // Menggunakan fungsi evaluasi
                bodyStyle={{ textAlign: 'center' }}
                sortable
              ></Column>
              <Column field="remarks" header="Remarks" sortable></Column>
              {visibleColumns.map((col, index) => (
                <Column
                  key={index}
                  field={col.field}
                  header={col.header}
                  body={col.body}
                  sortable={col.sortable}
                  headerStyle={col.headerStyle}
                  bodyStyle={col.bodyStyle}
                />
              ))}
              <Column
                header="Action"
                body={actionBodyTemplate}
                headerStyle={{ width: '5%' }}
                bodyStyle={{ textAlign: 'center' }}
                frozen={true}
                alignFrozen="right"
              ></Column>
            </DataTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modalInputInventory} onClose={() => setModalInputInventory(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">InputInventory Input</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={editData?.Material?.materialNo || ''}
            label="Material No."
            disabled
            className="mb-3"
          />
          <CFormInput
            type="text"
            value={editData?.Material?.description || ''}
            label="Description"
            disabled
            className="mb-3"
          />

          <CRow>
            <CCol md={12}>
              <CFormInput
                type="text"
                value={editData?.Address_Rack?.addressRackName || ''}
                label="Address"
                disabled
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6}>
              <CFormInput
                type="number"
                value={editData?.quantityActual || ''}
                onChange={(e) => setEditData({ ...editData, quantityActual: e.target.value })}
                label="Quantity"
                className="mb-3"
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="text"
                value={editData?.Material?.uom || ''}
                label="UoM"
                disabled
                className="mb-3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CCol md={12}>
                <CFormTextarea
                  type="text"
                  value={editData?.remarks || ''}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                  label="Remarks"
                  className="mb-3"
                />
              </CCol>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <CButton color="primary" onClick={handleSave}>
              {loadingSave ? (
                <>
                  <CSpinner component="span" size="sm" variant="grow" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </CButton>
          </Suspense>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default InputInventory
