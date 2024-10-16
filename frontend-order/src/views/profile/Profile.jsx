import React, { useEffect, useState,useRef} from 'react'
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
import useMasterDataService from '../../services/MasterDataService'

const Profile = () => {
  const { getMasterData } = useMasterDataService()
  const [selectedImage, setSelectedImage] = useState()
  const [userData, setUserData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
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

  return (
    <CTabs activeItemKey={1}>
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
                    <CButton color="light" onClick={toggleModal}>
                      Choose Your Photo
                    </CButton>

                    <hr />
                    <CButton color="light">Change Password</CButton>
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
              </CCol>

              <CCol xs={8}>
                <CRow className="g-2">
                  <CCard className="h-80">
                    <CCardBody className="d-flex flex-column justify-content-between">
                      {userData.map((user) => (
                        <CRow className="align-items-center">
                          <label className="fw-bold py-2">Profil Change</label>
                          <br />
                          <label className="py-2">Name : {user.name}</label>
                          <br />
                          <label className="py-2">Position : {user.position}</label>
                          <br />
                          <label className="py-2">
                            Location :{user.Organization.Line.lineName},{' '}
                            {user.Organization.Section.sectionName},{' '}
                            {user.Organization.Department.departmentName}.
                          </label>
                          <br />
                          <label className="py-2">Email:{user.email}</label>
                          <br />
                          <label className="py-2">Phone Number :{user.noHandphone}</label>
                        </CRow>
                      ))}
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
