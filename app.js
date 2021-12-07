/* *************************** CONSTANTES INICIAIS *************************** */
require('dotenv').config()
// requerindo o express
const express = require('express')
//instanciando o express
const app = express()
// utilizando o modulo Conexão através da variável client
const client = require('./conexao')
//criando o banco de dados Hospital Rita Lobato
const dbo = client.db('HospitalRitaLobato')
// conectando a porta 3000
const porta = 3000
//requerindo o express Handlebars
const exphbs = require('express-handlebars')
//create é um função do handlebars que cria, através da variável hbs o diretório que representa as partials do projeto
const hbs = exphbs.create({
  partialsDir: 'views/partials'
})



//Para conseguirmos ler uma propriedade do tipo object Id precisamos fazer uma importação.
const ObjectId = require('mongodb').ObjectId
// const { ObjectId } = require('bson')

const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

/* ********************** Módulos para parecer mensagem de problema de login ****************** */
const cookieParser = require("cookie-parser")
const session = require("express-session")
const { eAdmin } = require('./eAdmin')


app.use(cookieParser("secret"))
app.use(session({
  cookie: { maxAge: null }, //pelo que entendi, esses cookies das seções (sessions) armazenam informações na memória do navegador e ficam disponíveis até o navegador ser fechado. Ao colocarmos null dizemos que o cookie será excluído qd a sessão terminar, caso contrário ele ficaria salvo.
  resave: true, //sem esses atributos, aparece mensagem de deprecated no console
  saveUninitialized: true, //sem esses atributos, aparece mensagem de deprecated no console
  secret: 'cookie_secret' //sem esses atributos, aparece mensagem de deprecated no console
}))

app.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

/* ********************** Encriptador de senhas ****************** */
const bcrypt = require("bcrypt")
const saltRounds = 12

//o primeiro parametro indica qual o motor que vamos utilizar, e o segundo indica qual a variável que estamos chamando o nosso motor
app.engine('handlebars', hbs.engine)
//setando o motor de visualização para o handlebars
app.set('view engine', 'handlebars')
// traduz os caracteres especiais que ocorrem entre a comunicação entre o servidor e o usuário. Variável Extended evita mensagem de depreciação
app.use(express.urlencoded({ extended: true }))
//informa que o trafego de dados pode ser via json
app.use(express.json())
// informando que os arquivos estativcos estão no diretório public
app.use(express.static(__dirname + '/public'))

//VAR GLOBAL
global.tipoUser = 'USER'

/* *************************** ROTAS DE RENDERIZAÇÃO *************************** */

//rota para renderizar a página Home
app.get('/', (req, res) => {
  res.render('login')
})

// rota para renderizar a página de cadastro de novos médicos
app.get('/cadastro', eAdmin, (req, res) => {
  res.render('cadastro')
})

// rota para renderizar a página de cadastro de acesso negado
app.get('/acessonegado', eAdmin, (req, res) => {
  res.render('acessonegado')
})


/* *************************** ROTAS DE RENDERIZAÇÃO DA LISTA DE MÉDICOS *************************** */

//Rota para lista de médicos cadastrados -- PARA ADM
app.get('/lista', eAdmin, (req, res) => {
  dbo.collection('Medicos').find({}).toArray((erro, resultado) => {
    if (erro) throw erro
    resultado.sort((a, b) => (a.nome.toLowerCase() > b.nome.toLowerCase()) ? 1 : -1)
    res.render('lista', { resultado })
  })
})

//Rota para lista de médicos cadastrados -- PARA USUARIOS
app.get('/listaUser', (req, res) => {
  dbo.collection('Medicos').find({}).toArray((erro, resultado) => {
    if (erro) throw erro
    resultado.sort((a, b) => (a.nome.toLowerCase() > b.nome.toLowerCase()) ? 1 : -1)
    res.render('listaUser', { resultado })
  })
})

/* *************************** ROTA - ADICIONAR MÉDICOS *************************** */

