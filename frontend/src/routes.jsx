import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Inventory = React.lazy(() => import('./views/inventory/Inventory'))
const Incoming = React.lazy(() => import('./views/incoming/incoming'))
const Category = React.lazy(() => import('./views/masterdata/category/Category'))
const Shop = React.lazy(() => import('./views/masterdata/shop/Shop'))
const Plant = React.lazy(() => import('./views/masterdata/plant/Plant'))
const Supplier = React.lazy(() => import('./views/masterdata/supplier/Supplier'))
const Material = React.lazy(() => import('./views/masterdata/material/Material'))
const Role = React.lazy(() => import('./views/masterdata/role/Role'))
const Cost = React.lazy(() => import('./views/masterdata/cost/Cost'))
const Storage = React.lazy(() => import('./views/masterdata/storage/Storage'))
const Address = React.lazy(() => import('./views/masterdata/address/Address'))
const User = React.lazy(() => import('./views/masterdata/user/User'))
const Home = React.lazy(() => import('./views/home/Home'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const InputInventory = React.lazy(() => import('./views/inventory/InputInventory'))
const GoodIssue = React.lazy(() => import('./views/gidata/GoodIssue'))
const Redpost = React.lazy(() => import('./views/redpostdata/Redpost'))
const Request = React.lazy(() => import('./views/request/Request'))
const HistoryRequest = React.lazy(() => import('./views/request/HistoryRequest'))
const ApprovalRequestSec = React.lazy(() => import('./views/request/ApprovalRequest'))
const ApprovalRequestDept = React.lazy(() => import('./views/request/ApprovalRequestDept'))
const ApprovalRequestDiv = React.lazy(() => import('./views/request/ApprovalRequestDiv'))
const Compare = React.lazy(() => import('./views/dashboard/SohCompare'))
const Packaging = React.lazy(() => import('./views/masterdata/packaging/Packaging'))
const Organization = React.lazy(() => import('./views/masterdata/organization/Organization'))
const Division = React.lazy(() => import('./views/masterdata/division/Division'))
const Department = React.lazy(() => import('./views/masterdata/department/Department'))
const Warehouse = React.lazy(() => import('./views/masterdata/warehouse/Warehouse'))
const Line = React.lazy(() => import('./views/masterdata/line/Line'))
const Group = React.lazy(() => import('./views/masterdata/group/Group'))
const Section = React.lazy(() => import('./views/masterdata/section/Section'))
const ServiceHours = React.lazy(() => import('./views/masterdata/servicehours/ServiceHours'))
const Wbs = React.lazy(() => import('./views/masterdata/wbs/Wbs'))
const Shift = React.lazy(() => import('./views/masterdata/shift/Shift'))
const CostCenter = React.lazy(() => import('./views/masterdata/costcenter/CostCenter'))
const GIC = React.lazy(() => import('./views/masterdata/gic/Gic'))
const ResetPassword = React.lazy(() => import('./views/pages/resetpassword/ResetPassword'))

const routes = [
  { path: '/login', name: '', element: Login },
  { path: '/dashboard', name: 'dashboard', element: Dashboard },
  { path: '/home', name: '', element: Home },
  { path: '/inventory/data', name: 'Inventory / data', element: Inventory },
  { path: '/inventory/input', name: 'Inventory / Input', element: InputInventory },
  { path: '/incoming', name: 'Incoming', element: Incoming },
  { path: '/category', name: 'Category', element: Category },
  { path: '/shop', name: 'Master / Shop', element: Shop },
  { path: '/plant', name: 'Master / Plant', element: Plant },
  { path: '/supplier', name: 'Master / Supplier', element: Supplier },
  { path: '/material', name: 'Master / Material', element: Material },
  { path: '/role', name: 'Master / Role', element: Role },
  { path: '/cost', name: 'Master / Cost', element: Cost },
  { path: '/storage', name: 'Master / Storage', element: Storage },
  { path: '/address', name: 'Master / Address', element: Address },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/user', name: 'Master / User', element: User },
  { path: '/goodissue', name: 'Good Issue', element: GoodIssue },
  { path: '/redpost', name: 'Redpost', element: Redpost },
  { path: '/input-request', name: 'Request', element: Request },
  { path: '/packaging', name: 'Master / Packaging', element: Packaging },
  { path: '/approval-request/sect-head', name: 'Approval Request Sect', element: ApprovalRequestSec },
  { path: '/approval-request/dept-head', name: 'Approval Request Dept', element: ApprovalRequestDept },
  { path: '/approval-request/div-head', name: 'Approval Request Div', element: ApprovalRequestDiv },
  { path: '/compare-inventory', name: 'Compare Inventory', element: Compare },
  { path: '/history-request', name: 'History Request', element: HistoryRequest },
  { path: '/organization', name: 'Master / Organization', element: Organization },
  { path: '/division', name: 'Master / Division', element: Division },
  { path: '/department', name: 'Master / Department', element: Department },
  { path: '/warehouse', name: 'Master / Warehouse', element: Warehouse },
  { path: '/line', name: 'Master / Line', element: Line },
  { path: '/group', name: 'Master / Group', element: Group },
  { path: '/section', name: 'Master / Section', element: Section },
  { path: '/service-hours', name: 'Master / Service Hours', element: ServiceHours },
  { path: '/wbs', name: 'Master / WBS', element: Wbs },
  { path: '/shift', name: 'Master / Shift', element: Shift },
  { path: '/cc', name: 'Master / Cost Center', element: CostCenter },
  { path: '/gic', name: 'Master / GI Card', element: GIC },
  { path: '/reset-password', name: '', element: ResetPassword },
]

export default routes
