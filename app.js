
const express = require("express");
const servidor = express();


servidor.set("view engine","ejs");

//Módulo responsável por analisar/converter informação emitida por formulários, em especial no envio de ficheiros
//instalação: npm install formidable
//+ info em: https://github.com/node-formidable/formidable
const formidable = require('formidable');
const fs = require('fs');

//Define a pasta onde estarão os ficheiros estáticos, ou seja, imagens, folhas de estilo, etc...
servidor.use(express.static("ficheiros"));


//Importa o módulo MongoDB 
const MongoClient = require('mongodb').MongoClient;

//Guarda na constnnte "uri" a morada da BD e respectivas credenciais
const uri = "mongodb+srv://user1:esmad2019@cluster0-o3xef.gcp.mongodb.net/test?retryWrites=true&w=majority";

//Guarda na constante "client" o construtor que tratará da ligação à BD 
const client = new MongoClient(uri, { useUnifiedTopology: true });

//Establece a ligação à BD e caso haja um erro guarda-o no "err"
client.connect(err => {
  //Imprime na consola o erro, caso este exista
  if(err){console.log(err)};

  servidor.listen(3333,function () {
    console.log("Servidor ligado!");
  })

  //Guarda na constante "collection" o caminho para os dados, ou seja, a BD e a coleção onde estes se encontram
  const collectionProdutos = client.db("loja").collection("produtos");


////////// MENU INICIAL //////////////////////// 
  servidor.get("/",function (req,res) {
      res.render("index");
  })
//------------------------------------------//


////////// LISTA DE ITENS CARREGADOS //////////////////////// 
servidor.get("/lista-produtos",function (req,res) {
  collectionProdutos.find({}).toArray(function (erro,resultado){
  res.render("lista",{dados:resultado});
  })
})
//------------------------------------------//


servidor.post("/upload",function (req,res) {
    //Define um objeto que irá conter os métodos do módulo "formidable"
    let formulario = new formidable.IncomingForm();

    //Analisa uma solicitação do pedido (req) com os dados do formulário.
    //Se o retorno de chamada (callback) for fornecido, todos os campos e arquivos são disponibilizados para o callback.
    formulario.parse(req, function (err, fields, files) {

        //Caminho para o ficheiro que será carregado
        let origem = files.ficheiro.filepath;

        //Gera o número de milissegundos desde 1 de janeiro de 1970
        let seloTemporal = (new Date()).getTime();

        //Gera um número aleatório entre 0 e 9999
        let aleatorio = parseInt(Math.random() * 9999);

        //Nome do ficheiro com um selo temportal e número aleatório de forma a reduzir drasticamente as probabilidades de termos nomes de ficheiros iguais
        var nome_ficheiro = seloTemporal + aleatorio + files.ficheiro.originalFilename;
        //Caminho para onde o ficheiro será transferido, concatenado com o nome que pretendemos atribuir.
        var local_nome_ficheiro = 'C:/NODEJS/upload_bd/ficheiros/' + nome_ficheiro;

        var novoProduto = {
          nome: fields.nome,
          ficheiro: nome_ficheiro
        }
       
        collectionProdutos.insertOne(novoProduto,function (){
         
          fs.copyFile(origem, local_nome_ficheiro, function (err) {
            if (err) throw err;
            res.redirect("/lista-produtos");
            //res.write('Ficheiro carregado!');
            res.end();
          });
          
        })
    });
  

})

})
