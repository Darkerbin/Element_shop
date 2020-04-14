//  这是项目发布阶段需要用到的 babel 插件
const prodPlugin = []
if(process.env.NODE_ENV === 'production') {
  prodPlugin.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ...prodPlugin
  ]
}
