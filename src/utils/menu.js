// import path from 'path'
import { isEmpty } from './common'

/**
 * 路由其实是个森林，此处找出森林中所有路由树的根节点，组成跟节点列表
 * @param {*} routes router.getRoutes()获取的扁平化的全量路由表
 */
function getRouteRoots(routes) {
  // 找到所有非根的路由
  const childrenRoutes = []
  routes.forEach(route => {
    if (route.children && route.children.length > 0) {
      childrenRoutes.push(...route.children)
    }
  })

  // 排除所有非根路由，保留跟节点路由
  return routes.filter(route => {
    return !childrenRoutes.find(childrenRoute => {
      return childrenRoute.path === route.path
    })
  })
}

/**
 * 由路由列表生成菜单列表
 * 递归遍历routes结构（森林），返回需要在菜单中显示的对应菜单结构（森林，用数组记录）
 *
 * 是否需要添加进菜单数组中的判断条件是：路由meta && meta.isMenu == true
 * 路由的类别有：
 *  1、像/login这种：是单纯的页面路由并不是菜单栏的路由，不满足条件，不需要菜单显示
 *  2、像/和/profile这种：父路由是/，不满足条件，不需要菜单显示；但是它的子路由/profile满足条件，需要（一级）菜单显示
 *  3、像/user和/user/manage这种：父子路由都满足条件，都需要菜单显示
 *  4、像/user和/user/info/:id这种：父路由/user满足条件，需要菜单显示；子路由/user/info/:id不满足条件，不需要菜单显示
 * 总结一下就是：
 * （1）不管是父路由还是子路由，只要满足条件就需要显示，不满足条件就不显示
 * （2）遇到类别2这种情况，子路由的显示层级往上级提升
 * @param {*} routes 当前层次的路由表
 * @param {*} pathPrefix 父路由的前缀，如果本级路由路径是用相对路径表示，则拼接到该前缀后面形成绝对路径
 * @returns 返回当前层级的菜单数组，该数组会在Sidebar菜单栏中被v-for循环用于菜单项的渲染
 */
function routesToMenus(routes, pathPrefix = '') {
  // 当前层次的菜单数组
  const menus = []

  // 遍历当前层次的每一个路由配置项
  routes.forEach(route => {
    // path.resolve(path1, path2, path3, ...)函数会把一个路径或路径序列按顺序解析成为一个绝对路径
    // 此处作用：如果当前路由路径是用相对路径表示，则拼接到父路由的前缀pathPrefix后面，形成完整的绝对路径
    // 注意：
    //  pathPrefix = /user, route.path = /profile/name =====> routePath = /profile/name（因为/profile/name是绝对路径）
    //  pathPrefix = /user, route.path = profile/name =====> routePath = /user/profile/name（因为profile/name是相对路径）
    // const routePath = path.resolve(pathPrefix, route.path)
    // 由于path模块不能用，用以下语句代替其功能
    let routePath = ''
    if (route.path[0] === '/') {
      routePath = route.path
    } else {
      routePath = pathPrefix + '/' + route.path
    }

    // 1、如果当前路由存在children，先递归进入children处理子路由的菜单数组
    let childrenMenus = []
    if (!isEmpty(route.children)) {
      childrenMenus = routesToMenus(route.children, routePath)
      // 如果当前路由不在菜单显示，则把子路由提高一级，挂载到本层级的菜单数组
      if (isEmpty(route.meta) || !route.meta.isMenu) {
        menus.push(...childrenMenus)
        return
      }
    }

    // 2、如果该路由满足显示条件，需要添加到菜单数组
    if (!isEmpty(route.meta) && route.meta.isMenu) {
      // 检索菜单数组中是否已经包含了routePath路径（即当前路由）的菜单对象，如果已包含则直接使用，否则创建新对象添加到菜单数组
      let menu = menus.find(menu => menu.path === routePath)
      if (!menu) {
        menu = {
          ...route, // meta在这里面了
          path: routePath,
          children: []
        }
        menus.push(menu)
      }
      // 如果当前路由在菜单显示，则把子菜单数组挂载到本层菜单的children上
      menu.children.push(...childrenMenus)
    }
  })

  return menus
}

export default { getRouteRoots, routesToMenus }
