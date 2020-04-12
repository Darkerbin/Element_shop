<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域  -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDailog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="cateList" border stripe row-key="cat_id" :tree-props="treeProps" lazy>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="分类名称" prop="cat_name"></el-table-column>
        <el-table-column label="是否有效">
          <template v-slot="scope">
            <i style="color:green;" v-if="scope.row.cat_deleted === false" class="el-icon-success"></i>
            <i style="color:red;" v-else class="el-icon-error"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
            <el-tag size="mini" v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
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
      ></el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <el-form
          ref="addCateRuleFormRef"
          :rules="addCateFormRules"
          :model="addCateForm"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
              <!-- options 用来指定数据源 -->
              <!-- props 用来指定配置对象 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数居条数
      total: 0,
      treeProps: { children: "children", hasChildren: "hasChildren" },
      // 控制添加分类弹框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加 的为一级分类
        cat_level: 0
      },
      // 添加分类表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定联级选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 选中的父级名称的数组
      selectedKeys: []
    };
  },
  created() {
    //调用分类列表
    this.getCateList();
  },
  methods: {
    //获取分类列表
    getCateList() {
      this.$http.get("categories", { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取商品分类列表失败");
        }
        this.cateList = res.data.data.result;
        console.log(this.cateList);
        this.total = res.data.data.total;
      });
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击弹出添加分类弹框
    showAddCateDailog() {
      // 获取父级分类列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类列表
    getParentCateList() {
      this.$http.get('categories', { params: { type: 2 } }).then( res => {
        console.log(res.data)
        if(res.data.meta.status !== 200){
          return this.$message.error('获取父级分类数据失败')
        }
        this.parentCateList = res.data.data
      })
    },
    //  父级选择项发生变化触发
    parentCateChange() {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组的length 大于0，证明有选中父级分类，
      //反之，说明没有选中父级分类
      if(this.selectedKeys.length > 0){
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 确定添加分类
    addCate() {
      this.$refs.addCateRuleFormRef.validate(vaild => {
        if(!vaild) return
        this.$http.post('categories', this.addCateForm).then(res => {
          if(res.data.meta.status !== 201){
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      })
    },
    // 监听对话框关闭，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateRuleFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
};
</script>

<style lang="scss" scoped>
.el-cascader {
  width: 100%;
}
  
</style>