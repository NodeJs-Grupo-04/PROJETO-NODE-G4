module.exports = {
    eAdmin: function(req,res,next){
        if(global.tipoUser == "ADM"){
            return next()
        }else{
            res.status(403).render("acessonegado")
        }
    }
  }