//Rota POST para cadastro dos médicos no banco de dados
app.post('/addMedicos', eAdmin, (req, res) => {
  //Criando objeto Médicos
  const obj = {
    nome: req.body.nome,
    crm: req.body.crm,
    especialidade: req.body.especialidade2,
    telefone: req.body.telefone,
    email: req.body.email
  }
  //Criando objeto de especialidade
  const especial = {
    angiologia: 'Angiologia',
    cardiologia: 'Cardiologia',
    dermatologia: 'Dermatologia',
    endocrinologia: 'Endocrinologia',
    ginecologia: 'Ginecologia',
    obstetricia: 'Obstetricia'
  }

  //Inserindo na collection Medicos meu objeto Médico
  dbo.collection("Medicos").insertOne(obj, (erro, resultado) => {
    if (erro) throw erro
    console.log('1 médico inserido')
    res.redirect('/lista')
  })

  let especialidade = req.body.especialidade2
  let especMedica = especial[especialidade]

  function adicionarMedicos(parametroEspecialidade) {
    dbo.collection(parametroEspecialidade).insertOne(obj, (erro, resultado) => {
      if (erro) throw erro
      console.log("Médico(a) adicionado(a) na collection: " + parametroEspecialidade)
    })
  }

  //Inserindo nas collections de especialidades conforme selecionado no selection
  switch (especMedica) {
    case 'Angiologia':
      adicionarMedicos('Angiologia')
      break
    case 'Cardiologia':
      adicionarMedicos('Cardiologia')
      break
    case 'Dermatologia':
      adicionarMedicos('Dermatologia')
      break
    case 'Endocrinologia':
      adicionarMedicos('Endocrinologia')
      break
    case 'Ginecologia':
      adicionarMedicos('Ginecologia')
      break
    case 'Obstetricia':
      adicionarMedicos('Obstetricia')
      break
    default:
      console.log('Erro ao cadastrar médico')
  }
})

/* *************************** ROTA - DELETAR MÉDICOS *************************** */

//Rota para lista de médicos cadastrados
app.get('/deletarMedico/:id', eAdmin, (req, res) => {
  let idMedico = req.params.id
  let object_id = new ObjectId(idMedico)

  dbo.collection('Medicos').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('medico deletado')
    res.redirect('/lista')
  })

  dbo.collection('Angiologia').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Angiologista Excluido')
    // res.redirect('/lista')
  })
  dbo.collection('Cardiologia').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Cardiologista Excluido')
    // res.redirect('/lista')
  })
  dbo.collection('Dermatologia').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Dermatologista Excluido')
    // res.redirect('/lista')
  })
  dbo.collection('Endocrinologia').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Endocrinologista Excluido')
    // res.redirect('/lista')
  })
  dbo.collection('Ginecologista').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Ginecologista Excluido')
    // res.redirect('/lista')
  })
  dbo.collection('Obstetricia').deleteOne({ _id: object_id }, (erro, resultado) => {
    if (erro) throw erro
    console.log('Obstetra Excluido')
    // res.redirect('/lista')
  })
})

/* ***************************GET - CRIANDO ROTA - EDITAR MÉDICOS E SUAS RESPECTIVAS ESPECIALIDADES *************************** */

//rota para edição
app.get('/editarMedico/:id', eAdmin, (req, res) => {
  let idMedico = req.params.id
  let obj_id = new ObjectId(idMedico)
  dbo.collection('Medicos').findOne({ _id: obj_id }, (erro, resultado) => {
    if (erro) throw erro
    res.render('editarMedico', { resultado })
  })
})

/* *************************** POST - ROTA DE EDIÇÃO - EDITAR MÉDICOS *************************** */

