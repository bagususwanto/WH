import React, { useEffect, useState, useRef } from 'react'
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
  CFormLabel,
  CAccordionBody,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
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
import useMasterDataService from '../../services/MasterDataService'

const Profile = () => {
  const { getMasterData } = useMasterDataService()
  const [selectedImage, setSelectedImage] = useState()
  const [userData, setUserData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalPassVisible, setModalPassVisible] = useState(false)
  const { roleName } = useVerify()
  const fileInputRef = useRef(null) // Use a ref to trigger the file input

  const apiUser = 'user'

  const getusers = async () => {
    const response = await getMasterData(apiUser)
    setUserData(response.data)

    // Check if image data exists in the response and update states
    if (response.data && response.data[0] && response.data[0].img) {
      setApiImage(response.data[0].img) // Store the image from API in state
      setSelectedImage(response.data[0].img) // Set the selected image to the API image initially
    }
  }
  useEffect(() => {
    getusers()
  }, [])

  const handleFileSelection = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result) // Set the selected image for preview
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to trigger the file input element
  const openFileExplorer = () => {
    fileInputRef.current.click() // Programmatically click the hidden input
  }
  // Function to handle photo reset (reset to API image)
  const handleResetPhoto = () => {
    setSelectedImage(apiImage) // Reset the selected image to the one from API
    console.log('Photo has been reset to the API version.')
  }

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }
  const toggleModalPassword = () => {
    setModalPassVisible(!modalPassVisible)
  }

  return (
    <CTabs activeItemKey={1}>
      <CTabList variant="underline-border">
        <CTab aria-controls="home-tab-pane" itemKey={1}>
          Profile
        </CTab>

        <CTab aria-controls="profile-tab-pane" itemKey={2}>
          Structure Approval
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
                          src={selectedImage} // Show the selected or API image
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CButton color="light" onClick={toggleModal}>
                        Choose Your Photo
                      </CButton>

                      <hr style={{ width: '100%' }} />

                      <CButton color="light" onClick={toggleModalPassword}>
                        Change Password
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>

                {/* Modal for selecting photo */}
                <CModal visible={modalVisible} onClose={toggleModal}>
                  <CModalHeader>Choose a Photo</CModalHeader>
                  <CModalBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <CButton color="primary" onClick={openFileExplorer}>
                          From Gallery
                        </CButton>
                        {/* Hidden input for file selection */}
                        <input
                          ref={fileInputRef} // Reference to trigger the input programmatically
                          type="file"
                          accept="image/*" // This ensures only image files can be selected
                          style={{ display: 'none' }} // Hide the input
                          onChange={handleFileSelection} // Handle file selection from gallery
                        />
                      </div>
                      <div>
                        <CButton color="danger" onClick={handleResetPhoto}>
                          Reset
                        </CButton>
                      </div>
                    </div>
                  </CModalBody>
                </CModal>
                <CModal visible={modalPassVisible} onClose={toggleModalPassword}>
                  <CModalHeader>Change Password</CModalHeader>
                  <CModalBody>
                    <CRow className="text-start mb-4">
                      {' '}
                      {/* Added margin bottom for spacing */}
                      <CCol xs={9}>
                        {' '}
                        {/* Adjusted to 7 for more space */}
                        <CFormLabel htmlFor="inputPassword2" className="visually-hidden">
                          Password
                        </CFormLabel>
                        <CFormInput type="password" id="inputPassword2" placeholder="Password" />
                      </CCol>
                      <CCol xs={3}>
                        <CButton color="primary" type="submit" className="mb-2">
                          Confirm
                        </CButton>
                      </CCol>
                    </CRow>
                  </CModalBody>
                </CModal>
              </CCol>

              <CCol xs={8}>
                <CRow className="g-2">
                  <CCard className="h-80">
                    <CCardBody className="d-flex flex-column justify-content-between">
                      {userData.map((user, index) => (
                        <div key={index}>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="fw-bold py-2 text-muted">Change Biodata Diri</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="py-2">Name</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2">{user.name}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="py-2">Position</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 "> {user.position}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="py-2">Line</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 ">{user.Organization?.Line?.lineName}</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="py-2">Section</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 ">
                                {user.Organization.Section.sectionName},{' '}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow className="">
                            <CCol xs="3">
                              <label className="py-2">Departement</label>
                            </CCol>
                            <CCol xs="6">
                              <label className="py-2 ">
                                {user.Organization.Department.departmentName}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="fw-bold py-2 text-muted">Change Contact</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="py-2">Email</label>
                            </CCol>
                            <CCol xs="6">
                              <label className="py-2">{user.email}</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="py-2">Phone Number</label>
                            </CCol>
                          </CRow>
                        </div>
                      ))}
                    </CCardBody>
                  </CCard>
                </CRow>
              </CCol>
            </CRow>
          </CContainer>
        </CTabPanel>

        <CTabPanel className="py-3" aria-labelledby="profile-tab-pane" itemKey={2}>
          <CContainer>
            <CRow>
              <CCol xs={5}>
                <CRow className="g-2">
                  <CCard className="h-80">
                    <CCardBody className="d-flex flex-column justify-content-between">
                      {userData.map((user) => (
                        <CRow className="align-items-center">
                          <label className="fw-bold fs-5 mb-2"> Your Structure Approval</label>
                          <CAccordion activeItemKey={1}>
                            <CAccordionItem itemKey={1}>
                              <CAccordionHeader className="text-muted">
                                Approval Line Head
                              </CAccordionHeader>
                              <CAccordionBody>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Name </label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">Bagus</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Position</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">Line Head</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Line</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">
                                      {' '}
                                      {user.Organization?.Line?.lineName},{' '}
                                    </label>
                                  </CCol>
                                </CRow>
                              </CAccordionBody>
                            </CAccordionItem>
                            <CAccordionItem itemKey={2}>
                              <CAccordionHeader className="text-muted">
                                Approval Section Head
                              </CAccordionHeader>
                              <CAccordionBody>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Name</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">Prihandono</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Position</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">SectionHead</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Line</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">
                                      {' '}
                                      {user.Organization.Section.sectionName},{' '}
                                    </label>
                                  </CCol>
                                </CRow>
                              </CAccordionBody>
                            </CAccordionItem>
                            <CAccordionItem itemKey={3}>
                              <CAccordionHeader className="text-muted">
                                Approval Dph Head
                              </CAccordionHeader>
                              <CAccordionBody>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Name</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">Andjar Januar</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Position</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 "> Department Head</label>
                                  </CCol>
                                </CRow>
                                <CRow className="">
                                  <CCol xs="3">
                                    <label className="py-2">Line</label>
                                  </CCol>
                                  <CCol xs="9 ">
                                    <label className="py-2 ">
                                      {user.Organization.Department.departmentName},{' '}
                                    </label>
                                  </CCol>
                                </CRow>
                              </CAccordionBody>
                            </CAccordionItem>
                          </CAccordion>
                        </CRow>
                      ))}
                    </CCardBody>
                  </CCard>
                </CRow>
              </CCol>
              <CCol xs={7}>
                <CRow>
                  <CCard>
                    <CCardBody>
                      <label className="fw-bold fs-5"> Your Information</label>
                    </CCardBody>
                  </CCard>
                </CRow>
              </CCol>
            </CRow>
          </CContainer>
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
