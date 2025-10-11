import homepageRoutes from './modules/homepage'
import ledgerRoutes from './modules/ledger'
import iamRoutes from './modules/iam'
import errorsRoutes from './modules/errors'

export default [...homepageRoutes, ...ledgerRoutes, ...iamRoutes, ...errorsRoutes]
