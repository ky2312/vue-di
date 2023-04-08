const path = require('path')
const { Project } = require('ts-morph')

main()

async function main() {
  // 这部分内容具体可以查阅 ts-morph 的文档
  // 这里仅需要知道这是用来处理 ts 文件并生成类型声明文件即可
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.type.json'),
  })

  const diagnostics = project.getPreEmitDiagnostics()

  // 输出解析过程中的错误信息
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))

  // 获取项目中的所有源文件
  const sourceFiles = project.getSourceFiles();  

  function countLevel(path) {
    const pList = path.split('/')
    let i = 0
    let _p
    while (_p = pList.pop()) {
      if (_p === 'src') {
        break
      }
      i++
    }
    return i
  }
  function replaceDeclarationFrom(rawStr, level) {
    if (level == 0) return rawStr
    const levelList = new Array(level).fill('..')
    if (levelList.length === 1) {
      levelList[0] = '.'
    } else {
      levelList.shift()
    }
    return rawStr.replace('@', levelList.join('/'))
  }

  sourceFiles.forEach(file => {
    const p = file.getFilePath();
    // console.log(p)

    [...file.getImportDeclarations(), ...file.getExportDeclarations()].forEach(t => {
      const oldFromStr = t.getModuleSpecifierValue()
      if (!oldFromStr.startsWith('@')) return oldFromStr
      const newFromStr = replaceDeclarationFrom(oldFromStr, countLevel(p))
      t.setModuleSpecifier(newFromStr)      
    })
  })

  // 将解析完的文件写到打包路径
  project.emit()
}
