import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './plugins/element.js'
// import 'element-ui/lib/theme-chalk/index.css';
// 引入全局样式
import './assets/css/global.scss'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


//  导入Nprogress 包对应的 js 和 css
import Nprogress from 'nprogress'


// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)


import axios from 'axios'
//配置统一路径
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
// 在 request 拦截其中，展示进度条  Nprogress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response 拦截其中，展示进度条  Nprogress.done()
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios


//  定义一个时间戳 过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
