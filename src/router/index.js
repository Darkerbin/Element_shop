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

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')

