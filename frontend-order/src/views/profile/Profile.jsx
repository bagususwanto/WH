import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardImage,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CBadge,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CImage,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTab,
  CTabList,
  CTabs,
  CTabPanel,
  CTabContent,
  CContainer,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import useVerify from '../../hooks/UseVerify'
import { cilCart, cilClipboard, cilHeart } from '@coreui/icons'
import useManageStockService from '../../services/ProductService'
import useMasterDataService from '../../services/MasterDataService'
import profile from './../../assets/images/avatars/Y.jpg'
const Profile = () => {
  const { getInventory } = useManageStockService()
  const { getMasterData } = useMasterDataService()
  const [productsData, setProductsData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const { roleName } = useVerify()
  const { name } = useVerify()

  const apiCategory = 'category'
  const navigate = useNavigate()

  const getProducts = async () => {
    const response = await getInventory()
    setProductsData(response.data)
  }

  const getCategories = async () => {
    const response = await getMasterData(apiCategory)
    setCategoriesData(response.data)
  }

  useEffect(() => {
    getProducts()
    getCategories()
  }, [])

  const [firstName, lastName] = name.split(' ')

  return (
    <CTabs activeItemKey={2}>
      <CTabList variant="underline-border">
        <CTab aria-controls="home-tab-pane" itemKey={1}>
          Profile
        </CTab>

        <CTab aria-controls="profile-tab-pane" itemKey={2}>
          Structure
        </CTab>
        <CTab aria-controls="contact-tab-pane" itemKey={3}>
          Addres list
        </CTab>
        <CTab aria-controls="contact-tab-pane" itemKey={4}>
          Payment
        </CTab>
        <CTab aria-controls="contact-tab-pane" itemKey={5}>
          Notification
        </CTab>
      </CTabList>
      <CTabContent>
        <CTabPanel className="py-3" aria-labelledby="home-tab-pane" itemKey={1}>
          <CContainer>
            <CRow>
              <CCol xs={4}>
                <CCard style={{ position: 'sticky', top: '0', zIndex: '10' }}>
                  <CCardBody>
                    {roleName === 'super admin' && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <img
                          src="path-to-user-photo.jpg"
                          alt="User Profile"
                          style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            marginRight: '16px',
                          }}
                        />
                      </div>
                    )}

                    <hr />
                    <CButton color="light">Choice Your Photo</CButton>

                    <hr />
                    <CButton color="light">Change Password</CButton>
                    <hr />
                    <CButton color="light">Light</CButton>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xs={8}>
                <CRow className="g-2">
                  <CCard className="h-80">
                    <CCardBody className="d-flex flex-column justify-content-between">
                      <CRow className="align-items-center">
                        <label className="fw-bold py-2">Profil Change</label>
                        <br />
                        <label className="py-2">
                          Name :{' '}
                          <span>
                            {firstName}
                            {lastName}
                          </span>{' '}
                        </label>
                        <br />
                        <label className="py-2">location :</label>
                        <br />
                        <label className="py-2">Email:</label>
                        <br />
                        <label className="py-2">Phone Number :</label>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CRow>
              </CCol>
            </CRow>
          </CContainer>
        </CTabPanel>
        <CTabPanel className="py-3" aria-labelledby="profile-tab-pane" itemKey={2}>
          Profile tab content
        </CTabPanel>
        <CTabPanel className="py-3" aria-labelledby="contact-tab-pane" itemKey={3}>
          Contact tab content
        </CTabPanel>
        <CTabPanel className="py-3" aria-labelledby="contact-tab-pane" itemKey={4}>
          Contact tab content
        </CTabPanel>
        <CTabPanel className="py-3" aria-labelledby="contact-tab-pane" itemKey={4}>
          Contact tab content
        </CTabPanel>
      </CTabContent>
    </CTabs>
  )
}

export default Profile
