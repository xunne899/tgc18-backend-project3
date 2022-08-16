const express =require ('express')

const router =express.Router()


router.get('/',function(req,res){
        if (req.session.user) {
            res.redirect('/products')
        } else {
            res.redirect('/users/login')
        }
    })




module.exports = router;