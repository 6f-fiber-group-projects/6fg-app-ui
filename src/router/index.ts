import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from "../store/index"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'EquipmentList',
    component: () => import("../views/EquipmentList.vue")
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import("../views/Login.vue")
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.name != "Login" && !store.getters.isLogin) {
    return next({path: "/login", query: {redirect: to.fullPath}})
  }
  if (to.name == "Login" && store.getters.isLogin) {
    return next({path: "/"})
  }
  next()
})

export default router
