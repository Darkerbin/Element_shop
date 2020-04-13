<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from "echarts";

export default {
  data() {
    return {};
  },
  created() {},

  methods: {},
  async mounted() {
    var myChart = echarts.init(document.getElementById("main"));

    const { data: res } = await this.$http.get(`reports/type/1`);
    if (res.meta.status !== 200) {
      return this.$message.error("获取失败");
    }

    myChart.setOption(res.data);
  }
};
</script>

<style lang="scss" scoped>
</style>