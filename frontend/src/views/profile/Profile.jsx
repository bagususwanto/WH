import React, { useEffect, useState, useContext, useRef } from 'react'
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
  CModalHeader,
  CAccordionItem,
  CFormLabel,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAccordionBody,
  CAccordion,
  CAccordionHeader,
  CTab,
  CTabList,
  CTabs,
  CTabPanel,
  CTabContent,
  CContainer,
  CFormCheck,
  CCardHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import useVerify from '../../hooks/UseVerify'
import { cilEnvelopeOpen } from '@coreui/icons'
import useMasterDataService from '../../services/MasterDataService'

import useNotificationService from '../../services/NotificationService'
import { GlobalContext } from '../../context/GlobalProvider'

const Profile = () => {
  const { getMasterData, postMasterData } = useMasterDataService()
  const [selectedImage, setSelectedImage] = useState()

  const [userData, setUserData] = useState([])
  const [structureData, setStructureData] = useState([])
  const [notifProfile, setnotifProfile] = useState([])
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifCount, setNotifCount] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalPassVisible, setModalPassVisible] = useState(false)
  const fileInputRef = useRef(null) // Use a ref to trigger the file input
  const [visibleNotifCount, setVisibleNotifCount] = useState(7) // Awalnya menampilkan 7 notifikasi
  const { roleName, userId } = useVerify() // Pastikan `userId` diperoleh dari konteks atau props
  const apiProfile = 'profile'
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const apiPassword = 'change-password'
  // Fetch user profile

  const fetchProfileData = async () => {
    try {
      const profileData = await getMasterData(apiProfile)
      // Ensure the data is set as an array
      setUserData(profileData.data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }


  // Memanggil fetchProfileData saat komponen di-mount
  useEffect(() => {
    fetchProfileData()
  }, [])

  const handlePasswordChange = async () => {
    const passDataToSave = { ...passData };

    if (newPassword !== confirmPassword) {
      return; // Don't continue if passwords don't match
    }

    try {
      await postMasterData(apiPassword, passDataToSave);

      setModalPassVisible(false); // Close modal after success
      clearForm(); // Clear form fields or data

    } catch (error) {
      console.error('Error changing password:', error);
    }
};
  

  // Personal Data and Contact Data Arrays
  const personalData = [
    { label: 'Name', value: userData.name },
    { label: 'Position', value: userData.position },
    { label: 'Line', value: userData.Organization?.Line?.lineName || '-' },
    { label: 'Section', value: userData.Organization?.Section?.sectionName || '-' },
    { label: 'Department', value: userData.Organization?.Department?.departmentName || '-' },
  ]

  const contactData = [
    { label: 'Email', value: userData.email || '-' },
    { label: 'Phone Number', value: userData.noHandphone || '-' },
  ]


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
  }

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }
  const toggleModalPassword = () => {
    setModalPassVisible(!modalPassVisible)
  }
  const loadMore = () => {
    setVisibleNotifCount((prevCount) => prevCount + 7) // Menambah 7 notifikasi lagi
  }


  const clearForm = () => {
    // Reset the password data fields
    setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
};

  return (
    <CTabs activeItemKey={'profile'}>
      <CTabList variant="underline-border">
        <CTab aria-controls="home-tab-pane" itemKey={'profile'}>
          Profile
        </CTab>
      </CTabList>
      <CTabContent>
        <CTabPanel className="py-3" aria-labelledby="home-tab-pane" itemKey={'profile'}>
          <CContainer>
            <CRow>
              <CCol xs={4}>
                <CCard style={{ position: 'sticky', top: '0', zIndex: '10' }}>
                  <CCardBody>
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
                        <CButton className=" px-5 py-3" color="primary" onClick={openFileExplorer}>
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
                  <CModalBody >
                    <CRow>
                      {' '}
                      {/* Added margin bottom for spacing */}
                      <CRow>
                        {/* Old Password */}
                        <CFormLabel style={{ fontSize: '0.8rem' }} className="mb-1 mt-1">
                            Old Password
                        </CFormLabel>
                        <div className="d-flex justify-content-center">
                            <CFormInput
                            type="password"
                            id="inputPassword1"
                            placeholder="Password"
                            className="mb-2"
                            value={passData.oldPassword}
                            onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                            />
                        </div>

                        {/* New Password */}
                        <CFormLabel style={{ fontSize: '0.8rem' }} className="mb-1 mt-2">
                            New Password
                        </CFormLabel>
                        <div className="d-flex justify-content-center">
                            <CFormInput
                            type="password"
                            id="inputPassword2"
                            placeholder="Password"
                            className="mb-2"
                            value={passData.newPassword}
                            disabled={!passData.oldPassword} // Disable jika oldPassword kosong
                            style={{
                                border: !passData.oldPassword ? '1px solid gray' : '1px solid red', // Border merah jika sudah aktif
                              }}
                            onChange={(e) =>
                                setPassData({ ...passData, newPassword: e.target.value })
                            }
                            />
                        </div>

                        {/* Confirm Password */}
                        <CFormLabel style={{ fontSize: '0.8rem' }} className="mb-1">
                            Confirm Password
                        </CFormLabel>
                        <div className="d-flex justify-content-center">
                            <CFormInput
                            type="password"
                            id="inputPassword3"
                            placeholder="Password"
                            className="mb-2"
                            value={passData.confirmPassword}
                            disabled={!passData.oldPassword} // Disable jika oldPassword kosong
                            style={{
                                border: !passData.oldPassword ? '1px solid gray' : '1px solid red', // Border merah jika sudah aktif
                              }}
                            onChange={(e) =>
                                setPassData({ ...passData, confirmPassword: e.target.value })
                            }
                            />
                        </div>
                        </CRow>

                      <CRow>
                        <CCol md={12} className="d-flex justify-content-end">
                          <CButton 
                          color="primary" 
                          onClick={handlePasswordChange}
                          className='mt-2'>
                            Confirm
                          </CButton>
                        </CCol>
                      </CRow>
                    </CRow>
                  </CModalBody>
                </CModal>
              </CCol>

              <CCol xs={8}>
                <CRow className="g-2">
                  <CCard className="h-80">
                    <CCardBody className="d-flex flex-column justify-content-between">
                      {userData ? (
                        <div>
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
                              <label className="py-2">{userData.name}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="py-2">Position</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 "> {userData.position}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="3">
                              <label className="py-2">Line</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 ">
                                {userData.Organization?.Line?.lineName}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="py-2">Section</label>
                            </CCol>
                            <CCol xs="7">
                              <label className="py-2 ">
                                {userData.Organization?.Section?.sectionName}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow className="">
                            <CCol xs="3">
                              <label className="py-2">Departement</label>
                            </CCol>
                            <CCol xs="6">
                              <label className="py-2 ">
                                {userData.Organization?.Department?.departmentName}
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
                              <label className="py-2">{userData.email}</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="3">
                              <label className="py-2">Phone Number</label>
                            </CCol>
                          </CRow>
                        </div>
                      ) : (
                        <p>No user data available</p>
                      )}
                    </CCardBody>
                  </CCard>
                </CRow>
              </CCol>
            </CRow>
          </CContainer>
        </CTabPanel>

        {/* <CTabPanel className="py-3" aria-labelledby="profile-tab-pane" itemKey={'structure'}>
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
                                      {user.Organization.Line.lineName},{' '}
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
            </CRow>
          </CContainer>
        </CTabPanel> */}
      </CTabContent>
    </CTabs>
  )
}

export default Profile
