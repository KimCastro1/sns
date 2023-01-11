const express = require('express');
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');
const {Post, User, Hashtag} = require('../models');

const router = express.Router();

router.use((req,res,next)=>{
    res.locals.user = req.user;
    res.locals.followerCount = req.user?req.user.Followers.length:0;
    res.locals.followingCount = req.user?req.user.Followings.length:0;;
    res.locals.followerIdList = req.user?req.user.Followings.map(f=>f.id):[];
    next();
});

router.get('/profile',isLoggedIn,(req,res)=>{
    res.render('profile',{title:'My-profile, sns web service'});
});

router.get('/join',isNotLoggedIn,(req,res)=>{
    res.render('join', {tilte: 'sign-up, sns web service'});
});

router.get('/', async (req,res,next)=>{
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id','nick'],
            },
            order: [['createAt', 'DESC']],
        });
        res.render('main',{
            tilte: 'Welcome, sns web service',
            comments: posts,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/hashtag', async(req,res,next)=>{
    const query=req.query.hashtag;
    if(query){
        return res.redirect('/');
    }
    try {
        const hashtag=await Hashtag.findOne({where:{title:query}});
        let comments=[];
        if(hashtag){
            comments=await hashtag.getPosts({include:[{model:User}]});
        }
        return res.render('main',{
            title: `${query} | SNS service`,
            comments: comments,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;