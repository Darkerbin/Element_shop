<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/home.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边 -->
      <el-aside :width="isCollapse ? '6.4rem' : '20rem'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" :unique-opened="true"	:collapse='isCollapse' :collapse-transition='false' :default-active='$route.path' router>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path + ''" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
        menuList: [],
        isCollapse: false
    };
  },
  created() {
    this.getMenuList();
  },
  methods: {
    //登出
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 控制菜单显示隐藏
    toggleCollapse() {
        this.isCollapse = !this.isCollapse;
    },
    //获取餐单列表
    getMenuList() {
        this.$http.get('menus').then((res) => {
            console.log(res.data)
            if(res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
            this.menuList = res.data.data
            // console.log(this.menuList)
        })
    }
  },

};
</script>

<style lang="scss" socped>
.home-container {
  height: 100vh;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 2rem;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    img {
      height: 5rem;
    }
    span {
      margin-left: 1rem;
    }
  }
}
.el-aside {
  background-color: #373d41;
  .el-menu {
      border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button {
    background-color: #4A5064;
    font-size: 1rem;
    line-height: 2.4rem;
    color: #fff;
    text-align: center;
    cursor: pointer;
    letter-spacing: .2rem;
}
</style>