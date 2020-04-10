import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', 
    redirect: '/login'
  },
  { 
    path: '/login',
    name: Login,
    component: Login
  },
  {
    path: '/home',
    name: Home,
    redirect: '/welcome',
    component:() => import( '../components/Home.vue'),
    children: [
      {
        path: '/welcome',
        name: Welcome,
        component:() => import('../components/Welcome.vue')
      },
      {
        path: '/users',
        name: Users,
        component:() => import('../components/user/Users.vue')
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

