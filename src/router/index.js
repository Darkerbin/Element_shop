import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', 
    redirect: '/login'
  },
  { 
    path: '/login', component: Login
  },
  {
    path: '/home',
    redirect: '/welcome',
    component:() => import( '../components/Home.vue'),
    children: [
      {
        path: '/welcome',component:() => import('../components/Welcome.vue')
      },
      {
        path: '/users',component:() => import('../components/user/Users.vue')
      },
      {
        path: '/rights',component:() => import('../components/power/AuthorityList.vue')
      },
      {
        path: '/roles',component:() => import('../components/power/RolesList.vue')
      },
      {
        path: '/categories',component:() => import('../components/goods/GoodsCate.vue')
      },
      {
        path: '/params',component:() => import('../components/goods/CateParams.vue')
      },
      {
        path: '/goods',component:() => import('../components/goods/GoodsList.vue')
      },
      {
        path: '/goods/add',component:() => import('../components/goods/Add.vue')
      },
      {
        path: '/orders',component:() => import('../components/order/Order.vue')
      },
      {
        path: '/reports',component:() => import('../components/report/Report.vue')
      }
    ]
  }
  
]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

//挂载路由导航守卫
  router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，表示放行  
    // next()  放行   next('/login')  强制跳转
    if(to.path === '/login')  return next();
    // 获取 token
    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr) return next('/login')
    next()
  })
export default router



