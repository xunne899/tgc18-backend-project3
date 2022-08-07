const express =require ('express')

const router =express.Router()


router.get('/',function(req,res){
    res.render("landing/index")
})

router.get('/about-us',function(req,res){
    res.render("landing/about-us")
})

router.get('/contact-us',function(req,res){
    res.render("landing/contact-us")
})



module.exports = router;