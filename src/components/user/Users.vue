<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 列表区 -->
      <el-table :data="usersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="closedRoleDialog">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则(不写在return 中，防止变量污染)
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    // 验证邮箱的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[5-7])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机"));
    };
    return {
      //获取用户列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      usersList: [],
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制添加用户对话框的显示与隐藏
      editDialogVisible: false,
      //修改用户信息数据
      editForm: {},
      //修改表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 控制分配角色对话框的显示隐藏
      setRoleDialogVisible: false,
      //  保存所选需要配置角色的用户信息
      userInfo: {},
      //  保存所有角色数据
      rolesList: [],
      //  所选角色
      selectedRoleId: ""
    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    getUsersList() {
      this.$http.get("users", { params: this.queryInfo }).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取用户失败！");
        }
        this.usersList = res.data.data.users;
        this.total = res.data.data.total;
      });
    },
    //
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    // 监听 页码值 的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUsersList();
    },
    // 监听 Switch开关状态的的改变
    userStateChanged(userinfo) {
      this.$http
        .put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        .then(res => {
          if (res.data.meta.status !== 200) {
            userinfo.mg_state = !userinfo.mg_state;
            return this.$message.error("更新用户状态失败");
          }
          this.$message.success("更新用户状态成功");
        });
    },
    // 监听对话框关闭  表单重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(valid => {
        // if(!valid)
        this.$http.post("users", this.addForm).then(res => {
          if (res.data.meta.status !== 201) {
            return this.$message.error("添加用户失败");
          }
          this.$message.success("添加用户成功");
          // 隐藏弹框
          this.addDialogVisible = false;
          this.getUsersList();
        });
      });
    },
    //修改对话框
    showEditDialog(id) {
      this.$http.get("users/" + id).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("查询用户信息失败");
        }
        this.editForm = res.data.data;
        this.editDialogVisible = true;
      });
    },
    // 监听对话框关闭  表单重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户数据，并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put("users/" + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error("修改用户信息失败");
            }
            // 隐藏弹框
            this.editDialogVisible = false;
            this.getUsersList();
            this.$message.success("修改用户信息成功");
          });
      });
    },
    //根据ID 删除用户
    removeUserById(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(res => {
          this.$http.delete("users/" + id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error("删除用户失败");
            }
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.getUsersList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 展示分配角色对话框
    setRole(userInfo) {
      this.userInfo = userInfo;
      //z 展现对话框之前获取所有的角色
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取角色列表失败");
        }
        this.rolesList = res.data.data;
        this.setRoleDialogVisible = true;
      });
    },
    //  点击确定，分配角色
    saveRole() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      this.$http
        .put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error("更新角色失败");
          }
          this.$message.success("更新角色成功");
          //刷新用户数据
          this.getUsersList();
          //关闭弹框
          this.setRoleDialogVisible = false;
        });
    },
    //  监听分配角色对话框 关闭
    closedRoleDialog() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
};
</script>

<style lang="scss" scoped>
</style>