app.post('/editarMedico', eAdmin, (req, res) => {
  let idMedico = req.body.id
  let object_id = new ObjectId(idMedico)
  dbo.collection('Medicos').updateOne({ _id: object_id }, {
    $set: {
      nome: req.body.nome,
      crm: req.body.crm,
      especialidade: req.body.especialidade,
      telefone: req.body.telefone,
      email: req.body.email
    }
  })

  res.redirect('/lista')

  const obj = {
    nome: req.body.nome,
    crm: req.body.crm,
    especialidade: req.body.especialidade,
    telefone: req.body.telefone,
    email: req.body.email
  }

  const especial = {
    angiologia: 'Angiologia',
    cardiologia: 'Cardiologia',
    dermatologia: 'Dermatologia',
    endocrinologia: 'Endocrinologia',
    ginecologia: 'Ginecologia',
    obstetricia: 'Obstetricia'
  }

  let especialidade = req.body.especialidade

  let especMedica = especial[especialidade]

  function inserirNovaCategoria(especParametro) {
    dbo.collection(especParametro).insertOne(obj, (erro, resultado) => {
      if (erro) throw erro
      console.log('Médico(a) inserido(a) na collection: ' + especParametro)
    })
  }

  switch (especMedica) {
    case 'Angiologia':
      inserirNovaCategoria("Angiologia")
      break
    case 'Cardiologia':
      inserirNovaCategoria("Cardiologia")
      break
    case 'Dermatologia':
      inserirNovaCategoria("Dermatologia")
      break
    case 'Endocrinologia':
      inserirNovaCategoria("Endocrinologia")
      break
    case 'Ginecologia':
      inserirNovaCategoria("Ginecologia")
      break
    case 'Obstetricia':
      inserirNovaCategoria("Obstetricia")
      break
    default:
      console.log('Erro ao inserir médico')
  }

  let especialidadeAnterior = req.body.especAntes

  switch (especialidadeAnterior) {
    case 'angiologia':
      dbo
        .collection('Angiologia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    case 'cardiologia':
      dbo
        .collection('Cardiologia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    case 'dermatologia':
      dbo
        .collection('Dermatologia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    case 'endocrinologia':
      dbo
        .collection('Endocrinologia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    case 'ginecologia':
      dbo
        .collection('Ginecologia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    case 'obstetricia':
      dbo
        .collection('Obstetricia')
        .deleteOne({ _id: object_id }, (erro, resultado) => {
          if (erro) throw erro
          console.log('medico deletado')
        })
      break
    default:
      console.log(especialidadeAnterior)
  }
})



// ********************************* Usuario **********************************

app.get('/usuario', eAdmin, (req, res) => {
  res.render('usuario')
})

app.post('/addUsuario', eAdmin, (req, res, next) => {

  bcrypt.hash(req.body.senhaUsuario, saltRounds)
    .then(function (senhaHash) {
      const cadastroUsuario = {
        perfil: req.body.escolhaPerfil,
        nome: req.body.nomeUsuario,
        funcao: req.body.funcaoUsuario,
        login: req.body.loginUsuario,
        senha: senhaHash
      }
      // console.log(req.body.senhaUsuario) PARA TESTE
      // console.log(senhaHash) PARA TESTE

      dbo.collection('usuario').insertOne(cadastroUsuario, (erro, resultado) => {
        if (erro) throw erro
        console.log('um usuario inserido')
        res.redirect("/listaUsuario")
      })
    })

    .catch((erro) => {
      if (erro) console.log(erro)
      next()
    })
})

app.get('/listaUsuario', eAdmin, (req, res) => {
  dbo.collection('usuario').find({}).toArray((erro, resultadoUsuario) => {
    if (erro) throw erro
    resultadoUsuario.sort((a, b) => (a.nome.toLowerCase() > b.nome.toLowerCase()) ? 1 : -1)
    res.render('listaUsuario', { resultadoUsuario })
  })
})

app.get('/deletarUsuario/:id', eAdmin, (req, res) => {
  const idItem = req.params.id
  const obj_id = new ObjectId(idItem)

  dbo.collection('usuario').deleteOne({ _id: obj_id }, (erro, resultado) => {
    if (erro) throw erro
    res.redirect('/listaUsuario')
  })
})

// *****************************LOGIN********************************

app.get('/login', (req, res) => {
  res.render('login')
})

//verificação do login
app.post('/verificaLogin', async (req, res) => {

  const perfil = req.body.escolhaLogin
  const login = req.body.usuario
  const senha = req.body.senha

  //check if user exists
  const user = await dbo.collection('usuario').findOne({ login: login, perfil: perfil })

  //checar se o usuário existe no BD (considerando login + perfil -- ou seja, um usuário registrado como ADM que tente logar como USER será acusado de não existir, e vice-versa)
  if (!user) {
    req.session.message = {
      intro: "Falha ao logar. ",
      message: "Usuário e/ou senha não cadastrados"
    }
    return res.redirect('/login')
  }

  //variável para checar se a senha digitada é igual à senha do BD
  const checkPassword = await bcrypt.compare(senha, user.senha)

  //caso não seja igual
  if (!checkPassword) {
    req.session.message = {
      intro: "Falha ao logar. ",
      message: "Usuário e/ou senha não cadastrados"
    }
    return res.redirect('/login')
  }

  //caso seja igual
  try {
    if (perfil == "Administrativo") { //se caiu aqui é um ADM
      global.tipoUser = 'ADM'
      return res.redirect('/lista')
    } else if (perfil == "Usuário") {
      global.tipoUser = 'USER'
      res.redirect('/listaUser')
    }
  } 
  
  //neste caso, o erro não irá se referir ao login -- uma vez que já tratamos o usuario + perfil, bem como as senhas
  catch (error) {
    //Imprimir erro no console
    console.log(error)

    //Mensagem para o usuário
    req.session.message = {
      intro: "Falha ao logar. ",
      message: "Aconteceu um erro no servidor, tente novamente mais tarde!!"
    }
    return res.redirect('/login')
  }
})


// *****************************Porta********************************

app.listen(porta, () => {
  console.log(`Servidor rodando no caminho http://localhost:${porta}`)
})