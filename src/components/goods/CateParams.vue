<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数" type="warning"></el-alert>
      <!-- 选择商品分类区 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- Tabs 页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnIsDisable"
            @click="addDialogVisible = true "
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)  "
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDailog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnIsDisable"
            @click="addDialogVisible = true "
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)  "
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDailog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + dialogText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="dialogText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :title="'修改' + dialogText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item :label="dialogText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  分类列表数据
      cateList: [],
      // 配置联级选择器的Props
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      selectedKeys: [],
      //  默认选中的Tab
      activeName: "many",
      //  动态参数 表格数据
      manyTableData: [],
      //  静态属性 表格数据
      onlyTableData: [],
      //  控制添加 对话框 的显示与隐藏
      addDialogVisible: false,
      //   添加表单
      addForm: {
        attr_name: ""
      },
      //   添加表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      //  控制修改 对话框 的显示与隐藏
      editDialogVisible: false,
      //   添加表单
      editForm: {
        attr_name: ""
      },
      //   添加表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //  按钮是否应被  禁用
    btnIsDisable() {
      return this.selectedKeys.length !== 3;
    },
    //  计算出当前选中的三级分类的  Id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    dialogText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  },
  methods: {
    //  获取商品分类列表
    getCateList() {
      this.$http.get("categories").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取商品分类数据失败");
        }
        this.cateList = res.data.data;
      });
    },
    //  级联选择框选中，会触发函数
    handleChange() {
      this.getParamsData();
    },
    //  获取商品分类数据
    getParamsData() {
      if(this.selectedKeys.length !==3 ){
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return
      }
      this.$http
        .get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error("获取参数列表失败");
          }
          //  这一步，返回参数展开项   数组形式
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            //  给每一条数据都挂载  inputVisible 和 inputValue 属性
            //  控制文本框与按钮的显示与隐藏
            item.inputVisible = false;
            //   文本框中输入的内容
            item.inputValue = "";
          });
          console.log(res.data.data);
          if (this.activeName === "many") {
            this.manyTableData = res.data.data;
          } else {
            this.onlyTableData = res.data.data;
          }
        });
    },
    //  点击Tabs 页签
    handleTabsClick() {
      this.getParamsData();
    },
    //  关闭添加对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //  点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(vaild => {
        if (!vaild) return;
        this.$http
          .post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            if (res.data.meta.status !== 201) {
              return this.$message.error("添加参数失败");
            }
            this.$message.success("添加参数成功");
            this.addDialogVisible = false;
            this.getParamsData();
          });
      });
    },
    //  点击按钮，展开修改对话框
    showEditDailog(currentRow) {
      this.editForm = currentRow;
      this.editDialogVisible = true;
    },
    //  重置修改表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //  点击按钮，修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(vaild => {
        if (!vaild) return;
        this.$http
          .put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            }
          )
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error("修改参数失败");
            }
            this.$message.success("修改参数成功");
            this.editDialogVisible = false;
            this.getParamsData();
          });
      });
    },
    //  根据id  删除对应的参数项
    removeParams(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete(`categories/${this.cateId}/attributes/${id}`)
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error("删除参数失败");
              }
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.getParamsData();
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //   文本框失去焦点  或者按下  Enter 都会触发
    handleInputConfirm(row) {
      if(row.inputValue.trim().length === 0){
        row.inputValue = '';
        row.inputVisible = false;
        return
      }
      // 如果没有return ，则说明输入了内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = '';
      row.inputVisible = false;
      //  需要发起请求，保存这次操作
      let msg = '修改'
      this.saveAttrVals(row, msg)
    },
    //  将对  attr_vals 的操作，保存到数据库中
    saveAttrVals(row, msg) {
      this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      }).then(res => {
        if(res.data.meta.status !== 200){
          return this.$message.error(msg + '参数项失败！')
        }
        this.$message.success(msg + '参数项成功！')
      })
    },
    //  点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //   删除对应参数的可选项
    handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      let msg = '删除'
      this.saveAttrVals(row, msg)
    }
  }
};
</script>

<style lang="scss" socped>
.el-row {
  margin-top: 1.5rem;
}
.el-tag {
  margin: 0.5rem;
}
.input-new-tag {
  width: 12rem;
  margin-left: 0.4rem;
}
.button-new-tag {
  margin-left: 0.4rem;
}
</style>