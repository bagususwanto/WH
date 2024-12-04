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
  CModalFooter,
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
  const { getMasterData } = useMasterDataService()
  const [selectedImage, setSelectedImage] = useState()
  const [userData, setUserData] = useState([])
  const [notifProfile, setnotifProfile] = useState([])
  const [notifCount, setNotifCount] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalPassVisible, setModalPassVisible] = useState(false)
  const { getNotification, getNotificationCount } = useNotificationService()
  const { warehouse, setWarehouse, cartCount, cart, setCart } = useContext(GlobalContext)
  const { roleName } = useVerify()
  const fileInputRef = useRef(null) // Use a ref to trigger the file input
  const [visibleNotifCount, setVisibleNotifCount] = useState(7) // Awalnya menampilkan 7 notifikasi

  const apiUser = 'user-public'

  const getNotifDesc = async () => {
    try {
      const response = await getNotification(warehouse.id)
      setnotifProfile(response)
    } catch (error) {
      console.error('Error fetching notif:', error)
    }
  }

  const getNotifCount = (notifications) => {
    if (notifications && Array.isArray(notifications)) {
      const unreadCount = notifications.filter((notif) => notif.isRead === 0).length;
      setNotifCount(unreadCount); // Update state with unread count
    } else {
      console.error("Notifications data is not in the expected format.");
      setNotifCount(0); // Default to 0 if notifications is not an array
    }
  };
  

  const getusers = async () => {
    try {
      const response = await getMasterData(apiUser);
      
      // Check if response.data is not undefined and is an array before calling filter()
      if (response && response.data && Array.isArray(response.data)) {
        const filteredUserData = response.data.filter((user) => user.id === 3);
        setUserData(filteredUserData);
  
        // Check if image data exists in the filtered response and update states
        if (filteredUserData.length > 0 && filteredUserData[0].img) {
          setApiImage(filteredUserData[0].img); // Store the image from API in state
          setSelectedImage(filteredUserData[0].img); // Set the selected image to the API image initially
        }
      } else {
        console.error("API response is not in the expected format or is missing data.");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  

  useEffect(() => {
    getusers()
  }, [])

  useEffect(() => {
    if (warehouse && warehouse.id) {
      getNotifDesc(); // Get notifications first
      const interval = setInterval(() => {
        getNotifCount(notifProfile); // Pass the notifications data
      }, 5000);
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [warehouse, cartCount, notifProfile]); // Make sure notifProfile is updated properly
  
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
  const loadMore = () => {
    setVisibleNotifCount((prevCount) => prevCount + 7) // Menambah 7 notifikasi lagi
  }

  return (
    <CTabs activeItemKey={'notifikasi'}>
      <CTabList variant="underline-border">
        <CTab aria-controls="home-tab-pane" itemKey={'notifikasi'}>
          Notifikasi
        </CTab>

        <CTab aria-controls="home-tab-pane" itemKey={'profile'}>
          Profile
        </CTab>

        <CTab aria-controls="profile-tab-pane" itemKey={'structure'}>
          Structure Approval
        </CTab>
      </CTabList>
      <CTabContent>
        <CTabPanel className="py-3" aria-labelledby="home-tab-pane" itemKey={'notifikasi'}>
          <CContainer>
            <CRow>
              <label className="mb-2 fs-4 fw-bold">Your Notification</label>
            </CRow>
            <CRow>
              <CCard>
                <CAccordionHeader className="mt-2 fs-6">Transaction Info</CAccordionHeader>
                <hr className="my-1" />
                {notifProfile.slice(0, visibleNotifCount).map((notif, index) => (
                  <CCardBody key={index} className="p-1">
                    <CRow className="align-items-center mb-1">
                      <CCol xs={1} className="d-flex justify-content-center">
                        <CIcon icon={cilEnvelopeOpen} size="lg" />
                      </CCol>
                      <CCol xs={11}>
                        <div>
                          <div className="mb-0 fw-light text-muted">Message for you</div>
                          <div>{notif.description}</div>
                        </div>
                      </CCol>
                    </CRow>
                    {index < visibleNotifCount - 1 && index < notifProfile.length - 1 && (
                      <hr className="my-1" />
                    )}
                  </CCardBody>
                ))}
              </CCard>
              {visibleNotifCount < notifProfile.length && (
                <div className="text-center my-3">
                  <CButton color="primary" onClick={loadMore}>
                    Load More
                  </CButton>
                </div>
              )}
            </CRow>
          </CContainer>
        </CTabPanel>

        <CTabPanel className="py-3" aria-labelledby="home-tab-pane" itemKey={'profile'}>
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
                  <CModalBody>
                    <CRow className="text-start mb-4">
                      {' '}
                      {/* Added margin bottom for spacing */}
                      <CCol xs={8}>
                        {' '}
                        {/* Adjusted to 7 for more space */}
                        <CFormLabel htmlFor="inputPassword2" className="visually-hidden">
                          Password
                        </CFormLabel>
                        <CFormInput type="password" id="inputPassword2" placeholder="Password" />
                      </CCol>
                      <CCol xs={4}>
                        <CButton color="primary" type="submit" className="mb-2">
                          Confirm identity
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
                            <CCol xs="12">
                              <label className="fw-bold py-2 text-muted">Change Biodata Diri</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="4">
                              <label className="py-2">Name</label>
                            </CCol>
                            <CCol xs="8">
                              <label className="py-2">{user.name}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="4">
                              <label className="py-2">Position</label>
                            </CCol>
                            <CCol xs="8">
                              <label className="py-2 "> {user.position}</label>
                            </CCol>
                          </CRow>
                          <CRow className="text-start">
                            <CCol xs="4">
                              <label className="py-2">Line</label>
                            </CCol>
                            <CCol xs="8">
                              <label className="py-2 ">{user.Organization.Line.lineName}</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="4">
                              <label className="py-2">Section</label>
                            </CCol>
                            <CCol xs="8">
                              <label className="py-2 ">
                                {user.Organization.Section.sectionName},{' '}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow className="">
                            <CCol xs="4">
                              <label className="py-2">Departement</label>
                            </CCol>
                            <CCol xs="8">
                              <label className="py-2 ">
                                {user.Organization.Department.departmentName}
                              </label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="12">
                              <label className="fw-bold py-2 text-muted">Change Contact</label>
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs="4">
                              <label className="py-2">Email</label>
                            </CCol>
                            <CCol xs="8">
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

        <CTabPanel className="py-3" aria-labelledby="profile-tab-pane" itemKey={'structure'}>
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
        </CTabPanel>
      </CTabContent>
    </CTabs>
  )
}

export default Profile
