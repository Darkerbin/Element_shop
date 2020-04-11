<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域  -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeAuthorityById(scope.row, item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '':'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeAuthorityById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeAuthorityById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showAuthoretyDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 展示分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setAuthorityDialogVisible"
      width="50%"
      @close="authorityDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        default-expand-all
        ref="treeRef"
        node-key="id"
        show-checkbox
        :default-checked-keys="defKeys"
        :data="allAuthorityListL"
        :props="treeProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setAuthorityDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setAuthority">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色数据
      rolesList: [],
      //控制分配权限对话框显示隐藏
      setAuthorityDialogVisible: false,
      //保存所有权限数据
      allAuthorityListL: [],
      //树形控件 属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中的节点的
      defKeys: [],
      // 点的的角色 id
      roleid: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    getRolesList() {
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取角色列表失败");
        }
        this.rolesList = res.data.data;
        console.log(this.rolesList);
      });
    },
    //根据Id 删除权限
    removeAuthorityById(role, authorityId) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${authorityId}`)
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error("删除权限失败");
              }
              role.children = res.data.data;
              this.$message({
                type: "success",
                message: "删除成功!"
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 分配权限
    showAuthoretyDialog(role) {
      //获取所有权限的数据
      this.$http.get("rights/tree").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取权限数据失败");
        }
        this.allAuthorityListL = res.data.data;
        this.roleid = role.id;
        // 递归获取三级节点的 id
        // debugger
        this.getLeafKeys(role, this.defKeys);

        this.setAuthorityDialogVisible = true;
      });
    },
    // 通过递归的形式，获取权限下所有三级权限的 id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听 分配权限 弹框关闭
    authorityDialogClosed() {
      // 清空数组
      this.defKeys = [];
    },
    // 点击确定，设置权限
    setAuthority() {
      const keys = [
        ...this.$refs.treeRef.getCheckedNodes(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ];
      const idStr = keys.join(",");
      this.$http
        .post(`roles/${this.roleid}/rights`, { rids: idStr })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error("分配权限失败");
          }
          this.$message.success("分配权限成功");
          // 成功之后刷新权限列表
          this.getRolesList();
          // 设置弹框关闭
          this.setAuthorityDialogVisible = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 1rem;
}
.bdbottom {
  border-bottom: 1 solid #000;
}
.bdtop {
  border-top: 1 solid #000;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>