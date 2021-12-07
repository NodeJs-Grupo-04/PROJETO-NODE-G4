// conexão com o banco de dados para o MongoDB
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

const mongodb = require('mongodb').MongoClient
const url = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.4nobf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`


// instanciando client para usar o MongoDB
const client = new mongodb(url)

// função assincrona para estruturar a conexão com o banco de dados
async function run() {
  try {
    await client.connect()
    console.log('Estamos conectados ao Banco de Dados Atlas-MongoDB')
  } catch (erro) {
    console.log(erro)
  }
}
// para executar a função para conexão com a banco de dados
run()
// deixa o modulo conexão.js público, assim acessível ao restante da aplicação
module.exports = client

