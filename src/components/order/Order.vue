<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderlist" style="width: 100%" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180px">
          <template slot-scope="scope">{{scope.row.create_time*1000|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template>
            <!-- 修改信息 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDialog"></el-button>
            <!-- 物流信息 -->
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClose"
    >
      <el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度订单对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";

export default {
  data() {
    return {
      // 查询对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderlist: [],
      // 总条数
      total: 0,
      //  控制 修改地址 对话框的显示与隐藏
      addressDialogVisible: false,
      //  修改地址表单
      addressForm: {
        address1: "",
        address2: ""
      },
      //  修改地址表单  规则
      addressRules: {
        address1: [
          { required: true, message: "请输入省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      //  一份 城市-城区 的  js文件
      cityData,
      //  控制 展示物流 对话框的显示与隐藏
      progressDialogVisible: false,
      //  物流信息
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取订单列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get(`orders`, {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      this.orderlist = res.data.goods;
      this.total = res.data.total;
    },
    // 监听当前每页显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 监听当前的页面改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    //  修改地址 弹框
    showAddressDialog() {
      this.addressDialogVisible = true;
    },
    //  关闭修改地址 弹框
    addressDialogClose() {
      this.$refs.addressRef.resetFields();
    },
    //  查看物流 
    async showProgressDialog () {
      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) { return this.$message.error('获取物流失败') }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
};
</script>

<style lang="scss" scoped>
.el-cascader {
  width: 100%;
}
</style>