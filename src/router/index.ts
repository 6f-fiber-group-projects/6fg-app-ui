import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { authStore } from "../store/index"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'EquipmentList',
    component: () => import("../views/EquipmentList.vue")
  },
  {
    path: '/equipment/:equipId',
    name: 'Equipment',
    component: () => import("../views/Equipment.vue")
  },
  {
    path: '/user',
    name: 'UserList',
    component: () => import("../views/UserList.vue")
  },
  {
    path: '/user/:userId',
    name: 'User',
    component: () => import("../views/User.vue")
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import("../views/Login.vue")
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.name != "Login" && !authStore.isLogin) {
    return next({path: "/login", query: {redirect: to.fullPath}})
  }
  if (to.name == "Login" && authStore.isLogin) {
    return next({path: "/"})
  }
  next()
})

export default router
