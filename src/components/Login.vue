<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="头像">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :rules="rules" :model="loginForm" label-width="0px" class="login_form">
                <el-form-item prop="usename">
                    <el-input v-model="loginForm.usename" prefix-icon="el-icon-user-solid" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-unlock" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            //这是登陆表单的数据绑定对象
            loginForm: {
                usename:'admin',
                password:'123456'
            },
            rules: {
                usename: [
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 1, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    methods: {
        resetLoginForm(){
            //点击重置
            this.$refs.loginFormRef.resetFields();
        },
        login(){
            this.$refs.loginFormRef.validate( async valid => {
                if (!valid) return;
                const { data:res} = await this.$http.get('login?username='+ this.loginForm.usename +'&password='+this.loginForm.password)
                // console.log(res)
                if(res.meta.status !== 200){
                    return this.$message.error("登录失败")
                }else{
                    this.$message.success("登录成功")
                    window.sessionStorage.setItem("token",res.data.token);
                    this.$router.push('/home')
                };
                
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100vh;
    .login_box{
        width: 45rem;
        height: 30rem;
        background-color: #fff;
        border-radius: .3rem;
        position: absolute;
        left: 50%;
        top:50%;
        transform: translate(-50%,-50%);
        
        .avatar_box {
            width: 10rem;
            height: 10rem;
            border-radius: 50%;
            border: .1rem solid #eee;
            padding: 1rem;
            box-shadow: 0 0 1rem #2b4b6b;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 2rem;
        box-sizing: border-box;
    }
    .btns {
        display: flex;
        justify-content: flex-end;
    }
}
</style>