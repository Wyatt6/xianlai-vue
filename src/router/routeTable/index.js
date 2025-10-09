import portalRoutes from './modules/portal'
import homepageRoutes from './modules/homepage'
import ledgerRoutes from './modules/ledger'
import iamRoutes from './modules/iam'
import errorsRoutes from './modules/errors'

export default [...portalRoutes, ...homepageRoutes, ...ledgerRoutes, ...iamRoutes, ...errorsRoutes]
